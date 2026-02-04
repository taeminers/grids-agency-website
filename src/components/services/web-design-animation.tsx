"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MousePointer2 } from "lucide-react";

export default function WebDesignAnimation() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!container.current) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // 1. Draw Window Frame
    tl.fromTo(".window-frame", 
        { strokeDasharray: 400, strokeDashoffset: 400, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 1.5, ease: "power2.inOut" }
    );

    // 2. Draw Wireframes (Header, Sidebar, Content)
    tl.fromTo(".wireframe-line",
        { strokeDasharray: 300, strokeDashoffset: 300, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power1.out" },
        "-=0.5"
    );

    // 3. "Paint" the UI (Fill blocks appear)
    tl.to(".ui-block", { 
        scale: 1, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "back.out(1.7)" 
    }, "-=0.2");

    // 4. Cursor Interaction
    // Move cursor in
    tl.fromTo(".cursor-arrow",
        { x: 120, y: 120, opacity: 0 },
        { x: 60, y: 50, opacity: 1, duration: 1, ease: "power2.out" }
    );
    
    // Hover/Click effect on Main Content
    tl.to(".cursor-arrow", { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 });
    tl.to(".main-content-block", { fill: "var(--tertiary)", duration: 0.3 }, "-=0.2");
    
    // Ripple effect
    tl.fromTo(".ripple",
        { scale: 0, opacity: 0.8, x: 60, y: 50 },
        { scale: 2, opacity: 0, duration: 0.6, ease: "power1.out" },
        "<"
    );

    // 5. Reset for loop
    tl.to([".window-frame", ".wireframe-line", ".ui-block", ".cursor-arrow", ".ripple"], {
        opacity: 0,
        duration: 0.5,
        delay: 2
    });

  }, { scope: container });

  return (
    <div ref={container} className="w-full h-full bg-muted/20 flex items-center justify-center overflow-hidden">
      <svg className="w-full h-full p-8" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet">
        
        {/* Browser Window Frame */}
        <rect 
            className="window-frame"
            x="10" y="5" width="80" height="70" rx="2" 
            fill="none" stroke="currentColor" strokeWidth="0.5"
            style={{ opacity: 0 }} 
        />
        <circle className="window-frame" cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" style={{ opacity: 0 }} />
        <circle className="window-frame" cx="20" cy="10" r="1.5" fill="currentColor" stroke="none" style={{ opacity: 0 }} />
        <circle className="window-frame" cx="25" cy="10" r="1.5" fill="currentColor" stroke="none" style={{ opacity: 0 }} />
        <line className="window-frame" x1="10" y1="15" x2="90" y2="15" stroke="currentColor" strokeWidth="0.2" style={{ opacity: 0 }} />

        {/* Wireframes (Outlines) */}
        {/* Header */}
        <rect className="wireframe-line" x="15" y="20" width="70" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="0.3" style={{ opacity: 0 }} />
        {/* Sidebar */}
        <rect className="wireframe-line" x="15" y="32" width="15" height="38" rx="1" fill="none" stroke="currentColor" strokeWidth="0.3" style={{ opacity: 0 }} />
        {/* Main Content Grid */}
        <rect className="wireframe-line" x="34" y="32" width="51" height="20" rx="1" fill="none" stroke="currentColor" strokeWidth="0.3" style={{ opacity: 0 }} />
        <rect className="wireframe-line" x="34" y="56" width="24" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="0.3" style={{ opacity: 0 }} />
        <rect className="wireframe-line" x="61" y="56" width="24" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="0.3" style={{ opacity: 0 }} />

        {/* Filled UI Blocks (Initially Hidden) */}
        {/* Header */}
        <rect className="ui-block opacity-0 scale-0 origin-center" x="15" y="20" width="70" height="8" rx="1" fill="currentColor" opacity="0.1" />
        {/* Sidebar */}
        <rect className="ui-block opacity-0 scale-0 origin-center" x="15" y="32" width="15" height="38" rx="1" fill="currentColor" opacity="0.1" />
        {/* Main Content (The Target) */}
        <rect className="ui-block main-content-block opacity-0 scale-0 origin-center" x="34" y="32" width="51" height="20" rx="1" fill="currentColor" opacity="0.3" />
        {/* Sub Cards */}
        <rect className="ui-block opacity-0 scale-0 origin-center" x="34" y="56" width="24" height="14" rx="1" fill="currentColor" opacity="0.1" />
        <rect className="ui-block opacity-0 scale-0 origin-center" x="61" y="56" width="24" height="14" rx="1" fill="currentColor" opacity="0.1" />

        {/* Interaction Elements */}
        {/* Set interactions to be hidden by default to prevent artifacts at 0,0 */}
        <circle className="ripple" cx="0" cy="0" r="5" fill="none" stroke="var(--tertiary)" strokeWidth="0.5" style={{ opacity: 0 }} />
        
        {/* Cursor Icon - Wrapped in G to control position/opacity cleanly */}
        <g className="cursor-arrow" style={{ opacity: 0 }}>
             <MousePointer2 size={8} fill="currentColor" />
        </g>

      </svg>
    </div>
  );
}
