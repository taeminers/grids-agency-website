"use client";

// Amicro Rotating Cross, copyright (c) 2026 SYED SUBHAN UDDIN.
// MIT license: ./LICENSE. Adapted to pause offscreen and respect reduced motion.
// Source: https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/main/registry/ui/loading/rotating-cross.tsx
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotionPreference } from "../coin-preview/use-reduced-motion";

export const RotatingCross = () => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.2 });
  const reduced = useReducedMotionPreference();
  const playing = visible && !reduced;

  return (
    <motion.div
      ref={ref}
      className="relative flex h-8 w-8 items-center justify-center"
      initial={false}
      animate={{ rotate: playing ? 90 : 0 }}
      transition={playing ? { duration: 0.6, repeat: Infinity, repeatDelay: 0.24, ease: "easeInOut" } : { duration: 0 }}
      aria-hidden="true"
    >
      <div className="absolute h-1.5 w-full rounded-sm bg-current" />
      <div className="absolute h-full w-1.5 rounded-sm bg-current" />
    </motion.div>
  );
};
