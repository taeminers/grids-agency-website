"use client";

import { useState, useCallback } from "react";
import Intro from "@/components/intro";
import Navbar from "@/components/navbar";

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
          


         
          <section className="h-[50vh] flex items-end justify-center pb-20">
            {/* This area is visually reserved for the "GRIDS AGENCY" text to settle over */}
          </section>
        </div>
      </div>
    </main>
  );
}
