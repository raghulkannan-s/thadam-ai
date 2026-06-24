"use client";

import { useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import "@/features/landing/landing.css";
import { LandingNavbar } from "@/features/landing";
import HeroSection from "@/features/landing/components/HeroSection";
import TopDownRoadmapScene from "@/features/landing/components/TopDownRoadmapScene";
import {
  CreatePathSection,
  LearnTrackSection,
  CommunitySection,
  FinalCTASection
} from "@/features/landing/components/TopDownSections";

import { Suspense } from "react";

function HomeContent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, status } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    // If the user is logged in, redirect them to the dashboard automatically.
    // However, if they explicitly clicked the Logo inside the app, it adds ?view=landing to let them bypass this redirect.
    if (status === "authenticated" && user && searchParams.get("view") !== "landing") {
      router.push("/home");
    }
  }, [user, status, router, searchParams]);

  return (
    <div className="landing-page" ref={scrollRef} style={{ position: "relative" }}>
      {/* Background Roadmap Animation */}
      <TopDownRoadmapScene containerRef={scrollRef} />
      
      {/* Content Layer */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <LandingNavbar />
        
        <HeroSection />
        <CreatePathSection />
        <LearnTrackSection />
        <CommunitySection />
        <FinalCTASection />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
