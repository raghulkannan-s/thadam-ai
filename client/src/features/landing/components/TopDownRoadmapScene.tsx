"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Line, useGLTF } from "@react-three/drei";
import { useScroll, useSpring, useVelocity, useTransform } from "framer-motion";
import * as THREE from "three";

// Preload the model
useGLTF.preload("/models/jet.glb");

function useTakeoff() {
  const [takingOff, setTakingOff] = useState(false);

  useEffect(() => {
    const handleTakeoff = () => {
      setTakingOff(true);
      document.body.classList.add("takeoff-active");
    };
    window.addEventListener("thadam-takeoff", handleTakeoff);
    return () => {
      window.removeEventListener("thadam-takeoff", handleTakeoff);
      document.body.classList.remove("takeoff-active");
    };
  }, []);

  return takingOff;
}

// ─── Real 3D Jet Component ───
function RealJet({ bankAngle, pitchAngle, takingOff, scrollYProgress }: { bankAngle: any, pitchAngle: any, takingOff: boolean, scrollYProgress: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/jet.glb");
  const takeoffProgress = useRef(0);
  const initialTakeoffScale = useRef<number | null>(null);

  // Traverse the scene to ensure premium materials
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // We preserve the original color so the subtle blue accents remain visible!
        const origColor = (child.material as THREE.MeshStandardMaterial).color || new THREE.Color("#ffffff");

        child.material = new THREE.MeshPhysicalMaterial({
           color: origColor,
           metalness: 0.2,
           roughness: 0.1,
           clearcoat: 1.0,
           clearcoatRoughness: 0.1,
           envMapIntensity: 2.0 // Boost reflections
        });
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (takingOff) {
        if (initialTakeoffScale.current === null) {
          initialTakeoffScale.current = groupRef.current.scale.x;
        }

        // Slower 3.0s takeoff sequence to show the full flight gracefully but faster
        takeoffProgress.current += delta;
        const t = Math.min(takeoffProgress.current * (1 / 3.0), 1); // 0 to 1
        
        // 1. Scale: Smoothly grow from EXACTLY its current size when the button was clicked
        const easeScale = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // Smooth ease in out
        const startScale = initialTakeoffScale.current;
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(startScale, 12.0, easeScale));
        
        // 2. Z/Y position: Stay comfortably in view rather than crashing into the camera
        groupRef.current.position.z = THREE.MathUtils.lerp(0, 2.0, easeScale);
        groupRef.current.position.y = THREE.MathUtils.lerp(0, -4.0, easeScale);
        
        // 3. X position (The Sweep):
        
        let targetX = 0;
        let bankZ = 0; // This controls YAW (nose left/right)
        let pitchX = 0; // Flat pitch (0 = parallel to ground)
        let yawY = 0; // This controls ROLL (banking into turns)

        if (t < 0.4) {
          // Fly Left: Point nose Left (-X) - Slower flight out
          const localT = t / 0.4;
          // Use easeInOut so it starts SLOWLY from zero velocity instead of jumping
          const smoothStart = localT < 0.5 ? 2 * localT * localT : 1 - Math.pow(-2 * localT + 2, 2) / 2;
          targetX = THREE.MathUtils.lerp(0, -25, smoothStart); // Fly much further left
          bankZ = THREE.MathUtils.lerp(0, -Math.PI / 2, smoothStart); // Yaw from -Y to -X
          yawY = THREE.MathUtils.lerp(0, Math.PI / 8, smoothStart); // Roll into the turn
        } else if (t < 0.55) {
          // U-Turn: Quickly swing nose from Left (-X) to Right (+X) further off screen - FAST return
          const localT = (t - 0.4) / 0.15;
          const easeInOut = localT < 0.5 ? 2 * localT * localT : 1 - Math.pow(-2 * localT + 2, 2) / 2;
          targetX = THREE.MathUtils.lerp(-25, -10, easeInOut); // Keep the U-turn heavily on the left side
          
          bankZ = THREE.MathUtils.lerp(-Math.PI / 2, Math.PI / 2, easeInOut); // Sweep nose Left to Right
          yawY = THREE.MathUtils.lerp(Math.PI / 8, -Math.PI / 8, easeInOut); // Roll sweep
        } else {
          // Fly away: Slowly and majestically cross the full screen from left to right
          const localT = (t - 0.55) / 0.45;
          // Linear movement looks better for a long flyaway than aggressive easing
          targetX = THREE.MathUtils.lerp(-10, 40, localT); // extended right flight
          
          bankZ = Math.PI / 2; // Nose stays pointing precisely RIGHT (+X)
          yawY = THREE.MathUtils.lerp(-Math.PI / 8, 0, localT); // Level out the roll as it flies away
        }
        
        groupRef.current.position.x = targetX;
        groupRef.current.rotation.z = bankZ;
        groupRef.current.rotation.x = pitchX;
        groupRef.current.rotation.y = yawY;
      } else {
        // Continuous scale growth: starts at 1.5 in Hero section, grows to 5.0 at Launch section
        const progressScale = THREE.MathUtils.lerp(1.5, 5.0, scrollYProgress.get());
        groupRef.current.scale.setScalar(progressScale);

        // Normal flight physics
        const currentBank = bankAngle.get() * (Math.PI / 180);
        const currentPitch = pitchAngle.get() * (Math.PI / 180);
        
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -currentBank, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, currentPitch, 0.1);
        
        // Remove the Z hop so it continuously stays level while scaling up
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.2);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 
        We rotate the aircraft to face -Y (down the screen visually).
        -Math.PI / 2 pitches the original inverted model up, and Math.PI rolls it 180 deg to point down right-side up.
      */}
      <primitive 
        object={scene} 
        scale={1.0} // Scale is now dynamically managed by the groupRef in useFrame
        rotation={[-Math.PI / 2, 0, Math.PI]} // Perfected orientation: Nose points -Y, top faces +Z
      />
    </group>
  );
}

// ─── Path and Environment ───
function JourneyScene({ scrollYProgress, takingOff }: { scrollYProgress: any, takingOff: boolean }) {
  const pathRef = useRef<THREE.Group>(null);
  const takeoffVelocity = useRef(0);

  useFrame((state, delta) => {
    if (pathRef.current) {
      if (takingOff) {
        // Blur the ground/path backwards extremely fast
        takeoffVelocity.current += delta * 100;
        pathRef.current.position.y += takeoffVelocity.current;
      } else {
        const distance = 200; // Drastically increased distance between sections
        // We move the path UP (+Y) so the aircraft visually travels DOWN (-Y)
        pathRef.current.position.y = (scrollYProgress.get() * distance);
      }
    }
  });

  const nodes = 4;
  const distance = 200;
  const step = distance / (nodes - 1);

  const points = [];
  for (let i = 0; i < nodes; i++) {
    // Nodes generated downwards (-Y)
    points.push(new THREE.Vector3(0, -i * step, 0));
  }

  // Active node index based on progress
  const activeNodeIndex = Math.round(scrollYProgress.get() * (nodes - 1));

  return (
    <>
      <group ref={pathRef}>
        {/* Glowing Runway Center Beam */}
        <mesh position={[0, -(nodes - 1) * step / 2, -0.5]}>
          <planeGeometry args={[1.5, (nodes - 1) * step + 10]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Left Flight Path Boundary */}
        <Line
          points={points.map(p => new THREE.Vector3(p.x - 0.75, p.y, p.z))}
          color="#3b82f6"
          lineWidth={1}
          transparent
          opacity={0.15}
        />
        
        {/* Right Flight Path Boundary */}
        <Line
          points={points.map(p => new THREE.Vector3(p.x + 0.75, p.y, p.z))}
          color="#3b82f6"
          lineWidth={1}
          transparent
          opacity={0.15}
        />
        
        {/* Center Dashed Runway Line */}
        <Line
          points={points}
          color="#3b82f6"
          lineWidth={2}
          transparent
          opacity={0.3}
          dashed
          dashScale={20}
          dashSize={2}
          dashOffset={0}
        />
        
        {Array.from({ length: nodes }).map((_, i) => {
          const isActive = i === activeNodeIndex;
          const isPassed = i < activeNodeIndex;
          return (
            <group key={i} position={[0, -i * step, 0]}>
              {/* Nodes are moved to Z = -0.1 to render UNDER the aircraft, removing the visual block */}
              <mesh position={[0, 0, -0.1]}>
                <circleGeometry args={[0.3, 32]} />
                <meshBasicMaterial color={isActive || isPassed ? "#3b82f6" : "#cbd5e1"} />
              </mesh>
              {isActive && (
                <mesh position={[0, 0, -0.11]}>
                  <circleGeometry args={[0.6, 32]} />
                  <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
      
      <ContactShadows
        position={[0, 0, -1.5]}
        opacity={0.6}
        scale={20}
        blur={2.5}
        far={4}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function TopDownRoadmapScene({ containerRef }: Props) {
  const { scrollYProgress } = useScroll({ container: containerRef });
  const takingOff = useTakeoff();

  // Create a cinematic spring so the jet glides to its destination,
  // gradually rising and getting bigger. Higher stiffness = faster flight.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70, // Increased for a faster glide
    damping: 25,   // Smooth deceleration
    mass: 1.0,
  });

  const scrollVelocity = useVelocity(smoothProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 100, // Heavy damping to prevent jitter from fast scroll snapping
    stiffness: 80,
  });

  const bankAngle = useTransform(smoothVelocity, [-1, 0, 1], [15, 0, -15]);
  const pitchAngle = useTransform(smoothVelocity, [-1, 0, 1], [-5, 0, 5]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: takingOff ? "100vw" : "50vw",
        height: "100vh",
        zIndex: 10,
        pointerEvents: "none",
        transition: "width 0.5s ease-out",
      }}
      className="aircraft-journey-column"
    >
      <Canvas
        camera={{ position: [0, -10, 8], fov: 45, rotation: [0.8, 0, 0] }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, -10, 20]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
             <RealJet bankAngle={bankAngle} pitchAngle={pitchAngle} takingOff={takingOff} scrollYProgress={smoothProgress} />
          </Float>
        </Suspense>

        <JourneyScene scrollYProgress={smoothProgress} takingOff={takingOff} />
      </Canvas>
    </div>
  );
}
