"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpotlightBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  borderRadius?: number; // allow customization if needed, though we match the navbar
}

export function SpotlightBorder({
  children,
  className,
  borderRadius = 6, // default to match rounded-md (0.375rem = 6px approx or use css var)
  ...props
}: SpotlightBorderProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden rounded-md", className)}
      {...props}
    >
      {/* The actual content */}
      <div className="relative z-10">{children}</div>

      {/* The Spotlight Overlay Border */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-md border border-tertiary"
        style={{
          opacity,
          maskImage: `radial-gradient(100px circle at ${position.x}px ${position.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(100px circle at ${position.x}px ${position.y}px, black 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}
