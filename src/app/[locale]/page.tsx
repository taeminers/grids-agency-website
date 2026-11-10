"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import AboutSection from "@/components/about-section";
import HeroContent from "@/components/hero-content";
import Navbar from "@/components/navbar";
import FaqSection from "@/components/faq-section";
import { useScrollReveals } from "@/hooks/use-scroll-reveals";
import ScrollStatement from "@/components/scroll-statement";
import HomeOfferings from "@/components/home-offerings";
import HomeApproach from "@/components/home-approach";
import spacing from "@/components/home-spacing.module.css";

export default function Home() {
  const locale = useLocale();
  const t = useTranslations("HomeStatement");
  const heroRef = useRef<HTMLDivElement>(null);
  useScrollReveals(heroRef);

  return (
    <main className={`${spacing.page} min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground`}>
      <div
        ref={heroRef}
        className="relative flow-root"
      >
        <Navbar inHero />
        <HeroContent />
        <ScrollStatement text={t("text")} locale={locale} />
        <div className={spacing.contentSheet}>
        <HomeOfferings />
        <HomeApproach />

        <div
          id="about"
          className="relative z-10 flex flex-col scroll-mt-6 bg-background"
        >
          <AboutSection />
          <FaqSection />
        </div>
        </div>
      </div>
    </main>
  );
}
