"use client";

import Intro from "@/components/intro";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      <Intro />
      
      {/* Content wrapper - initially hidden for animation */}
      <div className="relative z-0 flex flex-col min-h-screen">
        
        {/* Navbar Placeholder */}
        <header className="fixed top-0 w-full p-6 flex justify-between items-center z-40 reveal-content opacity-0 translate-y-[-20px]">
          <div className="font-bold text-xl tracking-tight">GRIDS</div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
             <a href="#" className="hover:text-foreground transition-colors">Work</a>
             <a href="#" className="hover:text-foreground transition-colors">About</a>
             <a href="#" className="hover:text-foreground transition-colors">Services</a>
             <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <button className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Let's Talk
          </button>
        </header>

        {/* Hero Section / Top Half */}
        <section className="flex-1 flex flex-col items-center justify-center p-10 pt-32 text-center space-y-8">
           <div className="reveal-content opacity-0 translate-y-[20px] space-y-4 max-w-3xl">
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
