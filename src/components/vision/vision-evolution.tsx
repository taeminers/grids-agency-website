"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export default function VisionEvolution() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<HTMLDivElement>(null);
    const plane1Ref = useRef<HTMLDivElement>(null); // Cyan (Bottom)
    const plane2Ref = useRef<HTMLDivElement>(null); // Yellow (Back)
    const plane3Ref = useRef<HTMLDivElement>(null); // Red (Left)

    const [mounted, setMounted] = useState(false);
    const t = useTranslations("Vision.Phases");

    useEffect(() => { setMounted(true); }, []);

    useGSAP(() => {
        if (!containerRef.current || !sceneRef.current) return;

        // Create a timeline that spans the entire scroll duration
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1, // Smooth interaction
            }
        });

        // Initial states: Planes scaled to 0
        gsap.set([plane1Ref.current, plane2Ref.current, plane3Ref.current], { 
            scale: 0, 
            opacity: 0,
            transformOrigin: "center" // Grow from center intersection
        });

        // 1. Continuous Rotation of the whole scene container
        // We can't do infinite rotation easily with a scrub timeline. 
        // Instead, let's rotate it purely based on scroll to separate dimensions.
        tl.to(sceneRef.current, {
            rotationY: -45, // Slight rotation to reveal depth
            rotationX: 10,
            duration: 1, // Normalized duration
            ease: "none"
        }, 0);

        // 2. Animate Plane 1 (Cyan/Bottom) - Starts immediately
        // Grow scale 0 -> 1 much faster
        tl.to(plane1Ref.current, {
            scale: 1,
            opacity: 1,
            duration: 0.15, // Faster (0.3 -> 0.15)
            ease: "power2.out"
        }, 0); // Start at 0

        // 3. Animate Plane 2 (Yellow/Back) - Starts at 0.33
        // Grow scale 0 -> 1
        tl.to(plane2Ref.current, {
            scale: 1,
            opacity: 1,
            duration: 0.2,
            ease: "power2.out"
        }, 0.33);

        // 4. Animate Plane 3 (Red/Left) - Starts at 0.66
        // Grow scale 0 -> 1
        tl.to(plane3Ref.current, {
            scale: 1,
            opacity: 1,
            duration: 0.2,
            ease: "power2.out"
        }, 0.66);

    }, { scope: containerRef, dependencies: [mounted] });

    if (!mounted) return <div className="h-[300vh] bg-background" />;

    return (
        <div ref={containerRef} className="relative bg-background">
            <div className="flex flex-col md:flex-row">
                
                {/* Left Column: Scrollable Text (Z-Index 10) */}
                <div className="w-full md:w-3/5 relative z-10 pointer-events-none md:pointer-events-auto">
                    <div className="h-[300vh] flex flex-col">
                        
                        {/* Section 1 */}
                        <div className="h-screen flex items-center justify-center p-8 md:p-16 border-r border-dashed border-foreground/10">
                            <div className="max-w-lg bg-background/80 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm">
                                <span className="text-xs font-mono text-muted-foreground mb-4 block tracking-widest">{t("phase1.label")}</span>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("phase1.title")}</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {t("phase1.description")}
                                </p>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="h-screen flex items-center justify-center p-8 md:p-16 border-r border-dashed border-foreground/10">
                            <div className="max-w-lg bg-background/80 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm">
                                <span className="text-xs font-mono text-muted-foreground mb-4 block tracking-widest">{t("phase2.label")}</span>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("phase2.title")}</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {t("phase2.description")}
                                </p>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="h-screen flex items-center justify-center p-8 md:p-16 border-r border-dashed border-foreground/10">
                            <div className="max-w-lg bg-background/80 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm">
                                <span className="text-xs font-mono text-muted-foreground mb-4 block tracking-widest">{t("phase3.label")}</span>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("phase3.title")}</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {t("phase3.description")}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column: Sticky CSS Scene (Z-Index 0) */}
                {/* Mobile: Absolute background. Desktop: Right column. */}
                <div className="absolute inset-0 z-0 h-full md:static md:w-2/5 md:h-auto md:bg-background">
                    <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-[1000px]">
                    
                    {/* Scene Container */}
                    <div 
                        ref={sceneRef}
                        className="relative w-64 h-64 transform-style-3d rotate-x-60 rotate-y-0 rotate-z-45"
                        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(45deg)' }}
                    >
                        {/* Axes Helper Lines (Optional, for math aesthetic) */}
                        <div className="absolute top-1/2 left-1/2 w-[200%] h-[1px] bg-foreground/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <div className="absolute top-1/2 left-1/2 w-[1px] h-[200%] bg-foreground/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <div className="absolute top-1/2 left-1/2 w-[1px] h-[200%] bg-foreground/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ transform: 'rotateX(90deg)' }} />


                        {/* Plane 1: Cyan (XZ) - Horizontal Plane */}
                        <div 
                            ref={plane1Ref}
                            className="absolute bg-cyan-500/20 border-2 border-cyan-500"
                            style={{ 
                                width: '300px', height: '300px', // Slightly larger
                                // rotateX(90) makes it horizontal.
                                // We want it centered on the axes.
                                // The container is 256x256. Center is 128,128.
                                // If this is 300x300, top: -22, left: -22 relative to container?
                                // Better: Center the div absolutely first, then transform.
                                top: '50%', left: '50%',
                                marginTop: '-150px', marginLeft: '-150px', // Center alignment
                                transform: 'rotateX(90deg)', 
                                transformOrigin: 'center center' 
                            }}
                        >
                            <div className="w-full h-full grid grid-cols-6 grid-rows-6 opacity-50">
                                {[...Array(36)].map((_, i) => <div key={i} className="border border-cyan-500/30" />)}
                            </div>
                        </div>

                        {/* Plane 2: Yellow (XY) - Vertical Back Plane */}
                        <div 
                            ref={plane2Ref}
                            className="absolute bg-yellow-500/20 border-2 border-yellow-500"
                            style={{ 
                                width: '300px', height: '300px',
                                top: '50%', left: '50%',
                                marginTop: '-150px', marginLeft: '-150px',
                                // No rotation needed for XY (facing camera).
                                // Just center it.
                                transform: 'translateZ(0px)', 
                                transformOrigin: 'center center' 
                            }}
                        >
                             <div className="w-full h-full grid grid-cols-6 grid-rows-6 opacity-50">
                                {[...Array(36)].map((_, i) => <div key={i} className="border border-yellow-500/30" />)}
                            </div>
                        </div>

                        {/* Plane 3: Red (YZ) - Vertical Side Plane */}
                        <div 
                            ref={plane3Ref}
                            className="absolute bg-red-500/20 border-2 border-red-500"
                            style={{ 
                                width: '300px', height: '300px',
                                top: '50%', left: '50%',
                                marginTop: '-150px', marginLeft: '-150px',
                                // Rotate Y 90 to face sideways.
                                transform: 'rotateY(90deg)', 
                                transformOrigin: 'center center'
                            }} 
                        >
                             <div className="w-full h-full grid grid-cols-6 grid-rows-6 opacity-50">
                                {[...Array(36)].map((_, i) => <div key={i} className="border border-red-500/30" />)}
                            </div>
                        </div>

                    </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
