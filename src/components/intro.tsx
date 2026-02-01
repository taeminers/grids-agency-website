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

      if (textRef.current && containerRef.current) {
        // Calculate distance to move to bottom
        // Center (0) to Bottom.
        // Container height / 2  - Text height / 2 - Padding (e.g. 40px)
        const windowHeight = window.innerHeight;
        const textHeight = textRef.current.offsetHeight;
        // The element is centered, so `top` is 50%.
        // Distance to move = (windowHeight / 2) - (textHeight / 2) - 30 (pixels from bottom);
        const yOffset = (windowHeight / 2) - (textHeight / 2) - 30;

        // Step 1: Fade in and Scale up "GRIDS AGENCY"
        tl.fromTo(
          textRef.current,
          { opacity: 0, scale: 0.8, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1 }
        )
          // Step 2: Delay 1 second
          .to({}, { duration: 1 })
          
          // Step 3: Animate Text to absolute bottom
          .to(textRef.current, {
            y: yOffset,
            scale: 1, // Keep scale consistent or slight reduction? User wanted "responsive on all devices". Fluid type handles sizing, let's keep scale 1.
            duration: 1.0,
            ease: "power4.inOut"
          }, "move")
          
          // Step 4: Fade out the solid background reveal the rest
          .to(backgroundRef.current, {
            opacity: 0,
            duration: 1.0,
            ease: "power2.inOut",
          }, "move+=0.5") 
          
          // Signal cleanup
          .set(containerRef.current, { pointerEvents: "none" });

        // Step 5: Animate in content
        tl.to(".reveal-content", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
        }, "move+=1");
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

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
        style={{ fontSize: "12vw" }} // Fluid sizing based on viewport width
      >
        GRIDS AGENCY
      </h1>
    </div>
  );
}
