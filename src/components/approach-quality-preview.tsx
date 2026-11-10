"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import { TickGauge } from "./ui/tick-gauge";
import { EvalResults, type EvalCase, type EvalLabels } from "./ui/eval-results";
import styles from "./approach-quality-preview.module.css";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export default function ApproachQualityPreview() {
  const t = useTranslations("HomeApproach.qualityVisual");
  const e = useTranslations("HomeApproach.qualityVisual.evaluation");
  const [selectedId, setSelectedId] = useState<string | null>("check-24");
  const [resultsComplete, setResultsComplete] = useState(false);
  const reduce = useReducedMotionPreference();
  const gaugeRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const gaugeVisible = useInView(gaugeRef, { once: true, amount: 0.35 });
  const resultsVisible = useInView(resultsRef, { once: true, amount: 0.35 });
  const gaugeReady = resultsComplete && gaugeVisible;
  const checks = e.raw("checks") as [string, string][];
  const contexts = e.raw("contexts") as string[];
  const cases: EvalCase[] = checks.map(([name, expected], index) => ({
    id: `check-${index}`,
    name,
    status: index === 24 ? "fail" : index === 15 || index === 16 ? "improved" : "pass",
    input: contexts[Math.floor(index / 5)],
    expected,
    actual: e(index === 24 ? "needsReview" : index === 15 || index === 16 ? "improved" : "passed"),
    reason: index === 24 ? e("reason") : undefined,
  }));
  const labels: EvalLabels = {
    results: e("title"), filter: e("filter"), cases: e("cases"),
    count: (count) => e("count", { count }),
    running: (count, total) => e("running", { count, total }),
    finished: (passed, total) => e("finished", { passed, total }),
    filters: e.raw("filters"), statuses: e.raw("statuses"),
    input: e("input"), expected: e("expected"), actual: e("actual"), score: e("score"),
  };

  return (
    <div className={styles.scene}>
      <div ref={resultsRef} className={`${styles.cardSlot} ${styles.resultsSlot}`}>
      <EvalResults
        active={resultsVisible}
        animateResults
        className={`${styles.card} ${styles.results}`}
        data={{ suite: e("title"), cases }}
        columns={8}
        labels={labels}
        selectedId={selectedId}
        onSelectCase={(item) => setSelectedId(item.id)}
        onComplete={() => setResultsComplete(true)}
      />
      </div>
      <motion.div ref={gaugeRef} className={styles.cardSlot}
        initial={false}
        animate={{ opacity: gaugeReady || reduce ? 1 : 0, y: gaugeReady || reduce ? 0 : 10 }}
        transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.5 }}>
      <TickGauge
        active={gaugeReady}
        className={styles.card}
        title={t("title")}
        subtitle={t("subtitle")}
        value={0.96}
        target={1}
        targetLabel={t("target")}
        caption={t("caption")}
        format={formatPercent}
        aside={<span className={styles.example}>{t("example")}</span>}
      />
      </motion.div>
    </div>
  );
}
