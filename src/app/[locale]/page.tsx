"use client";

import { useState, useCallback } from "react";
import Intro from "@/components/intro";
import Navbar from "@/components/navbar";
import AboutSection from "@/components/about-section";
import ServicesSection from "@/components/services-section";
import ProcessSection from "@/components/process-section";
import CoreValuesSection from "@/components/core-values-section";
import VideoSection from "@/components/video-section";
import FooterSection from "@/components/footer-section";

import { cn } from "@/lib/utils";

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  
  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      <Navbar 
        className={cn(
          "transition-all duration-1000 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-[100px]"
        )} 
      />
      <div className="text-foreground">
        {/* Background Video - Fixed Layer */}
        <div className="fixed inset-0 z-0 bg-background">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover invert dark:invert-0"
            >
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
        </div>

        <Intro onReveal={handleReveal} />
        
        {/* Content wrapper */}
        <div className="relative z-0 flex flex-col min-h-screen">
          


         
          {/* Spacer to reveal fixed hero */}
          <div className="w-full min-h-screen"></div>

          {/* New About Section sliding up */}
          {/* New About Section sliding up */}
          <AboutSection />
     
          
          {/* Video Showcase */}
          <VideoSection />
     
          {/* Services Section */}
          <ServicesSection />
          
          {/* Core Values Section */}
          <CoreValuesSection />

          {/* Process Section */}
          <ProcessSection />
          {/* Footer */}
          <FooterSection />
        </div>
      </div>
    </main>
  );
}
