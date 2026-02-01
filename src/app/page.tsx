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
      <Intro onReveal={handleReveal} />
      
      {/* Content wrapper */}
      <div className="relative z-0 flex flex-col min-h-screen">
        
        {/* Navbar - Slides down */}
        <Navbar 
          className={cn(
            "transition-all duration-1000 ease-out",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-[100px]"
          )} 
        />

        {/* Hero Section / Top Half - Fades in & slides up */}
        <section className="flex-1 flex flex-col items-center justify-center p-10 pt-32 text-center space-y-8">
           <div 
            className={cn(
              "space-y-4 max-w-3xl transition-all duration-1000 ease-out delay-200",
              revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[20px]"
            )}
           >
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-none">
                We craft digital <br/>
                <span className="text-tertiary">experiences</span> that matter.
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                A design-driven production studio focused on telling your story through motion, interaction, and clean typography.
              </p>
           </div>
        </section>

        {/* Space for the "GRIDS AGENCY" to land in the lower half */}
        <section className="h-[50vh] flex items-end justify-center pb-20">
          {/* This area is visually reserved for the "GRIDS AGENCY" text to settle over */}
        </section>
      </div>
    </main>
  );
}
