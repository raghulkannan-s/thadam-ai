'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationProps {
  fire: boolean;
  onComplete?: () => void;
}

export function Celebration({ fire, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<Array<{ 
    id: number; 
    x: number; 
    color: string;
    driftX1: number;
    driftX2: number;
    scaleMax: number;
    rotate1: number;
    rotate2: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    if (fire) {
      // Generate 50 random particles
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
      const newParticles = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // random start X position percentage
        color: colors[Math.floor(Math.random() * colors.length)],
        driftX1: Math.random() * 20 - 10,
        driftX2: Math.random() * 40 - 20,
        scaleMax: Math.random() * 0.5 + 0.5,
        rotate1: Math.random() * 360,
        rotate2: Math.random() * 720,
        duration: Math.random() * 1 + 2
      }));
      setParticles(newParticles);

      // Clean up after animation
      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [fire, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 1, 
              y: '50vh', 
              x: `${particle.x}vw`, 
              scale: 0 
            }}
            animate={{
              opacity: [1, 1, 0],
              y: ['50vh', '-10vh', '100vh'], // Shoot up, then fall down
              x: [
                `${particle.x}vw`, 
                `${particle.x + particle.driftX1}vw`, // Drift horizontally
                `${particle.x + particle.driftX2}vw`
              ],
              scale: [0, particle.scaleMax, 0],
              rotate: [0, particle.rotate1, particle.rotate2],
            }}
            transition={{
              duration: particle.duration,
              ease: "easeOut",
              times: [0, 0.2, 1]
            }}
            className="absolute h-3 w-3 rounded-sm"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
      
      <AnimatePresence>
        {fire && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute text-center bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl shadow-black/50"
          >
            <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
              Milestone Reached! 🎉
            </h2>
            <p className="text-white/80 font-medium">You are crushing it. Keep the streak alive!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
