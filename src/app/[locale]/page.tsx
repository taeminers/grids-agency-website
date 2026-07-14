"use client";

import Intro from "@/components/intro";

import ProcessSection from "@/components/process-section";
import ServicesSection from "@/components/services-section";

import AboutSection from "@/components/about-section";
import HeroBackground from "@/components/hero-background";
import HeroContent from "@/components/hero-content";
import ManifestoSection from "@/components/manifesto-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      <div className="text-foreground">
        {/* Background Shader - Fixed Layer */}
        <HeroBackground />

        <Intro />
        
        {/* Content wrapper */}
        <div className="relative z-0 flex flex-col min-h-screen">
          
         
          {/* Spacer to reveal fixed hero */}
          <div className="w-full min-h-screen relative">
             <HeroContent />
          </div>

          {/* New About Section sliding up */}
          <AboutSection />
     
          
      
          {/* Services Section */}
          <ServicesSection />

          {/* Manifesto Section */}
          <ManifestoSection />
          
          {/* Core Values Section */}

          {/* Process Section */}
          <ProcessSection />
        </div>
      </div>
    </main>
  );
}
