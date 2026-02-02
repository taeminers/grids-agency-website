"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface VideoSectionProps {
  className?: string;
}

export default function VideoSection({ className }: VideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !videoWrapperRef.current) return;

      // Video Reveal Animation
      gsap.fromTo(
        videoWrapperRef.current,
        { 
          y: 100, 
          opacity: 0,
          scale: 0.95
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // Lights Fade Out Animation (Transition to solid background)
      if (lightsRef.current) {
        gsap.to(lightsRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom", // Start fading as soon as section enters
            end: "center center", // Fully faded by the time video is centered
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
        "relative w-full min-h-[40vh] md:min-h-[80vh] bg-background flex items-center justify-center p-8 md:p-20 z-10 overflow-hidden", 
        className
      )}
    >
      {/* Continuity Lights (Fade out on scroll) */}
      <div ref={lightsRef} className="absolute inset-0 z-0 pointer-events-none">
        <div 
            className="absolute top-[-10%] right-[-10%] w-[90vw] h-[90vw] md:w-[60vw] md:h-[60vw] rounded-full bg-tertiary/30 blur-[100px] md:blur-[160px] opacity-40 dark:mix-blend-screen"
        />
        <div 
            className="absolute top-[20%] left-[-10%] w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full bg-tertiary/40 blur-[100px] md:blur-[160px] opacity-50 dark:mix-blend-screen"
        />
      </div>

      {/* Gradient Mask to fade lights in from top */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />

      <div 
        ref={videoWrapperRef}
        className="w-full max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-black"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
