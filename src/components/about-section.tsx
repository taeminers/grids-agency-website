"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Register usage of ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface AboutSectionProps {
  className?: string;
}

export default function AboutSection({ className }: AboutSectionProps) {
  const t = useTranslations('About');
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!textRef.current || !sectionRef.current) return;

      // Simple Fade Up animation for the text (Triggered once)
      gsap.fromTo(
        textRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // Scrub-linked Underline Draw (Tied to scroll progress)
      if (underlineRef.current) {
        const pathLength = underlineRef.current.getTotalLength();
        // Reset to hidden
        gsap.set(underlineRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        gsap.to(underlineRef.current, {
          strokeDashoffset: 0,
          ease: "none", // Linear scrub
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%", 
            end: "center 55%", // Finish drawing much sooner (when center is near middle)
            scrub: true, 
          }
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={cn(
        "relative w-full min-h-screen z-10 bg-background flex items-center justify-center p-8 md:p-20", 
        className
      )}
    >
      <div className="max-w-4xl w-full text-center">
        <p 
          ref={textRef} 
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-foreground"
        >
          {t.rich('title', {
            highlight: (chunks) => (
                <span className="relative inline-block">
                    <span className="relative z-10 text-tertiary">{chunks}</span>
                    <svg 
                        className="absolute w-[110%] h-[0.4em] -bottom-2 -left-[5%] z-0 pointer-events-none text-tertiary overflow-visible" 
                        viewBox="0 0 100 20" 
                        preserveAspectRatio="none"
                    >
                        <path 
                            ref={underlineRef}
                            d="M0 10 Q 50 25 100 10" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                    </svg>
                </span>
            )
          })}
        </p>
      </div>
    </section>
  );
}
