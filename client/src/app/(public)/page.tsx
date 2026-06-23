"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import "@/features/landing/landing.css";
import { LandingNavbar } from "@/features/landing";
import HeroSection from "@/features/landing/components/HeroSection";
import TopDownRoadmapScene from "@/features/landing/components/TopDownRoadmapScene";
import {
  GenerateSection,
  CustomizeSection,
  LearnSection,
  TrackProgressSection,
  CommunitySection,
  FinalCTASection
} from "@/features/landing/components/TopDownSections";

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.push("/home");
    }
  }, [user, status, router]);

  return (
    <div className="landing-page" ref={scrollRef} style={{ position: "relative" }}>
      {/* Background Roadmap Animation */}
      <TopDownRoadmapScene containerRef={scrollRef} />
      
      {/* Content Layer */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <LandingNavbar />
        
        <HeroSection />
        <GenerateSection />
        <CustomizeSection />
        <LearnSection />
        <TrackProgressSection />
        <CommunitySection />
        <FinalCTASection />
      </div>
    </div>
  );
}
