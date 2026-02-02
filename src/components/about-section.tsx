"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
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
  const light1Ref = useRef<HTMLDivElement>(null);
  const light2Ref = useRef<HTMLDivElement>(null);

  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      // Format: HH:mm AM/PM
      setTime(new Intl.DateTimeFormat('en-US', options).format(now));
    };

    updateTime();
    // Sync to next minute for precision or just intervals. 
    // Simple interval for "ticking every minute" is fine.
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

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

      // Ambient Light Animation (Continuous, independent of scroll)
      if (light1Ref.current) {
        gsap.to(light1Ref.current, {
            x: "20%",
            y: "40%",
            scale: 1.2,
            rotation: 20,
            duration: 15,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
      }
      if (light2Ref.current) {
        gsap.to(light2Ref.current, {
            x: "-20%",
            y: "-30%",
            scale: 1.1,
            rotation: -15,
            duration: 20,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={cn(
        "relative w-full min-h-screen z-10 bg-background flex items-center justify-center p-8 md:p-20 overflow-hidden", 
        className
      )}
    >
      {/* Ambient Background Lights */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
            ref={light1Ref}
            className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] md:w-[40vw] md:h-[50vw] rounded-full bg-tertiary/40 blur-[100px] md:blur-[160px] opacity-50 dark:mix-blend-screen"
        />
        <div 
            ref={light2Ref}
            className="absolute bottom-[-10%] right-[-10%] w-[90vw] h-[90vw] md:w-[40vw] md:h-[30vw] rounded-full bg-tertiary/30 blur-[100px] md:blur-[160px] opacity-40 dark:mix-blend-screen"
        />
      </div>

      {/* Gradient Mask to fade lights to solid background at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10">
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

        <p className="mt-8 text-lg md:text-xl text-muted-foreground font-medium">
          {t('location')} <span className="text-tertiary ml-2">{time}</span>
        </p>
      </div>
    </section>
  );
}
