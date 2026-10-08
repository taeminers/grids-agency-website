"use client";

import { useId } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import BrandLogo from "@/components/brand-logo";
import styles from "./home-pricing-story.module.css";

const risePath = "M 40 210 C 155 210 188 160 211 111 L 268 36";
const headPath = "M 208 43 L 268 36 L 275 96";

/** A single rising form: body first, arrowhead second, then a light across its edge. */
export function GrowthArrow({ progress }: { progress?: MotionValue<number> }) {
  const still = useMotionValue(.59);
  const value = progress ?? still;
  const id = useId().replaceAll(":", "");
  const pathLength = useTransform(value, [.335, .46], [0, 1]);
  const headLength = useTransform(value, [.425, .48], [0, 1]);
  const y = useTransform(value, [.33, .58], [20, -6]);
  const opacity = useTransform(value, [.33, .365], [0, 1]);
  const lightOffset = useTransform(value, [.41, .59], [340, -340]);
  return <div className={styles.arrow} aria-hidden="true" data-story-arrow>
    <svg viewBox="0 0 320 270" fill="none">
      <defs>
        <linearGradient id={`${id}-metal`} x1="60" y1="230" x2="235" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--arrow-shadow)" />
          <stop offset=".26" stopColor="var(--arrow-mid)" />
          <stop offset=".43" stopColor="var(--arrow-light)" />
          <stop offset=".52" stopColor="var(--arrow-mid)" />
          <stop offset=".76" stopColor="var(--arrow-light)" />
          <stop offset="1" stopColor="var(--arrow-mid)" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="240" x2="300" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--tertiary)" stopOpacity=".25" />
          <stop offset=".62" stopColor="var(--arrow-light)" />
          <stop offset="1" stopColor="var(--tertiary)" stopOpacity=".7" />
        </linearGradient>
      </defs>
      <motion.g style={{ y, opacity }} strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(0 5)">
          <motion.path d={risePath} stroke="var(--arrow-shadow)" strokeWidth="31" style={{ pathLength }} />
          <motion.path d={headPath} stroke="var(--arrow-shadow)" strokeWidth="31" style={{ pathLength: headLength }} />
        </g>
        <motion.path d={risePath} stroke={`url(#${id}-edge)`} strokeWidth="31" style={{ pathLength }} />
        <motion.path d={headPath} stroke={`url(#${id}-edge)`} strokeWidth="31" style={{ pathLength: headLength }} />
        <motion.path d={risePath} stroke={`url(#${id}-metal)`} strokeWidth="27" style={{ pathLength }} />
        <motion.path d={headPath} stroke={`url(#${id}-metal)`} strokeWidth="27" style={{ pathLength: headLength }} />
        <motion.path d={risePath} stroke="var(--arrow-light)" strokeWidth="1.5" strokeDasharray="45 600" style={{ strokeDashoffset: lightOffset }} opacity=".65" />
      </motion.g>
    </svg>
  </div>;
}

const logoPieces = [
  { clipPath: "inset(0 0 75% 0)", x: 0, y: -24 },
  { clipPath: "inset(25% 75% 0 0)", x: -24, y: 0 },
  { clipPath: "inset(50% 0 0 50%)", x: 18, y: 18 },
];
function LogoPiece({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const piece = logoPieces[index];
  const start = .653 + index * .014;
  const x = useTransform(progress, [start, start + .065], [piece.x, 0]);
  const y = useTransform(progress, [start, start + .065], [piece.y, 0]);
  const opacity = useTransform(progress, [start, start + .04], [0, 1]);
  return <motion.span className={styles.logoPiece} style={{ x, y, opacity, clipPath: piece.clipPath }}>
    <BrandLogo className={styles.logoMark} />
  </motion.span>;
}

export function StoryLogo({ progress }: { progress?: MotionValue<number> }) {
  const still = useMotionValue(1);
  const assembled = useTransform(progress ?? still, [.75, .78], [0, 1]);
  return <div className={styles.logo} role="img" aria-label="GRIDS" data-story-logo>
    <div className={styles.logoAssembly} aria-hidden="true">
      {logoPieces.map((_, index) => <LogoPiece key={index} index={index} progress={progress ?? still} />)}
      <motion.span className={styles.logoPiece} style={{ opacity: assembled }}><BrandLogo className={styles.logoMark} /></motion.span>
    </div>
  </div>;
}
