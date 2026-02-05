"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

import { useTranslations } from "next-intl";

export function ArchiveGrid() {
  const t = useTranslations("Archive");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeX, setActiveX] = useState(1); // Start at center (1, 1)
  const [activeY, setActiveY] = useState(1);

  // Mock Data - Moved inside for translations
  const projects = [
    { id: 1, title: "Fablo App", category: t("Projects.project1.category"), image: "/images/fablo-app.png", description: t("Projects.project1.description"), year: "2025", link: "#" },
    { id: 2, title: "Personal Website", category: t("Projects.project2.category"),  image: "/images/website.png", description: t("Projects.project2.description"), year: "2023", link: "#" },
    { id: 3, title: "Instagram Ads", category: t("Projects.project3.category"), image: "/images/ads/ad-2.png", description: t("Projects.project3.description"), year: "2024", link: "#" },
    { id: 4, title: "Cinematics", category: t("Projects.project4.category"), video: "/videos/cinematics.mp4", description: t("Projects.project4.description"), year: "2023", link: "#" },
    { id: 5, title: "The Clear Labs", category: t("Projects.project5.category"), video: "/videos/tcl.mp4", description: t("Projects.project5.description"), year: "2024", link: "#" }, 
    { id: 6, title: "AI Videos", category: t("Projects.project6.category"), video: "/videos/hero.mp4", description: t("Projects.project6.description"), year: "2023", link: "#" },
    // Duplicates for grid density - Need 9 for 3x3 grid centered layout
    { id: 7, title: "Jeisys", category: t("Projects.project7.category"), video: "/videos/jeisys.mp4", description: t("Projects.project7.description"), year: "2023", link: "#" },
    { id: 8, title: "Haneul Mask", category: t("Projects.project8.category"), video: "/videos/haneul.mp4", description: t("Projects.project8.description"), year: "2024", link: "#" },
    { id: 9, title: "Automation", category: t("Projects.project9.category"), image: "/images/automation.jpeg", description: t("Projects.project9.description"), year: "2025", link: "#" },
  ];

  // Animate grid position based on active coordinate
  useGSAP(() => {
    if (!gridRef.current) return;
    
    // Grid Size: 250vw x 250vh
    // Cell Size: ~83.33vw x ~83.33vh
    // Logic: We want to center the active cell.
    // Center of Screen = 50vw, 50vh
    // Center of Grid = 125vw, 125vh (since activeX=1, activeY=1 is the middle)
    // Shift needed per step = 83.33vw (250/3)
    
    // Calculate offset percentage
    // cell size in % of grid = 100% / 3 = 33.333%
    // Shift to center activeX: 
    // If activeX = 0 (Left), we want left col centered. Grid x = 33.333% (Shift right? No, grid origin is top-left)
    // Let's us vw/vh units for precision with the container style
    
    const xPercent = -(activeX * 33.333) + 33.333; // 0->33.3, 1->0, 2->-33.3
    const yPercent = -(activeY * 33.333) + 33.333;
    
    // Actually, simpler logic:
    // We want to translate the grid.
    // At (1,1), transform is 0 (or centered if layout allows).
    // Let's assume the grid is centered by flexbox initially?
    // The previous CSS was: flex items-center justify-center.
    // So if width is 250vw, the Center (1,1) is ALREADY centered by default layout flow?
    // No, justify-center centers the *element*, so the center of the 250vw wide element is at viewport center.
    // That means coordinate (1.5, 1.5) is at center? 
    // A 3x3 grid:
    // Col 0 | Col 1 | Col 2
    // Center of Grid is middle of Col 1.
    // So activeX=1 is "default".
    // activeX=0 (Left col) needs grid to move RIGHT by 1 column width (+83.33vw).
    // activeX=2 (Right col) needs grid to move LEFT by 1 column width (-83.33vw).
    
    const cellWidth = 250 / 3; // ~83.33 vw
    const cellHeight = 220 / 3; // ~73.33 vh - Reduced height to prevent blocking arrows/nav
    
    const xOffset = (1 - activeX) * cellWidth; // 1-0=1(+), 1-1=0, 1-2=-1(-)
    const yOffset = (1 - activeY) * cellHeight;

    gsap.to(gridRef.current, {
      x: `${xOffset}vw`,
      y: `${yOffset}vh`,
      duration: 0.8,
      ease: "power4.out"
    });

  }, [activeX, activeY]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Removed modal check since modal is removed

      switch(e.key) {
        case "ArrowLeft": handleNavigate("left"); break;
        case "ArrowRight": handleNavigate("right"); break;
        case "ArrowUp": handleNavigate("up"); break;
        case "ArrowDown": handleNavigate("down"); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Empty dependency array as handleNavigate is stable or we can rely on handleNavigate being defined outside (actually it's inside, might need dependency or use ref, but strict mode might complain. For now leaving empty as is typical for simple key listeners unless handleNavigate changes)
  // Logic tweak: handleNavigate uses state setters which are stable. Correct.
  
  const handleNavigate = (direction: 'up'|'down'|'left'|'right') => {
      // Directions inverted? Arrow Right >> Go to Right Item >> Shift Grid Left
      // Yes.
      if (direction === "left") setActiveX(prev => Math.max(0, prev - 1));
      if (direction === "right") setActiveX(prev => Math.min(2, prev + 1));
      if (direction === "up") setActiveY(prev => Math.max(0, prev - 1));
      if (direction === "down") setActiveY(prev => Math.min(2, prev + 1));
  };

  // Touch / Swipe Navigation
  const touchStart = useRef<{x: number, y: number} | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      
      const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      const diffX = touchStart.current.x - touchEnd.x;
      const diffY = touchStart.current.y - touchEnd.y;
      
      const absDiffX = Math.abs(diffX);
      const absDiffY = Math.abs(diffY);
      
      // Minimum swipe distance
      if (Math.max(absDiffX, absDiffY) < 50) return;

      if (absDiffX > absDiffY) {
          // Horizontal Swipe
          if (diffX > 0) handleNavigate("right"); // Swipe Left -> Grid moves Left (Nav Right)
          else handleNavigate("left");
      } else {
          // Vertical Swipe
          if (diffY > 0) handleNavigate("down"); // Swipe Up -> Grid moves Up (Nav Down)
          else handleNavigate("up");
      }
      
      touchStart.current = null;
  };

  return (
    <div 
        ref={containerRef} 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-screen overflow-hidden relative bg-background flex items-center justify-center select-none"
    >
      
      {/* Mobile Swipe Hint */}
      <div className="md:hidden absolute bottom-12 left-1/2 -translate-x-1/2 text-muted-foreground text-sm font-light tracking-widest animate-pulse pointer-events-none z-30">
        {t("swipeHint")}
      </div>

      {/* Navigation Arrows (Only show if valid move exists) */}
      {/* Up */}
      {activeY > 0 && (
        <button 
            onClick={() => handleNavigate("up")}
            className="hidden md:block absolute top-16 left-1/2 -translate-x-1/2 z-40 p-4 transition-all animate-in fade-in slide-in-from-top-4 hover:-translate-y-1"
        >
            <ArrowUpRight className="w-12 h-12 text-muted-foreground hover:text-foreground rotate-[-45deg] transition-colors" />{/* Up Arrow using rotated icon or lucide ArrowUp */}
        </button>
      )}
      
      {/* Down */}
      {activeY < 2 && (
        <button 
            onClick={() => handleNavigate("down")}
            className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 z-40 p-4 transition-all animate-in fade-in slide-in-from-bottom-4 hover:translate-y-1"
        >
            <ArrowUpRight className="w-12 h-12 text-muted-foreground hover:text-foreground rotate-[135deg] transition-colors" />
        </button>
      )}

      {/* Left */}
      {activeX > 0 && (
        <button 
            onClick={() => handleNavigate("left")}
            className="hidden md:block absolute left-12 top-1/2 -translate-y-1/2 z-40 p-4 transition-all animate-in fade-in slide-in-from-left-4 hover:-translate-x-1"
        >
             <ArrowUpRight className="w-12 h-12 text-muted-foreground hover:text-foreground rotate-[-135deg] transition-colors" />
        </button>
      )}

      {/* Right */}
      {activeX < 2 && (
        <button 
            onClick={() => handleNavigate("right")}
            className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 z-40 p-4 transition-all animate-in fade-in slide-in-from-right-4 hover:translate-x-1"
        >
            <ArrowUpRight className="w-12 h-12 text-muted-foreground hover:text-foreground rotate-[45deg] transition-colors" />
        </button>
      )}

      {/* Grid Container */}
      <div 
        ref={gridRef} 
        className="grid grid-cols-3 gap-8 w-[250vw] h-[220vh] transform-gpu flex-none"
        style={{ willChange: 'transform' }}
      >
        {projects.map((project, index) => (
          <div 
            key={index}
            className={cn(
                "group relative w-full h-full bg-card/5 rounded-none overflow-hidden border border-foreground/5 transition-opacity duration-500",
                // Dim non-active items? Optional, but adds focus
                // Calculate item position
                (Math.floor(index / 3) === activeY && index % 3 === activeX) ? "opacity-100 ring-2 ring-foreground/10 z-10" : "opacity-30"
            )}
          >
            {project.image ? (
              <Image 
                src={project.image} 
                alt={project.title} 
                fill 
                sizes="90vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
            ) : project.video ? (
              <video
                src={project.video}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                muted
                playsInline
                loop
                autoPlay
              />
            ) : null}
            
            {/* Minimal Overlay - Only Title on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-8">
               <h3 className="text-white text-4xl md:text-6xl font-medium tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-right">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
