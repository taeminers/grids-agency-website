"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import AboutSection from "@/components/about-section";
import HeroContent from "@/components/hero-content";
import Navbar from "@/components/navbar";
import ManifestoSection from "@/components/manifesto-section";
import FaqSection from "@/components/faq-section";
import { useScrollReveals } from "@/hooks/use-scroll-reveals";
import ScrollStatement from "@/components/scroll-statement";
import HomeOfferings from "@/components/home-offerings";
import HomeProcess from "@/components/home-process";

export default function Home() {
  const locale = useLocale();
  const t = useTranslations("HomeStatement");
  const heroRef = useRef<HTMLDivElement>(null);
  useScrollReveals(heroRef);

  return (
    <main className="min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      <div
        ref={heroRef}
        className="relative flow-root"
      >
        <Navbar inHero />
        <HeroContent />
        <ScrollStatement text={t("text")} locale={locale} />
        <HomeOfferings />
        <HomeProcess />

        <div
          id="about"
          className="relative z-10 flex flex-col scroll-mt-6 bg-background"
        >
          <AboutSection />
          <ManifestoSection />
          <FaqSection />
        </div>
      </div>
    </main>
  );
}
