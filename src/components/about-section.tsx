"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import FeaturedWorkList from "@/components/featured-work-list";
import { cn } from "@/lib/utils";
import spacing from "./home-spacing.module.css";

interface AboutSectionProps {
  className?: string;
}

export default function AboutSection({ className }: AboutSectionProps) {
  const brandRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const letters = brandRef.current?.querySelectorAll("[data-brand-letter]");
    return () => {
      if (letters) gsap.killTweensOf(letters);
    };
  }, []);

  const animateBrand = (active: boolean) => {
    const brand = brandRef.current;
    if (!brand) return;
    const letters = brand.querySelectorAll("[data-brand-letter]");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.to(letters, {
      y: active && !reducedMotion ? "-15%" : "0%",
      color: active ? "var(--tertiary)" : getComputedStyle(brand).color,
      stagger: reducedMotion ? 0 : { each: 0.03, from: "center" },
      duration: reducedMotion ? 0 : 0.4,
      ease: active ? "back.out(2)" : "power2.out",
      overwrite: "auto",
      onComplete: () => {
        if (!active) gsap.set(letters, { clearProps: "color,transform" });
      },
    });
  };

  return (
    <section
      id="about-details"
      aria-labelledby="about-heading"
      className={cn(
        "@container relative w-full scroll-mt-24 bg-background px-[clamp(20px,4.2vw,72px)] text-foreground",
        spacing.section,
        className,
      )}
    >
      <h2
        data-scroll-reveal="text"
        ref={brandRef}
        id="about-heading"
        aria-label="FEATURED WORK"
        onMouseEnter={() => animateBrand(true)}
        onMouseLeave={() => animateBrand(false)}
        className={`${spacing.heading} cursor-default text-center text-[11cqw] leading-[0.8] font-black tracking-tighter whitespace-nowrap text-foreground/80 select-none`}
      >
        <span aria-hidden="true">
          {"FEATURED WORK".split("").map((letter, index) => (
            <span
              key={index}
              data-brand-letter
              className="relative inline-block"
            >
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </span>
      </h2>
      <div>
        {/* <div className="grid items-center gap-10 py-10 md:grid-cols-[1.3fr_1fr] md:gap-16 md:py-14 lg:py-16">
          <div className="max-w-lg">
            <h2
              id="about-heading"
              className="mt-2 max-w-[13em] text-3xl leading-[1.15] font-medium tracking-[-0.045em] [word-break:keep-all] md:text-[clamp(32px,3.2vw,48px)]"
            >
              {t("heading")}
            </h2>
          </div>
          <div className="relative flex min-h-48 flex-col justify-between gap-12 overflow-hidden bg-[#c56e50] p-6 text-white md:min-h-52 lg:aspect-[2/1] lg:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,#eed6a5_0%,transparent_60%),radial-gradient(ellipse_at_5%_95%,#f5b2a2_0%,transparent_65%),linear-gradient(125deg,#943d53,#e87958_55%,#f6bd9e)]"
            />
            <p className="relative max-w-xs text-sm leading-relaxed [word-break:keep-all] md:text-base">
              {t("feature")}
            </p>
            <div className="relative flex items-center justify-end gap-2.5">
              <BrandLogo className="size-6 bg-white" />
              <span className="text-xl font-medium tracking-[-0.04em]">
                GRIDS AGENCY
              </span>
            </div>
          </div>
        </div> */}
        <FeaturedWorkList />
      </div>
    </section>
  );
}
