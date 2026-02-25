"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useAnimationFrame, 
  animate,
  MotionValue,
  AnimatePresence
} from "framer-motion";

interface TimelineItem {
  id: number;
  title: string;
  deliverable: string;
  content: string;
  category: string;
  icon: any;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  intensity: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  className?: string;
}

/**
 * Optimized Node Component
 * Handles its own position calculations using MotionValues to avoid parent re-renders
 */
function TimelineNode({ 
  item, 
  index, 
  total, 
  rotationAngle, 
  isExpanded, 
  isRelated, 
  isPulsing,
  onClick,
  onToggleRelated,
  t,
  stepIndex,
  timelineData,
  radius
}: { 
  item: TimelineItem; 
  index: number; 
  total: number; 
  rotationAngle: MotionValue<number>;
  isExpanded: boolean;
  isRelated: boolean;
  isPulsing: boolean;
  onClick: () => void;
  onToggleRelated: (id: number) => void;
  t: any;
  stepIndex: number;
  timelineData: TimelineItem[];
  radius: MotionValue<number>;
}) {
  const angleOffset = (index / total) * 360;

  // Use transforms driven by both rotationAngle and radius MotionValues
  // This ensures positions update smoothly on both rotation and resize
  const x = useTransform([rotationAngle, radius], ([angle, r]) => {
    const radian = (((angle as number) + angleOffset) * Math.PI) / 180;
    return (r as number) * Math.cos(radian);
  });

  const y = useTransform([rotationAngle, radius], ([angle, r]) => {
    const radian = (((angle as number) + angleOffset) * Math.PI) / 180;
    return (r as number) * Math.sin(radian);
  });

  const zIndex = useTransform(rotationAngle, (angle) => {
    const radian = ((angle + angleOffset) * Math.PI) / 180;
    return Math.round(100 + 50 * Math.cos(radian));
  });

  const opacity = useTransform(rotationAngle, (angle) => {
    const radian = ((angle + angleOffset) * Math.PI) / 180;
    return Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
  });

  const Icon = item.icon;

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-background bg-foreground border-foreground";
      case "in-progress":
        return "text-foreground bg-background border-foreground";
      case "pending":
        return "text-foreground bg-muted border-border";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <motion.div
      style={{ x, y, zIndex: isExpanded ? 200 : zIndex, opacity: isExpanded ? 1 : opacity }}
      className="absolute cursor-pointer will-change-transform"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Pulse Effect */}
      <div
        className={cn(
          "absolute rounded-full -inset-1 transition-opacity duration-300",
          isPulsing ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
          width: `${item.intensity * 0.5 + 40}px`,
          height: `${item.intensity * 0.5 + 40}px`,
          transform: 'translate(-50%, -50%)',
          left: '20px',
          top: '20px'
        }}
      ></div>

      {/* Node Circle */}
      <motion.div
        animate={{
          scale: isExpanded ? 1.15 : 1,
          backgroundColor: isExpanded ? "var(--foreground)" : isRelated ? "rgba(var(--foreground-rgb), 0.5)" : "var(--background)",
          color: isExpanded || isRelated ? "var(--background)" : "var(--foreground)",
          borderColor: isExpanded || isRelated ? "var(--foreground)" : "rgba(var(--foreground-rgb), 0.4)"
        }}
        className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
          isRelated && "animate-pulse"
        )}
      >
        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
      </motion.div>

      {/* Label */}
      <motion.div
        animate={{
          opacity: isExpanded ? 1 : 0.7,
          scale: isExpanded ? 1.1 : 1,
          color: isExpanded ? "var(--foreground)" : "var(--foreground)"
        }}
        className="absolute top-12 left-5 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-wider"
      >
        {item.title}
      </motion.div>

      {/* Expanded Card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[210]"
          >
            <Card className="w-60 sm:w-64 bg-card/95 backdrop-blur-xl border-border shadow-2xl shadow-black/20 overflow-visible">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-border"></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className={cn("px-2 text-xs", getStatusStyles(item.status))}>
                    {t("step")} {stepIndex}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">
                    {item.deliverable}
                  </span>
                </div>
                <CardTitle className="text-sm mt-2">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground/80">
                <p className="leading-relaxed">{item.content}</p>

                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="flex items-center uppercase tracking-wider font-medium text-muted-foreground">
                      <User size={10} className="mr-1" />
                      {t("involvement")}
                    </span>
                    <span className="font-mono">{item.intensity}%</span>
                  </div>
                  <div className="w-full h-1 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.intensity}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-tertiary"
                    ></motion.div>
                  </div>
                </div>

                {item.relatedIds.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center mb-2">
                      <Link size={10} className="text-muted-foreground mr-1" />
                      <h4 className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                        {t("connected")}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.relatedIds.map((relatedId) => {
                        return (
                          <Button
                            key={relatedId}
                            variant="outline"
                            size="sm"
                            className="flex items-center h-6 px-2 py-0 text-[10px] rounded-none border-border/50 bg-transparent hover:bg-accent text-foreground/80 hover:text-foreground transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleRelated(relatedId);
                            }}
                          >
                            {t("step")} {timelineData.findIndex(i => i.id === relatedId) + 1}
                            <ArrowRight size={8} className="ml-1 text-muted-foreground" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RadialOrbitalTimeline({
  timelineData,
  className,
}: RadialOrbitalTimelineProps) {
  const t = useTranslations("Process.Timeline");
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const radius = useMotionValue(200);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  // Framer Motion values for smooth 60fps animation
  const rotationAngle = useMotionValue(270); // Start at a better default angle

  // Smoothly rotate the orbital (Reduced speed for a more premium feel)
  useAnimationFrame((time, delta) => {
    if (autoRotate) {
      const current = rotationAngle.get();
      rotationAngle.set((current + 0.007 * delta) % 360);
    }
  });

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      let targetRadius = 200;
      if (window.innerWidth < 640) {
        targetRadius = 110; // Slightly smaller to be safe
      } else if (window.innerWidth < 1024) {
        targetRadius = 150;
      }
      
      // Animate the radius for a smooth transition on resize/orientation change
      animate(radius, targetRadius, { duration: 0.5, ease: "easeOut" });
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [radius]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    
    // Animate the rotationAngle value instead of setting state
    animate(rotationAngle, 270 - targetAngle, {
      duration: 1,
      ease: [0.23, 1, 0.32, 1] // Custom ease for a premium feel
    });
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const isAlreadyExpanded = prev[id];
      const newState: Record<number, boolean> = {};
      
      if (!isAlreadyExpanded) {
        newState[id] = true;
        setActiveNodeId(id);
        setAutoRotate(false);

        // Handle related pulses
        const currentItem = timelineData.find((item) => item.id === id);
        const relatedIds = currentItem ? currentItem.relatedIds : [];
        const newPulseEffect: Record<number, boolean> = {};
        relatedIds.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const currentItem = timelineData.find((item) => item.id === activeNodeId);
    return currentItem ? currentItem.relatedIds.includes(itemId) : false;
  };

  return (
    <div
      className={cn(
        "w-full h-full min-h-[500px] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500", 
        className
      )}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          {/* Central Atmospheric Element */}
          <div className="absolute w-16 h-16 rounded-full bg-tertiary animate-pulse flex items-center justify-center z-10 shadow-[0_0_30px_rgba(var(--tertiary),0.3)]">
            <div className="absolute w-20 h-20 rounded-full border border-tertiary/30 animate-ping opacity-70"></div>
            <div
              className="absolute w-24 h-24 rounded-full border border-tertiary/10 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md"></div>
          </div>

          {/* Orbit Path Visual */}
          <motion.div 
            className="absolute rounded-full border border-foreground/5 pointer-events-none transition-colors duration-500"
            style={{ 
              width: useTransform(radius, r => r * 2), 
              height: useTransform(radius, r => r * 2) 
            }}
          ></motion.div>

          {/* Timeline Nodes */}
          {isMounted && timelineData.map((item, index) => (
            <TimelineNode
              key={item.id}
              item={item}
              index={index}
              total={timelineData.length}
              rotationAngle={rotationAngle}
              isExpanded={!!expandedItems[item.id]}
              isRelated={isRelatedToActive(item.id)}
              isPulsing={!!pulseEffect[item.id]}
              onClick={() => toggleItem(item.id)}
              onToggleRelated={(relId) => toggleItem(relId)}
              t={t}
              stepIndex={index + 1}
              timelineData={timelineData}
              radius={radius}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
