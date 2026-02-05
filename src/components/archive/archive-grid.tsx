"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Mock Data - Replace with actual data later
const projects = [
  { id: 1, title: "Lighthouse Monitor", category: "SaaS Dashboard", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", description: "A comprehensive monitoring dashboard for non-technical business owners, providing real-time insights into website performance and uptime.", year: "2024", link: "#" },
  { id: 2, title: "Nebula Stream", category: "Media Platform", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop", description: "Next-gen streaming interface with AI-driven content recommendations and immersive dark-mode UI.", year: "2023", link: "#" },
  { id: 3, title: "Vertex Architecture", category: "Portfolio", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2531&auto=format&fit=crop", description: "Minimalist architectural portfolio focusing on spatial depth and clean typography.", year: "2024", link: "#" },
  { id: 4, title: "EcoSync App", category: "Mobile Application", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop", description: "Sustainable lifestyle tracking app with gamified carbon footprint reduction features.", year: "2023", link: "#" },
  { id: 5, title: "Quantum Finance", category: "Fintech", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop", description: "High-frequency trading visualization dashboard with real-time data websockets.", year: "2024", link: "#" }, 
  { id: 6, title: "Aether Lens", category: "Photography", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2574&auto=format&fit=crop", description: "Immersive photography gallery with 3D transitions and spatial audio ambiance.", year: "2023", link: "#" },
  // Duplicates for grid density - Need 9 for 3x3 grid centered layout
  { id: 7, title: "Cyber Canvas", category: "Web Design", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop", description: "Retro-futuristic web space.", year: "2023", link: "#" },
  { id: 8, title: "Neural Net", category: "AI Interface", image: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2668&auto=format&fit=crop", description: "Visualizing neural pathways.", year: "2024", link: "#" },
  { id: 9, title: "Solar Punk City", category: "Urban Planning", image: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=2576&auto=format&fit=crop", description: "Green energy utopian concepts.", year: "2025", link: "#" },
];

export function ArchiveGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeX, setActiveX] = useState(1); // Start at center (1, 1)
  const [activeY, setActiveY] = useState(1);
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

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
      if (!!selectedProject) return; // Disable grid nav if modal open

      switch(e.key) {
        case "ArrowLeft": handleNavigate("left"); break;
        case "ArrowRight": handleNavigate("right"); break;
        case "ArrowUp": handleNavigate("up"); break;
        case "ArrowDown": handleNavigate("down"); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]); // Re-bind if modal state changes to ensure closure captures fresh state? 
  // Actually better to use functional updates if strictly needed, but internal state handles it.
  
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
        className="w-full h-screen overflow-hidden relative bg-neutral-900 flex items-center justify-center select-none"
    >
      
      {/* Mobile Swipe Hint */}
      <div className="md:hidden absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-sm font-light tracking-widest animate-pulse pointer-events-none z-30">
        SWIPE TO EXPLORE
      </div>

      {/* Navigation Arrows (Only show if valid move exists) */}
      {/* Up */}
      {activeY > 0 && (
        <button 
            onClick={() => handleNavigate("up")}
            className="hidden md:block absolute top-16 left-1/2 -translate-x-1/2 z-40 p-4 transition-all animate-in fade-in slide-in-from-top-4 hover:-translate-y-1"
        >
            <ArrowUpRight className="w-12 h-12 text-white/50 hover:text-white rotate-[-45deg] transition-colors" />{/* Up Arrow using rotated icon or lucide ArrowUp */}
        </button>
      )}
      
      {/* Down */}
      {activeY < 2 && (
        <button 
            onClick={() => handleNavigate("down")}
            className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 z-40 p-4 transition-all animate-in fade-in slide-in-from-bottom-4 hover:translate-y-1"
        >
            <ArrowUpRight className="w-12 h-12 text-white/50 hover:text-white rotate-[135deg] transition-colors" />
        </button>
      )}

      {/* Left */}
      {activeX > 0 && (
        <button 
            onClick={() => handleNavigate("left")}
            className="hidden md:block absolute left-12 top-1/2 -translate-y-1/2 z-40 p-4 transition-all animate-in fade-in slide-in-from-left-4 hover:-translate-x-1"
        >
             <ArrowUpRight className="w-12 h-12 text-white/50 hover:text-white rotate-[-135deg] transition-colors" />
        </button>
      )}

      {/* Right */}
      {activeX < 2 && (
        <button 
            onClick={() => handleNavigate("right")}
            className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 z-40 p-4 transition-all animate-in fade-in slide-in-from-right-4 hover:translate-x-1"
        >
            <ArrowUpRight className="w-12 h-12 text-white/50 hover:text-white rotate-[45deg] transition-colors" />
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
            onClick={() => setSelectedProject(project)}
            className={cn(
                "group relative w-full h-full bg-card/5 rounded-none overflow-hidden cursor-pointer border border-white/5 transition-opacity duration-500",
                // Dim non-active items? Optional, but adds focus
                // Calculate item position
                (Math.floor(index / 3) === activeY && index % 3 === activeX) ? "opacity-100 ring-2 ring-white/10 z-10" : "opacity-30 hover:opacity-100"
            )}
          >
            <Image 
              src={project.image} 
              alt={project.title} 
              fill 
              sizes="90vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />
            
            {/* Minimal Overlay - Only Title on Hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <h3 className="text-white text-4xl md:text-6xl font-medium tracking-wide translate-y-8 group-hover:translate-y-0 transition-transform duration-500">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-2xl bg-card border-none p-0 overflow-hidden rounded-2xl">
             {selectedProject && (
                 <div className="flex flex-col">
                     <div className="relative w-full aspect-video">
                        <Image src={selectedProject.image} alt={selectedProject.title} fill className="object-cover" />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">{selectedProject.year}</div>
                     </div>
                     <div className="p-8 space-y-6">
                        <div>
                            <span className="text-tertiary text-xs font-mono uppercase tracking-widest">{selectedProject.category}</span>
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-semibold mt-2">{selectedProject.title}</DialogTitle>
                            </DialogHeader>
                        </div>
                        
                        <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                            {selectedProject.description}
                        </DialogDescription>

                        <div className="pt-4 border-t border-border flex justify-between items-center">
                             <span className="text-sm text-muted-foreground">Client Request / Case Study</span>
                             <Link href={selectedProject.link} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:bg-tertiary transition-colors">
                                View Live <ArrowUpRight size={16} />
                             </Link>
                        </div>
                     </div>
                 </div>
             )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
