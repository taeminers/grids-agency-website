"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Braces, Check, CircleCheck, Clock3, PenTool, Workflow } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import styles from "./approach-speed-preview.module.css";

const timeline = [
  { stage: "plan", height: 100, color: "#303236", days: 10 },
  { stage: "design", height: 86, color: "#4d5055", days: 8 },
  { stage: "build", height: 70, color: "#666a70", days: 5 },
  { stage: "connect", height: 54, color: "#a1a4a9", days: 3 },
  { stage: "review", height: 39, color: "#c4c6c9", days: 1 },
  { stage: "launch", height: 28, color: "#e6e7e9", days: 0 },
] as const;

const scopeItems = [
  { item: "design", icon: PenTool, owner: "designTeam", complete: true },
  { item: "core", icon: Braces, owner: "devTeam", complete: false },
  { item: "repeat", icon: Workflow, owner: "aiTeam", complete: true },
] as const;

export default function ApproachSpeedPreview() {
  const t = useTranslations("HomeApproach.speedVisual");
  const scopeRef = useRef<HTMLDivElement>(null);
  const visible = useInView(scopeRef, { once: true, amount: 0.5 });
  const reduce = useReducedMotionPreference();
  const [focused, setFocused] = useState(false);
  const [timelineComplete, setTimelineComplete] = useState(false);
  const instant = reduce || focused;
  const reveal = (delay: number, direction: "up" | "right" = "up") => ({
    initial: instant ? false as const : { opacity: 0, x: direction === "right" ? -8 : 0, y: direction === "up" ? 10 : 0 },
    animate: visible || instant
      ? { opacity: 1, x: 0, y: 0 }
      : { opacity: 0, x: direction === "right" ? -8 : 0, y: direction === "up" ? 10 : 0 },
    transition: instant ? { duration: 0 } : {
      type: "spring" as const, bounce: 0, duration: 0.55, delay,
      opacity: { duration: 0.32, delay },
    },
  });

  const rows = scopeItems.map(({ item, owner, complete }) => ({
    id: item,
    feature: t(item),
    approach: t(item === "repeat" ? "reuse" : `${item}Method`),
    owner: t(owner),
    status: t(complete ? "completed" : "inProgress"),
  }));
  const columns: DataColumn<(typeof rows)[number]>[] = [
    { key: "feature", label: t("feature"), sortable: true, priority: 1,
      format: (value, row) => {
        const Icon = scopeItems.find(({ item }) => item === row.id)!.icon;
        return <span className={styles.feature}><span className={styles.featureIcon}><Icon size={14} aria-hidden="true" /></span>{value}</span>;
      } },
    { key: "approach", label: t("approach"), sortable: true, priority: 1 },
    { key: "owner", label: t("owner"), sortable: true, priority: 1 },
    { key: "status", label: t("status"), sortable: true, priority: 1, align: "right",
      format: (value, row) => {
        const complete = scopeItems.find(({ item }) => item === row.id)!.complete;
        return <span className={styles.status} data-complete={complete}>
          {complete ? <CircleCheck size={12} aria-hidden="true" /> : <Clock3 size={12} aria-hidden="true" />}{value}
        </span>;
      } },
  ];

  return (
    <div className={styles.scene}>
      <motion.div ref={scopeRef} className={styles.scopeSlot} {...reveal(0)} onFocusCapture={() => setFocused(true)}>
      <DataTable
        className={styles.scope}
        title={t("scope")}
        subtitle=""
        data={rows}
        columns={columns}
        paginated={false}
        searchable={false}
        copyable={false}
        tableMinWidth={520}
        labels={{
          filter: t("table.filter"), clearSearch: t("table.clear"),
          copy: t("table.copy"), copied: t("table.copied"),
          empty: t("table.empty"), emptyDescription: t("table.emptyDescription"),
          rowCount: (count) => t("table.rows", { count }),
        }}
      />
      </motion.div>

      <motion.figure className={styles.timeline} {...reveal(0.55)} aria-label={`${t("timeline.title")} · ${t("timeline.example")}`}>
        <ol className={styles.timelineStages} data-complete={timelineComplete || instant} data-instant={instant}>
          {timeline.map(({ stage, height, color, days }, index) => (
            <motion.li key={stage} data-milestone={stage === "launch"} {...reveal(0.73 + index * 0.18, "right")}
              onAnimationComplete={() => {
                if (stage === "launch" && (visible || instant)) setTimelineComplete(true);
              }}>
              <div className={styles.barTrack}>
                <div className={styles.timeBlock}
                  style={{ height: `${height}%`, backgroundColor: color }}>
                  <span>{days === 0 && <Check size={11} aria-hidden="true" />}{days ? t("timeline.days", { count: days }) : t("timeline.done")}</span>
                </div>
              </div>
              <span className={styles.stageLabel}>{t(`timeline.${stage}`)}</span>
            </motion.li>
          ))}
        </ol>
      </motion.figure>
    </div>
  );
}
