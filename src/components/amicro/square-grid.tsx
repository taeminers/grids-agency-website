"use client";

// Amicro Square Grid, copyright (c) 2026 SYED SUBHAN UDDIN. MIT license: ./LICENSE.
// Source: https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/main/registry/ui/loading/square-grid.tsx
// Adapted for avatar-scale sizing, offscreen pausing, and reduced motion.
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotionPreference } from "../coin-preview/use-reduced-motion";

export function SquareGrid({ size = 38, paused = false }: { size?: number; paused?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.2 });
  const reduced = useReducedMotionPreference();
  const playing = visible && !reduced && !paused;

  return (
    <div ref={ref} className="grid shrink-0 grid-cols-2 grid-rows-2" aria-hidden="true"
      style={{ width: size, height: size, gap: size * 6 / 38 }}>
      {[0, 1, 2, 3].map(index => (
        <motion.div key={index} className="bg-current" style={{ borderRadius: size * 2 / 38 }}
          initial={false}
          animate={playing ? { scale: [1, 0.5, 1], opacity: [1, 0.3, 1] } : { scale: 1, opacity: 1 }}
          transition={playing ? { duration: 1.5, repeat: Infinity, delay: index * 0.2, ease: "easeInOut" } : { duration: 0 }} />
      ))}
    </div>
  );
}
