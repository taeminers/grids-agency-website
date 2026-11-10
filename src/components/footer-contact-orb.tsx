"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import { WebGLGuard } from "./coin-preview/webgl-guard";
import styles from "./footer-section.module.css";

const InteractiveDroplets = dynamic(() => import("./originkit/ui/interactive-droplets"), { ssr: false });

export default function FooterContactOrb() {
  const host = useRef<HTMLSpanElement>(null);
  const visible = useInView(host, { margin: "160px" });
  const reduced = useReducedMotionPreference();
  return <span ref={host} className={styles.contactOrb}>
    {visible && <WebGLGuard fallback={<span className={styles.orbFallback} />}>
      <InteractiveDroplets style={{ minWidth: 0, minHeight: 0 }}
        rest={{ x: 50, y: 50, size: 12 }} sizePercent={125}
        dropSize={7} lag={7} idle={{ speed: 5, spread: 8 }}
        idleOn={!reduced} shimmer={reduced ? 0 : 12} />
    </WebGLGuard>}
  </span>;
}
