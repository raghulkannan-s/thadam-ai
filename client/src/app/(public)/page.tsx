"use client";

import { useRef } from "react";
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
