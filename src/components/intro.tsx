"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export default function Intro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Step 1: Fade in and Scale up "GRIDS AGENCY"
      tl.fromTo(
        textRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1 }
      )
        // Step 2: Delay 1 second
        .to({}, { duration: 1 })
        // Step 3: Animate Text to lower half
        // We move it from center (50% top) to something like 75% top.
        // Since it's currently centered via grid/flex, we might need to rely on y translation
        // or change its positioning context.
        // Simplest way for fixed element: standard translation if we compute it, 
        // OR just large Y percentage if we want it "lower half".
        // Let's assume window height. Moving down by 25vh roughly puts it lower.
        .to(textRef.current, {
          y: "35vh", // Move down significantly
          scale: 1.5, // Maybe make it bigger or smaller? Prompt didn't specify, but "placed on lower half" usually implies footer/signature. Let's keep scale 1 or slightly larger for impact.
          duration: 1.0,
          ease: "power4.inOut"
        }, "move")
        // Step 4: Fade out the solid background reveal the rest
        .to(backgroundRef.current, {
          opacity: 0,
          duration: 1.0,
          ease: "power2.inOut",
        }, "move+=0.5") // Start fading background slightly after text starts moving
        
        // Signal cleanup - we pointer-events none the container so users can click links behind it
        .set(containerRef.current, { pointerEvents: "none" });

        // Step 5: Animate in the rest of the website (Navbar, top half)
        // We can do this by targetting a class on the body or a specific element if we had access,
        // but cleaner is to rely on separate component animations triggered by a state,
        // OR simply rely on the fact that they are essentially revealed by the fade out.
        // The prompt says "with the rest of the website... to appear (animated as well)".
        // If they are static behind the white bg, they just "appear" via fade.
        // To make them "animate in", we can target a global class `.reveal-content`.
        
      tl.to(".reveal-content", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
      }, "move+=1"); // Start appearing as text settles

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background Layer: Handles the solid color that fades out */}
      <div 
        ref={backgroundRef} 
        className="absolute inset-0 bg-background pointer-events-auto"
      />
      
      {/* Text Layer: Remains visible even after background fades */}
      <h1 
        ref={textRef} 
        className="relative z-10 text-4xl md:text-6xl font-black tracking-tighter text-foreground text-center"
      >
        GRIDS AGENCY
      </h1>
    </div>
  );
}
