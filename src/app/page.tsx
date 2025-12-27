"use client";

import { HeroRobot } from "../components/hero-robot";
import ScrollExpansionVideo from "@/components/ui/scroll-expansion-video";
import { LoadingScreen } from "../components/loading-screen";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} minDuration={2000} />}

      <div
        className={`w-full transition-opacity duration-700 ${isLoading ? "opacity-0" : "opacity-100"
          }`}
      >
        {/* Hero section with robot - no background here, let global bg show */}
        <HeroRobot />

        {/* Add spacing below the robot, then the scroll-expanding video */}
        <div className="mt-12 md:mt-20 lg:mt-28">
          <ScrollExpansionVideo mediaSrc="/videos/logo-reveal.mp4" title="TechSolstice'26 — Reveal" scrollToExpand="Scroll to expand" />
        </div>
      </div>
    </>
  );
}