"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);


interface IntroProps {
  onReveal?: () => void;
}

export default function Intro({ onReveal }: IntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLHeadingElement>(null);
  const gridsRef = useRef<HTMLSpanElement>(null);
  const agencyRef = useRef<HTMLSpanElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Ensure elements exist
      if (!textWrapperRef.current || !containerRef.current || !gridsRef.current || !agencyRef.current) return;

      const mm = gsap.matchMedia();
      
      // Common Setup
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
             // Ensure pointer events are off at the end
             if (containerRef.current) containerRef.current.style.pointerEvents = "none";
        }
      });

      // Step 1: Fade in at 50% scale (Common)
      tl.fromTo(
        textWrapperRef.current,
        { opacity: 0, scale: 0.5, y: 20 }, 
        { opacity: 1, scale: 0.5, y: 0, duration: 1 }
      )
      .to({}, { duration: 1 }); // Delay

      // Responsive Animations
      mm.add({
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
      }, (context) => {
        // @ts-ignore - conditions exists on context
        const { isDesktop, isMobile } = context.conditions;

        if (isDesktop) {
            // DESKTOP: Split Left/Right and Scale Down
            tl.to(gridsRef.current, {
                x: "-65vw", // Move further left (closer to edge)
                duration: 1.5,
                ease: "power4.inOut"
            }, "move")
            .to(agencyRef.current, {
                x: "65vw",  // Move further right (closer to edge)
                duration: 1.5,
                ease: "power4.inOut"
            }, "move")
            .to(textWrapperRef.current, {
                scale: 0.4, // Larger scale (was 0.25)
                duration: 1.5,
                ease: "power4.inOut"
            }, "move");
        } 
        
        if (isMobile) {
            // MOBILE: Move to Bottom Center (Unified)
            if (textWrapperRef.current) {
                const windowHeight = window.innerHeight;
                const textHeight = textWrapperRef.current.offsetHeight;
                const yOffset = (windowHeight / 2) - (textHeight / 2) - 40; // Bottom offset padding

                tl.to(textWrapperRef.current, {
                    y: yOffset,
                    scale: 1, // Full width on mobile? Or keep small? User said "like before". Before was scale 1.
                    duration: 1.5,
                    ease: "power4.inOut"
                }, "move");
            }
        }
      });

      // Common: Fade out background
      tl.to(backgroundRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: "power2.inOut",
        onComplete: () => {
          if (backgroundRef.current) backgroundRef.current.style.display = "none";
        }
      }, "move+=0.5")
      


      // Step 2: Animate OLD text OUT (Push Down)
      .to([gridsRef.current, agencyRef.current], {
        y: 100,
        opacity: 0,
        duration: 0.4,
        ease: "back.in(2)",
        stagger: 0.1
      }, "move+=2.0")

      // Step 3: Swap Text & Reset Position (Instant)
      .call(() => {
        if (gridsRef.current) {
            gridsRef.current.innerText = "THE AI";
            // Reset position to TOP for incoming animation (Maintain X offset)
            gsap.set(gridsRef.current, { y: -100 });
        }
        if (agencyRef.current) {
            agencyRef.current.innerText = "CREATIVE LAB";
            // Reset position to TOP for incoming animation (Maintain X offset)
            gsap.set(agencyRef.current, { y: -100 });
        }
        // Reveal Navbar immediately as text prepares to enter
        if (onReveal) onReveal();
      })

      // Step 4: Animate NEW text IN (Slide Down from Top)
      .to([gridsRef.current, agencyRef.current], {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.5)",
        stagger: 0.1
      }, "final");

      // Step 5: Responsive Scale Adjustment for New Text
      mm.add({
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
      }, (context) => {
        // @ts-ignore
        const { isDesktop, isMobile } = context.conditions;

        if (isDesktop) {
            // DESKTOP: Keep same size as before (0.4)
            tl.to(textWrapperRef.current, {
                scale: 0.4, 
                duration: 0.6,
                ease: "back.out(1.5)"
            }, "final");
        }
        
        if (isMobile) {
            // MOBILE: Shrink to 0.6 to fit long text (User requested larger than 0.5)
            tl.to(textWrapperRef.current, {
                scale: 0.8,
                duration: 0.6,
                ease: "back.out(1.5)"
            }, "final");
        }
      });

      // Step 6: Scroll-Linked Exit Animation
      // This runs independently of the intro timeline, driven by user scroll
      const scrollTl = gsap.timeline({
        scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "+=500", // Animate out over first 500px of scroll
            scrub: true,
        }
      });
      
      scrollTl.to(textWrapperRef.current, {
        opacity: 0,
        y: -100,
        scale: "-=0.1", // Slight shrink
        ease: "power1.out"
      });

    }, containerRef); 

    return () => ctx.revert();
  }, [onReveal]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background Layer (Solid color) */}
      <div 
        ref={backgroundRef} 
        className="absolute inset-0 bg-background pointer-events-auto"
      />
      
      {/* Text Layer - Fluid Typography */}
      <h1 
        ref={textWrapperRef} 
        className="relative z-10 font-black tracking-tighter text-tertiary text-center leading-none whitespace-nowrap drop-shadow-2xl"
        style={{ fontSize: "12vw" }}
      >
        <span ref={gridsRef} className="inline-block px-2">GRIDS</span>
        <span ref={agencyRef} className="inline-block px-2">AGENCY</span>
      </h1>
    </div>
  );
}
