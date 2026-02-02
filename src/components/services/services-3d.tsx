"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useSpring } from 'react-spring';
import { useTheme } from "next-themes";

export default function Services3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const { resolvedTheme } = useTheme();
  
  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 40,
      precision: 0.001,
    },
  }));

  useEffect(() => {
    let phi = 0;
    let width = 0;

    if (!canvasRef.current) return;

    const onResize = () => {
        if (canvasRef.current) {
            width = canvasRef.current.offsetWidth;
        }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const isDark = resolvedTheme === 'dark';

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3, // Slight tilt
      dark: isDark ? 1 : 0, // Always 1 for consistent rendering style, we control colors manually
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: isDark ? [0.1, 0.1, 0.1] : [1, 1, 1],
      markerColor: [233 / 255, 98 / 255, 14 / 255],
      glowColor: isDark ? [1, 1, 1] : [0.8, 0.8, 0.8],
      markers: [
        { location: [37.5665, 126.9780], size: 0.05, color: [0.2, 0.5, 1] }, // Blue
        { location: [40.7128, -74.0060], size: 0.05, color: [1, 0.3, 0.3] }, // Red
        { location: [51.5074, -0.1278], size: 0.05, color: [1, 0.8, 0] },   // Yellow
      ],
      onRender: (state) => {
        // This prevents rotation while dragging
        if (!pointerInteracting.current) {
          phi += 0.001;
        } 
        
        state.phi = phi + r.get();
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) {
        // Force opacity to 1 with inline style to ensure transition
        canvasRef.current.style.opacity = "1";
      }
    }, 100);

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [resolvedTheme]); // Re-run when theme changes

  return (
    <div className="relative w-full aspect-square bg-muted/30 rounded-2xl overflow-hidden border border-border/50 flex items-center justify-center">
      <div className="absolute inset-4 z-10 pointer-events-none">
        <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">Interactive Mode</span>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            api.start({
              r: delta / 200,
            });
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            api.start({
              r: delta / 100,
            });
          }
        }}
        className="w-full h-full opacity-0 transition-opacity duration-1000 ease-in-out"
        style={{ width: "100%", height: "100%", aspectRatio: 1, cursor: 'grab' }}
      />
    </div>
  );
}
