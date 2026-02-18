"use client";

import Intro from "@/components/intro";

import AboutSection from "@/components/about-section";
import ServicesSection from "@/components/services-section";
import ProcessSection from "@/components/process-section";
import CoreValuesSection from "@/components/core-values-section";
import ManifestoSection from "@/components/manifesto-section";

import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
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

        <Intro />
        
        {/* Content wrapper */}
        <div className="relative z-0 flex flex-col min-h-screen">
          


         
          {/* Spacer to reveal fixed hero */}
          <div className="w-full min-h-screen"></div>

          {/* New About Section sliding up */}
          <AboutSection />
     
          
      
          {/* Services Section */}
          <ServicesSection />

          {/* Manifesto Section */}
          <ManifestoSection />
          
          {/* Core Values Section */}
          <CoreValuesSection />

          {/* Process Section */}
          <ProcessSection />
        </div>
      </div>
    </main>
  );
}
