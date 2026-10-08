"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type From = "left" | "right" | "top" | "bottom";

interface HighlightedTextProps {
  children: React.ReactNode;
  className?: string;
  from?: From;
  delay?: number;
  active?: boolean;
  inView?: boolean;
  once?: boolean;
}

const fromVariants = {
  left: {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
  },
  right: {
    hidden: { x: "100%" },
    visible: { x: "0%" },
  },
  top: {
    hidden: { y: "-100%" },
    visible: { y: "0%" },
  },
  bottom: {
    hidden: { y: "100%" },
    visible: { y: "0%" },
  },
};

export function HighlightedText({
  children,
  className,
  from = "bottom",
  delay = 0,
  active = true,
  inView = false,
  once = true,
}: HighlightedTextProps) {
  const variants = fromVariants[from];
  const reducedMotion = useReducedMotion();

  return (
    <motion.span
      className={cn(
        "relative inline-flex overflow-hidden align-baseline",
        className,
      )}
      initial="hidden"
      whileInView={active && inView ? "visible" : undefined}
      animate={!active ? "hidden" : inView ? undefined : "visible"}
      viewport={{ once }}
      style={active ? undefined : { visibility: "hidden" }}
      aria-hidden={!active || undefined}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 -left-[0.15em] -right-[0.18em] bg-black dark:bg-white z-0 motion-reduce:transform-none!"
        variants={variants}
        transition={reducedMotion || !active ? { duration: 0, delay: 0 } : {
          type: "spring",
          damping: 30,
          stiffness: 300,
          delay,
        }}
      />
      <span className="relative z-10 mix-blend-difference text-white pl-[0.15em] pr-[0.18em]">
        {children}
      </span>
    </motion.span>
  );
}

export default HighlightedText;
