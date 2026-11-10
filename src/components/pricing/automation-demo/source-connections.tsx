import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CalendarDays, Check, ChevronDown, FileSpreadsheet, LoaderCircle } from "lucide-react";
import type { DemoSource } from "./clinic-sources";
import styles from "./inquiry-automation.module.css";

export default function SourceConnections({ sources, sourcesRead, onInspect }: {
  sources: DemoSource[]; sourcesRead: number; onInspect?: () => void;
}) {
  const t = useTranslations("Pricing.automationDemo.sources");
  const reduced = useReducedMotion();
  const [closed, setClosed] = useState<string[]>([]);
  const ids = useId();
  return <section className={styles.sources} aria-label={t("title")}>
    <div className={styles.sourcesHeading}><span>{t("title")}</span><span>{t("demo")}</span></div>
    <p className={styles.sourcesNote}>{t("note")}</p>
    <div className={styles.sourceList}>
      {sources.map((source, index) => {
        const done = index < sourcesRead;
        const active = index === sourcesRead;
        const open = done && !closed.includes(source.id);
        const Icon = source.kind === "file" ? FileSpreadsheet : CalendarDays;
        return <motion.div key={source.id} initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? .1 : .65 }} className={styles.source} data-state={done ? "done" : active ? "loading" : "waiting"}>
          <button className={styles.sourceTrigger} type="button" disabled={!done} aria-expanded={open} aria-controls={`${ids}-${source.id}`}
            onClick={() => { onInspect?.(); setClosed(current => current.includes(source.id) ? current.filter(id => id !== source.id) : [...current, source.id]); }}>
            <span className={styles.sourceIcon} data-kind={source.kind}><Icon size={18} aria-hidden="true" /></span>
            <span className={styles.sourceName}><strong>{source.name}</strong><span>{source.action}</span></span>
            <span className={styles.sourceStatus}>{done ? <Check size={14} aria-hidden="true" /> : active ? <LoaderCircle className={styles.spinner} size={14} aria-hidden="true" /> : null}{done ? t("done") : active ? t("loading") : t("waiting")}</span>
            {done && <ChevronDown className={styles.sourceChevron} data-open={open} size={14} aria-hidden="true" />}
          </button>
          <div id={`${ids}-${source.id}`} hidden={!open} className={styles.sourceDetails}>
            <p>{source.reference}</p>
            <dl>{source.rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd data-state={row.state}>{row.value}</dd></div>)}</dl>
            <span className={styles.sourceSummary}><Check size={12} aria-hidden="true" />{source.summary}</span>
          </div>
        </motion.div>;
      })}
    </div>
  </section>;
}
