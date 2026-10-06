"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { lockIntroScroll } from "@/lib/lock-intro-scroll";
import { claimIntroVisit } from "@/lib/intro-visit";

interface IntroProps {
  contentRef: RefObject<HTMLDivElement | null>;
  onReveal?: () => void;
}

export default function Intro({ contentRef, onReveal }: IntroProps) {
  const [finished, setFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLHeadingElement>(null);
  const gridsRef = useRef<HTMLSpanElement>(null);
  const agencyRef = useRef<HTMLSpanElement>(null);
  const playIntroRef = useRef<boolean | null>(null);

  // Home renders this after the hero so its ref exists before layout effects run.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) {
      // Never leave the full-screen overlay visible if its reveal target is absent.
      gsap.set(containerRef.current, { display: "none" });
      onReveal?.();
      return;
    }
    // Keep the decision stable through Strict Mode's effect cleanup/setup cycle.
    playIntroRef.current ??= claimIntroVisit();
    if (!playIntroRef.current) {
      // Reveal before paint, without creating a timeline or locking scroll.
      gsap.set(containerRef.current, { display: "none" });
      content.dataset.heroPending = "false";
      onReveal?.();
      return;
    }
    const heroGrid = content.querySelectorAll<HTMLElement>('[data-hero-reveal="grid"]');
    const heroText = content.querySelectorAll<HTMLElement>('[data-hero-reveal="text"]');
    const unlockScroll = lockIntroScroll();
    const wasInert = content.hasAttribute("inert");
    content.setAttribute("inert", "");
    const finishLoading = () => {
      unlockScroll();
      if (!wasInert) content.removeAttribute("inert");
    };
    const ctx = gsap.context(() => {
      const text = textWrapperRef.current;
      const grids = gridsRef.current;
      const agency = agencyRef.current;
      if (!text || !grids || !agency) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          finishLoading();
          // Remove the intro once the hero reveal has finished.
          gsap.set(containerRef.current, { visibility: "hidden" });
          // Remove the initial Tailwind state before clearing animation styles.
          content.dataset.heroPending = "false";
          gsap.set([...heroGrid, ...heroText], { clearProps: "opacity,filter,transform,willChange" });
          onReveal?.();
          setFinished(true);
        },
      });

      // Keep the intro brief and still when motion is reduced.
      if (reducedMotion) {
        tl.to(containerRef.current, { visibility: "hidden", duration: 0.01, onComplete: finishLoading });
        return;
      }

      // Keep the hero stationary beneath the intro; reveal the background first as
      // the overlay fades, followed by the existing grid and text animations.
      gsap.set(heroGrid, { opacity: 0 });
      gsap.set(heroText, { opacity: 0, filter: "blur(6px)", y: 6 });

      tl.fromTo(
        text,
        { opacity: 0, scale: 0.5, y: 20 },
        { opacity: 1, scale: 0.5, y: 0, duration: 1 }
      )
        .to([grids, agency], {
          y: 100,
          opacity: 0,
          duration: 0.4,
          ease: "back.in(2)",
          stagger: 0.1,
        }, "+=0.2")
        .call(() => {
          grids.textContent = "THE AI";
          agency.textContent = "CREATIVE LAB";
          gsap.set([grids, agency], { y: -100 });
        })
        .to([grids, agency], {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.5)",
          stagger: 0.1,
        })
        // Let the complete second title settle before revealing the page.
        .addLabel("exit", "+=1.6")
        // Prepare compositing just before the handoff, not for the whole intro.
        .set(containerRef.current, { willChange: "opacity" }, "exit-=0.2")
        .to(text, {
          opacity: 0,
          duration: 0.3,
          ease: "sine.inOut",
        }, "exit")
        .to(containerRef.current, {
          autoAlpha: 0,
          duration: 0.78,
          ease: "sine.inOut",
          onComplete: finishLoading,
        }, "exit+=0.08")
        // The background is visible through the fading overlay; reveal the grid next.
        .to(heroGrid, {
          opacity: 1,
          duration: 0.65,
          ease: "power2.out",
        }, "exit+=0.65")
        .to(heroText, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 1.1,
          stagger: { amount: 0.4 },
          ease: "power2.out",
        }, "exit+=1.05");
    }, containerRef);

    return () => {
      ctx.revert();
      finishLoading();
    };
  }, [contentRef, onReveal]);

  if (finished) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center touch-none overscroll-none"
    >
      <div className="absolute inset-0 bg-background" />
      <h1
        ref={textWrapperRef}
        className="relative z-10 text-[12vw] font-black tracking-tighter text-tertiary text-center leading-none whitespace-nowrap opacity-0 drop-shadow-2xl"
      >
        <span ref={gridsRef} className="inline-block px-2">GRIDS</span>
        <span ref={agencyRef} className="inline-block px-2">AGENCY</span>
      </h1>
    </div>
  );
}
