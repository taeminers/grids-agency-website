"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "next-themes";
import { Database, Workflow, Bot, Zap, CheckCircle, Server } from "lucide-react";

export default function AutomationAnimation() {
  const container = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Node positions (percentage based for responsiveness)
  const nodes = [
    { id: "start", x: 10, y: 50, color: "var(--tertiary)", Icon: Database }, // Core/Tertiary
    { id: "process1", x: 35, y: 30, color: isDark ? "#fff" : "#000", Icon: Workflow },
    { id: "process2", x: 35, y: 70, color: isDark ? "#fff" : "#000", Icon: Bot },
    { id: "check", x: 60, y: 50, color: isDark ? "#fff" : "#000", Icon: CheckCircle },
    { id: "end1", x: 90, y: 30, color: "var(--tertiary)", Icon: Server },
    { id: "end2", x: 90, y: 70, color: "var(--tertiary)", Icon: Zap },
  ];

  // Connections [start, end]
  const paths = [
    ["start", "process1"],
    ["start", "process2"],
    ["process1", "check"],
    ["process2", "check"],
    ["check", "end1"],
    ["check", "end2"],
  ];

  useGSAP(() => {
    if (!container.current) return;

    // Pulse animation for nodes
    nodes.forEach((node, i) => {
        gsap.to(`#node-${node.id}-pulse`, {
            scale: 1.5,
            opacity: 0,
            duration: 1.5,
            repeat: -1,
            ease: "power1.out",
            delay: i * 0.2
        });
    });

    // Data packet animations along paths
    const masterTl = gsap.timeline({ repeat: -1 });

    // Packets travel from Start to Process nodes
    const phase1 = gsap.timeline();
    phase1.fromTo(".offset-1", 
        { offsetDistance: "0%", opacity: 0 },
        { offsetDistance: "100%", opacity: 1, duration: 1.5, ease: "power1.inOut", stagger: 0.2 }
    )
    .to(".offset-1", { opacity: 0, duration: 0.2 });

    // ... then to Check node
    const phase2 = gsap.timeline();
    phase2.fromTo(".offset-2",
        { offsetDistance: "0%", opacity: 0 },
        { offsetDistance: "100%", opacity: 1, duration: 1.5, ease: "power1.inOut", stagger: 0.2 }
    )
    .to(".offset-2", { opacity: 0, duration: 0.2 });

    // ... then to End nodes
    const phase3 = gsap.timeline();
    phase3.fromTo(".offset-3",
        { offsetDistance: "0%", opacity: 0 },
        { offsetDistance: "100%", opacity: 1, duration: 1.5, ease: "power1.inOut", stagger: 0.2 }
    )
    .to(".offset-3", { opacity: 0, duration: 0.2 });

    masterTl.add(phase1).add(phase2, "-=1.0").add(phase3, "-=1.0");

  }, { scope: container });

  const getPathD = (p1: string, p2: string) => {
    const n1 = nodes.find(n => n.id === p1);
    const n2 = nodes.find(n => n.id === p2);
    if (!n1 || !n2) return "";
    
    // Simple S-curve or Line
    return `M ${n1.x} ${n1.y} C ${n1.x + 15} ${n1.y}, ${n2.x - 15} ${n2.y}, ${n2.x} ${n2.y}`;
  };

  return (
    <div ref={container} className="w-full h-full bg-muted/20 flex items-center justify-center overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        
        {/* Definitions for glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connections Background */}
        {paths.map((path, i) => {
            const d = getPathD(path[0], path[1]);
            const pathClass = 
                path[0] === "start" ? "path-1" :
                path[1] === "check" ? "path-2" : "path-3";
            
            return (
                <g key={i}>
                    {/* Base Line */}
                    <path d={d} fill="none" strokeWidth="0.5" className="stroke-muted-foreground/30" />
                    
                    {/* Animated Packet Path (Guide) */}
                    <path id={`motion-path-${i}`} d={d} fill="none" stroke="none" />
                    
                    {/* The Packet */}
                    <circle r="1" fill="var(--tertiary)" className={`offset-${path[0] === "start" ? "1" : path[1] === "check" ? "2" : "3"}`} style={{ offsetPath: `path('${d}')` }}>
                    </circle>
                </g>
            )
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id} className="cursor-pointer hover:scale-110 transition-transform duration-300 origin-center">
            {/* Pulse Effect */}
            <circle 
                id={`node-${node.id}-pulse`}
                cx={node.x} 
                cy={node.y} 
                r="6" 
                fill="none"
                stroke={node.color}
                strokeWidth="0.5"
                opacity="0.5"
            />
            
            {/* Core Node Circle */}
            <circle 
                cx={node.x} 
                cy={node.y} 
                r="6" 
                fill={"var(--background)"} 
                stroke={node.color}
                strokeWidth="1.5"
                filter={node.id.includes("start") ? "url(#glow)" : undefined}
            />
            
            {/* Icon (Nested SVG) */}
            <node.Icon 
                x={node.x - 3} 
                y={node.y - 3} 
                width={6} 
                height={6} 
                color={node.color} 
                strokeWidth={1.5}
            />
          </g>
        ))}

      </svg>
    </div>
  );
}
