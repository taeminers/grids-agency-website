"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import ProcessScene from "./process-scene";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const items = [
  {
    title: "Meeting",
    subtitle: "Setting the Foundation",
    description: "We start by understanding your vision, requirements, and business goals. This is the blueprint phase where we align on scope and strategy.",
    step: "01"
  },
  {
    title: "Plan",
    subtitle: "Structuring the Frame",
    description: "Detailed wireframes, architecture design, and project roadmaps. We build the skeleton of your project before adding the weight.",
    step: "02"
  },
  {
    title: "Build",
    subtitle: "Constructing the Core",
    description: "Our team implements your project with precision and care, ensuring every detail aligns with your vision.",
    step: "03"
  },
  {
    title: "Feedback",
    subtitle: "Polishing the Details",
    description: "Rigorous testing, refinement, and feedback cycles. We ensure every detail is perfect before handing over the keys.",
    step: "04"
  }
];

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLDivElement>(null);

  // Animate Step Counter on change
  useGSAP(() => {
    gsap.fromTo(".step-number",
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, { dependencies: [activeStep], scope: counterRef });

  useGSAP(() => {
    sectionRefs.current.forEach((el, index) => {
      if (!el) return;
      
      ScrollTrigger.create({
        trigger: el,
        start: "top 10%", 
        end: "bottom 10%", 
        onEnter: () => setActiveStep(index),
        onEnterBack: () => setActiveStep(index),
      });
    });
  }, { scope: containerRef });

  const activeItem = items[activeStep];

  return (
    <section ref={containerRef} id="process-container" className="relative w-full bg-background" style={{ height: "500vh" }}>
      
      {/* 3D Canvas Layer (Sticky Background) */}
      <div className="sticky top-0 w-full h-screen overflow-hidden z-0">
        <Canvas gl={{ antialias: true }} camera={{ position: [5, 5, 5], fov: 45 }}>
             <ProcessScene />
        </Canvas>
        
        {/* Optional: Overlay Gradient for better text readability if needed */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background/80 via-transparent to-transparent z-10" />

        {/* Work Process Label */}
        <div className="absolute top-12 left-8 md:top-24 md:left-24 z-20 pointer-events-none">
             <div className="h-24 md:h-32 flex flex-col justify-end items-start">
                 <span className="text-sm font-mono text-tertiary tracking-wider uppercase">
                    Work Process
                 </span>
             </div>
        </div>

        {/* Content Card Layer (Absolute within sticky container) */}
        <div className="absolute inset-0 h-screen w-full flex items-center px-8 md:px-24 z-20 pointer-events-none">
            <div className="max-w-lg p-8 md:p-12 bg-background/40 backdrop-blur-md border border-border/50 rounded-3xl pointer-events-auto transition-all duration-500 ease-in-out">
                <div key={activeStep} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <span className="text-chart-2 font-mono mb-4 block text-sm tracking-wider">
                       {activeItem.title}
                    </span>
                    <h3 className="text-4xl font-medium mb-4">{activeItem.subtitle}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {activeItem.description}
                    </p>
                </div>
            </div>
        </div>

        {/* Animated Step Counter (Top Right) */}
        <div ref={counterRef} className="absolute top-12 right-8 md:top-24 md:right-24 z-20 pointer-events-none mix-blend-difference text-primary">
             <div className="overflow-hidden h-24 md:h-32 flex flex-col justify-end items-end">
                <span className="step-number text-3xl font-bold tracking-tighter block leading-none">
                    {activeItem.step}
                </span>
             </div>
             <div className="text-right text-sm md:text-base opacity-60 font-mono mt-2 mr-1">
                / 0{items.length}
             </div>
        </div>
      </div>

      {/* Invisible Scroll Triggers/Spacers */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col">
          {items.map((_, index) => (
              <div 
                key={index}
                ref={(el) => { sectionRefs.current[index] = el }}
                className="h-screen w-full border-l-2 border-transparent" // Invisible spacer
              />
          ))}
      </div>

    </section>
  );
}
