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
  const contentRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

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

      // Responsive Video Reveal & Expand Animation
      const mm = gsap.matchMedia();

      mm.add({
        // Desktop
        isDesktop: "(min-width: 768px)",
        // Mobile
        isMobile: "(max-width: 767px)",
      }, (context) => {
        const { isDesktop, isMobile } = context.conditions as { isDesktop: boolean; isMobile: boolean };

        if (videoWrapperRef.current) {
          gsap.fromTo(
            videoWrapperRef.current,
            {
              width: isMobile ? "90vw" : "50vw", // Start wider on mobile
              borderRadius: "1rem", 
              y: "0%", 
              opacity: 1,
            },
            {
              width:  "90vw", // Full width on mobile, 90vw on desktop
              borderRadius: "0px", 
              y: "-30%", 
              opacity: 1,
              ease: "none", 
              scrollTrigger: {
                trigger: sectionRef.current, 
                start: "top top", 
                end: "center center", 
                scrub: 0.5, 
              }
            }
          );
        }
      });   // Parallax for Text Content (Drifts slower than video)
        if (contentRef.current) {
             // Animate the text/title wrapper slightly up
             gsap.to(contentRef.current.children, { 
                y: -150, // Move text up slightly (slower speed) as we scroll down
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "center center", // Match video timing
                    scrub: 0.5,
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
        "relative w-full pt-20 md:min-h-[150vh] z-0 bg-background flex flex-col items-center justify-start overflow-clip", 
        // Increased heigh to [150vh] to provide scroll space for the sticky animation
        className
      )}
    >
      {/* Ambient Background Lights */}
      <div className="hidden md:blockabsolute inset-0 z-0 pointer-events-none">
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
      {/* Gradient Mask to fade lights to solid background at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background from-30% via-background/80 to-transparent z-0 pointer-events-none" />

      {/* Sticky Content Wrapper */}
      <div ref={contentRef} className="sticky top-0 w-full min-h-auto md:min-h-screen flex flex-col items-center justify-start py-10 md:py-0  overflow-hidden z-10 pointer-events-none md:pointer-events-auto">
        
        {/* Huge GRIDS Text (z-30 to stay on top) */}
        <div className="relative w-full flex justify-center mb-0 md:mb-8 z-30">
           <div 
              className="relative inline-block mt-[-5vh] w-full text-center cursor-default pointer-events-auto"
              onMouseEnter={() => {
                  if (!textRef.current) return;
                  gsap.to(".grids-char", {
                      y: "-15%",
                      color: "var(--tertiary)",
                      stagger: { each: 0.03, from: "center" },
                      duration: 0.4,
                      ease: "back.out(2)"
                  });
              }}
              onMouseLeave={() => {
                   gsap.to(".grids-char", {
                      y: "0%",
                      color: "currentColor", 
                      stagger: { each: 0.03, from: "center" },
                      duration: 0.4,
                      ease: "power2.out"
                  });
              }}
           >
              <h1 className="text-[12.5vw] leading-[0.8] font-black tracking-tighter text-foreground/80 dark:text-foreground/80 select-none relative z-10 whitespace-nowrap overflow-hidden py-4">
                  {"GRIDS AGENCY".split("").map((char, i) => (
                      <span key={i} className="grids-char inline-block relative">
                          {char === " " ? "\u00A0" : char}
                      </span>
                  ))}
              </h1>
           </div>
        </div>
  
         {/* Description (z-10, will be covered) */}
         <div className="max-w-4xl w-full text-left px-8 md:pl-30 relative self-start z-10 pointer-events-auto mb-10">
          <p 
            ref={textRef} 
            className="text-4xl md:text-6xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground"
          >
            {t.rich('title', {
              highlight: (chunks) => <span className="text-tertiary">{chunks}</span>,
              newline: () => <br />
            })}
          </p>
  
          <p className="mt-8 text-lg md:text-xl text-muted-foreground font-medium">
            {t('location')} <span className="text-tertiary ml-2">{time}</span>
          </p>
        </div>

        {/* Video Content (z-20, slides over description, under title) */}
        <div 
          ref={videoWrapperRef}
          className="mt-10  w-[90vw] md:w-[50vw] aspect-video rounded-xl overflow-hidden shadow-2xl relative z-20 will-change-transform pointer-events-auto" 
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/cta-video.mp4" type="video/mp4" />
          </video>
        </div>

      </div>
    </section>
  );
}
