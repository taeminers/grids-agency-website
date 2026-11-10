"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Check, Layers2, MessageSquare, ReceiptText, ScanLine } from "lucide-react";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import styles from "./approach-cost-preview.module.css";

const waveform = [18, 30, 52, 34, 70, 90, 48, 62, 35, 78, 100, 65, 42, 83, 58, 32, 72, 95, 54, 38, 66, 88, 48, 76, 100, 60, 34, 58, 80, 44, 68, 91, 50, 28, 56, 74, 40, 62, 30, 18];
const steps = [{ key: "listen", icon: MessageSquare }, { key: "scope", icon: ScanLine }] as const;

export default function ApproachCostPreview() {
  const t = useTranslations("HomeApproach.costVisual");
  const flowRef = useRef<HTMLDivElement>(null);
  const visible = useInView(flowRef, { once: true, amount: 0.5 });
  const reduce = useReducedMotionPreference();
  const reveal = (step: number) => ({
    initial: reduce ? false as const : { opacity: 0, y: 12, scale: 0.985 },
    animate: visible || reduce
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 12, scale: 0.985 },
    transition: reduce ? { duration: 0 } : {
      type: "spring" as const, bounce: 0, duration: 0.6, delay: step * 0.26,
      opacity: { duration: 0.36, delay: step * 0.26 },
    },
  });

  return (
    <div className={styles.scene}>
      <div ref={flowRef} className={styles.flow}>
        <motion.div className={styles.analysis} {...reveal(0)}>
          <span className={styles.status}><i aria-hidden="true" />{t("analysis")}</span>
          <div className={styles.waveform} aria-hidden="true">
            {waveform.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
          </div>
        </motion.div>
        <ol className={styles.steps}>
          {steps.map(({ key, icon: Icon }, index) => (
            <motion.li key={key} {...reveal(1 + index * 0.5)}><Icon size={14} aria-hidden="true" /><span>{t(key)}</span></motion.li>
          ))}
        </ol>
        <motion.div className={styles.coverage} {...reveal(2.5)}>
          <span><Layers2 size={14} aria-hidden="true" />{t("coverage")}</span>
          <p>{t("coverageDetail")}</p>
          <Check size={14} className={styles.coverageCheck} aria-hidden="true" />
        </motion.div>
        <motion.div className={styles.estimate} {...reveal(3.5)}><ReceiptText size={14} aria-hidden="true" /><span>{t("estimate")}</span></motion.div>
        <motion.div className={styles.confirmationStack} {...reveal(4.5)}>
          <div className={styles.confirmation}>
            <div className={styles.confirmationHeading}>
              <ReceiptText size={21} aria-hidden="true" />
              <div><h3>{t("title")}</h3><p>{t("description")}</p></div>
              <Check size={16} className={styles.check} aria-hidden="true" />
            </div>
            <div className={styles.confirmationFooter}><span>{t("footer")}</span><span>{t("status")}</span></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
