"use client";

import { Canvas } from "@react-three/fiber";
import ProcessScene from "./process-scene";
import { cn } from "@/lib/utils";

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
    description: "Our developers bring the design to life with clean, scalable code. Walls go up, features are implemented, and the vision becomes reality.",
    step: "03"
  },
  {
    title: "Feedback",
    subtitle: "Polishing the Details",
    description: "Rigorous testing, refinement, and user feedback cycles. We ensure every detail is perfect before handing over the keys.",
    step: "04"
  }
];

export default function ProcessSection() {
  return (
    <section id="process-container" className="relative w-full bg-background" style={{ height: "500vh" }}>
      
      {/* 3D Canvas Layer (Sticky Background) */}
      <div className="sticky top-0 w-full h-screen overflow-hidden z-0">
        <Canvas gl={{ antialias: true }} camera={{ position: [5, 5, 5], fov: 45 }}>
             <ProcessScene />
        </Canvas>
        
        {/* Optional: Overlay Gradient for better text readability if needed */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background/80 via-transparent to-transparent z-10" />
      </div>

      {/* Scrolling Content Layer (Foreground) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
          {items.map((item, index) => (
              <div 
                key={index} 
                className="h-screen w-full flex items-center px-8 md:px-24"
                style={{ top: `${index * 100}vh` }} // Position each section
              > 
                <div className="max-w-lg p-8 md:p-12 bg-background/40 backdrop-blur-md border border-border/50 rounded-3xl pointer-events-auto">
                    <span className="text-tertiary font-mono mb-4 block text-sm tracking-wider">
                        // {item.step} - {item.title}
                    </span>
                    <h3 className="text-4xl font-medium mb-4">{item.subtitle}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {item.description}
                    </p>
                </div>
              </div>
          ))}
      </div>

    </section>
  );
}
