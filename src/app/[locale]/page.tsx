"use client";

import { useCallback, useRef, useState } from "react";
import Intro from "@/components/intro";
import StudioIntroduction from "@/components/studio-introduction";
import AboutSection from "@/components/about-section";
import HeroContent from "@/components/hero-content";
import HeroGridBackground from "@/components/hero-grid-background";
import Navbar from "@/components/navbar";
import ManifestoSection from "@/components/manifesto-section";
import FaqSection from "@/components/faq-section";
import { useScrollReveals } from "@/hooks/use-scroll-reveals";

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  useScrollReveals(heroRef);
  const revealContent = useCallback(() => setRevealed(true), []);

  return (
    <main className="min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      <div
        ref={heroRef}
        data-hero-pending={!revealed}
        className="group/hero relative flow-root"
      >
        {/* Keep the fixed navbar outside the hero's sticky stacking context. */}
        <Navbar inHero />
        {/* The introduction and About scroll over the stationary hero. */}
        <div className="sticky top-0 min-h-screen bg-background pb-section motion-reduce:relative">
          <HeroGridBackground />
          <HeroContent />
        </div>

        <div
          id="about"
          className="relative z-10 flex flex-col scroll-mt-6 bg-background"
        >
          <StudioIntroduction />
          <AboutSection />
          <ManifestoSection />
          <FaqSection />
        </div>
      </div>
      {/* Attach the hero ref before Intro's layout effect reads it. */}
      <Intro contentRef={heroRef} onReveal={revealContent} />
    </main>
  );
}
