"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface IntroProps {
  onReveal?: () => void;
}

export default function Intro({ onReveal }: IntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Re-scoped to containerRef to avoid global pollution
    const ctx = gsap.context(() => {
      if (textRef.current && containerRef.current) {
        const windowHeight = window.innerHeight;
        const textHeight = textRef.current.offsetHeight;
        const scale = 1; // Correct logic: we target scale 1 at the end (from 0.5)
        
        // Target Y position calculation
        const yOffset = (windowHeight / 2) - (textHeight / 2) - 30;

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        // Step 1: Fade in at 50% scale
        tl.fromTo(
          textRef.current,
          { opacity: 0, scale: 0.5, y: 20 }, 
          { opacity: 1, scale: 0.5, y: 0, duration: 1 }
        )
          // Step 2: Delay 1 second
          .to({}, { duration: 1 })
          
          // Step 3: Animate Text to absolute bottom and scale to 100%
          .to(textRef.current, {
            y: yOffset,
            scale: 1, 
            duration: 1.0,
            ease: "power4.inOut"
          }, "move")
          
          // Step 4: Fade out the solid background reveal the rest
          .to(backgroundRef.current, {
            opacity: 0,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
              if (backgroundRef.current) {
                backgroundRef.current.style.display = "none";
              }
            }
          }, "move+=0.5")
          
          // Trigger external reveal (Navbar/Content) via callback
          .call(() => {
            if (onReveal) onReveal();
          }, undefined, "move+=0.8")
          
          // Signal cleanup
          .set(containerRef.current, { pointerEvents: "none" });
      }
    }, containerRef); // Scoped to container

    return () => ctx.revert();
  }, [onReveal]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background Layer */}
      <div 
        ref={backgroundRef} 
        className="absolute inset-0 bg-background pointer-events-auto"
      />
      
      {/* Text Layer - Fluid Typography */}
      <h1 
        ref={textRef} 
        className="relative z-10 font-black tracking-tighter text-foreground text-center px-4 leading-none"
        style={{ fontSize: "12vw" }}
      >
        GRIDS AGENCY
      </h1>
    </div>
  );
}
