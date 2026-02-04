"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface CoreValueAnimationProps {
  id: number;
}

export default function CoreValueAnimation({ id }: CoreValueAnimationProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!container.current) return;

    // Clear any existing GSAP tweens on this container context if needed
    // standard useGSAP cleanups handle this mostly.

    switch (id) {
      case 1: // Trust - Interlocking/Orbiting Rings
        gsap.to(".ring-outer", { 
          rotation: 360, 
          duration: 20, 
          repeat: -1, 
          ease: "linear", 
          transformOrigin: "center center" 
        });
        gsap.to(".ring-inner", { 
          rotation: -360, 
          duration: 15, 
          repeat: -1, 
          ease: "linear", 
          transformOrigin: "center center" 
        });
        break;

      case 2: // Completeness - Grid Filling
        const tl2 = gsap.timeline({ repeat: -1, repeatDelay: 1, yoyo: true });
        tl2.fromTo(".grid-dot", 
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: { amount: 1, grid: [3, 3], from: "center" }, ease: "back.out(1.5)" }
        );
        break;

      case 3: // Punctuality - Clock/Pendulum
        gsap.to(".clock-hand-min", {
          rotation: 360,
          duration: 4,
          repeat: -1,
          ease: "linear",
          transformOrigin: "bottom center"
        });
        gsap.to(".clock-hand-hour", {
            rotation: 360,
            duration: 48, // 12x slower
            repeat: -1,
            ease: "linear",
            transformOrigin: "bottom center"
          });
        break;

      case 4: // Precision - Focusing Crosshairs
        const tl4 = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        tl4.to(".crosshair-corner", {
            scale: 0.8,
            duration: 1.5,
            ease: "power2.inOut",
            yoyo: true,
            repeat: 1
        });

        break;
    }
  }, { scope: container });

  // Render content based on ID
  const renderContent = () => {
    switch (id) {
      case 1: // Trust
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
            <circle className="ring-outer" cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="60 20" />
            <circle className="ring-inner" cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="40 10" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
          </svg>
        );
      case 2: // Completeness
        return (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <div className="grid grid-cols-3 gap-4">
                 {[...Array(9)].map((_, i) => (
                     <div key={i} className="grid-dot w-8 h-8 bg-current rounded-md" />
                 ))}
            </div>
          </div>
        );
      case 3: // Punctuality
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                {/* Markers */}
                {[...Array(12)].map((_, i) => {
                     const angle = (i * 30) * (Math.PI / 180);
                     const x1 = (50 + 35 * Math.sin(angle)).toFixed(4);
                     const y1 = (50 - 35 * Math.cos(angle)).toFixed(4);
                     const x2 = (50 + 40 * Math.sin(angle)).toFixed(4);
                     const y2 = (50 - 40 * Math.cos(angle)).toFixed(4);
                     return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />;
                })}
                {/* Hands */}
                <line className="clock-hand-hour" x1="50" y1="50" x2="50" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line className="clock-hand-min" x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="50" cy="50" r="3" fill="currentColor" />
            </svg>
        );
      case 4: // Precision
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-30 p-8">
                <path className="crosshair-corner" d="M 20 30 L 20 20 L 30 20" fill="none" stroke="currentColor" strokeWidth="2" />
                <path className="crosshair-corner" d="M 80 30 L 80 20 L 70 20" fill="none" stroke="currentColor" strokeWidth="2" />
                <path className="crosshair-corner" d="M 20 70 L 20 80 L 30 80" fill="none" stroke="currentColor" strokeWidth="2" />
                <path className="crosshair-corner" d="M 80 70 L 80 80 L 70 80" fill="none" stroke="currentColor" strokeWidth="2" />
                

                <circle cx="50" cy="50" r="2" fill="currentColor" />
                <line x1="50" y1="35" x2="50" y2="65" stroke="currentColor" strokeWidth="0.5" />
                <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="0.5" />
            </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={container} className="w-full h-full absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[80%] h-[80%] max-w-[300px] max-h-[300px]">
            {renderContent()}
        </div>
    </div>
  );
}
