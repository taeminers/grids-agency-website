"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import styles from "./home-pricing-cables.module.css";

const LightCables = dynamic(() => import("@/components/originkit/ui/light-cables"), { ssr: false });
const serverInactive = () => false;
const bundle = { count: 32, bend: 42, spread: 120, thickness: 175, widthStart: 40, widthEnd: 150 };
const flow = { flow: 85, pulses: 2 };

export default function HomePricingCables({ progress }: { progress: MotionValue<number> }) {
  const root = useRef<HTMLDivElement>(null);
  const visible = useInView(root, { amount: .01 });
  const reducedMotion = useReducedMotion();
  const subscribe = useCallback((callback: () => void) => progress.on("change", callback), [progress]);
  const readNearScene = useCallback(() => progress.get() >= .6, [progress]);
  const nearScene = useSyncExternalStore(subscribe, readNearScene, serverInactive);
  const opacity = useTransform(progress, [.64, .7, .78], [0, .72, 1]);
  const scale = useTransform(progress, [.64, .78], [1.18, 1]);
  const y = useTransform(progress, [.64, .78], [64, 0]);
  const reveal = useTransform(progress, [.64, .78], [0, 140]);
  const maskImage = useTransform(reveal, (value) =>
    `linear-gradient(to top, #000 0%, #000 ${Math.max(0, value - 24)}%, transparent ${value}%)`);

  return <div ref={root} className={styles.cables} aria-hidden="true" data-story-cables>
    {nearScene && visible && <motion.div className={styles.entrance}
      style={{ opacity, scale, y, maskImage, WebkitMaskImage: maskImage }}>
      <div className={styles.field}>
        <div className={styles.shader}>
          <LightCables
            background="#000000"
            baseColor="#000000"
            accentColor="#4faeff"
            highlight="#f5fcff"
            direction="btt"
            positionX={13}
            positionY={0}
            speed={20}
            hover={0}
            bundle={bundle}
            flow={flow}
            paused={Boolean(reducedMotion)}
            style={{ minWidth: 0, minHeight: 0, width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </motion.div>}
  </div>;
}
