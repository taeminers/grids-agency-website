"use client";

import { Signature } from "@/components/signature";
import { useSyncExternalStore } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import styles from "./scroll-statement.module.css";

const staticQuery = "(prefers-reduced-motion: reduce), (prefers-contrast: more)";
const subscribeToPreference = (notify: () => void) => {
  const media = window.matchMedia(staticQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const getStaticPreference = () => window.matchMedia(staticQuery).matches;

export default function StudioIntroduction({ progress, revealAt, completeAt = 0.94 }: {
  progress: MotionValue<number>;
  revealAt: number;
  completeAt?: number;
}) {
  const opacity = useTransform(progress, [revealAt, revealAt + 0.04], [0, 1]);
  const signatureProgress = useTransform(progress, [revealAt + 0.02, completeAt], [0, 1]);
  const staticPresentation = useSyncExternalStore(subscribeToPreference, getStaticPreference, () => false);

  return (
    <motion.div className={`${styles.signatureBlock} ${styles.signatureReveal}`} style={{ opacity }}>
      <Signature text="KYLE" color="#20211f" fontSize={64} duration={0}
        progress={staticPresentation ? undefined : signatureProgress} className={styles.signatureInk} />
      <p className={styles.signatureRole}>CEO / GRIDS AGENCY</p>
    </motion.div>
  );
}
