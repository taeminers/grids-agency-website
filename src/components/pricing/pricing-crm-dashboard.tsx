"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronDown, Sparkles, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ConsoleSection } from "@/components/agent-console";
import styles from "./pricing-crm-dashboard.module.css";

export type DashboardPeriod = 7 | 30 | 90;
const series = [22, 26, 24, 33, 29, 39, 36, 48, 45, 57, 53, 65, 61, 68, 66, 79, 75, 86, 83, 92.4];

function pathFor(values: number[]) {
  const points = values.map((value, i) => ({ x: 44 + i * 600 / (values.length - 1), y: 221 - value * 1.9 }));
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1], point = points[i], mid = (previous.x + point.x) / 2;
    path += ` C ${mid} ${previous.y}, ${mid} ${point.y}, ${point.x} ${point.y}`;
  }
  return { path, points };
}

export default function PricingCrmDashboard({ period, showInsights, showActivity, onNavigate }: {
  period: DashboardPeriod; showInsights: boolean; showActivity: boolean; onNavigate: (section: ConsoleSection) => void;
}) {
  const t = useTranslations("Pricing.examples.console.dashboard");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [details, setDetails] = useState(false);
  const factor = period === 7 ? .27 : period === 90 ? 2.65 : 1;
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(value);
  const values = series.map((value, index) => period === 7 ? value + Math.sin(index) * 2 * (1 - index / (series.length - 1)) : period === 90 ? value + Math.sin(index * .7) * 3 * (1 - index / (series.length - 1)) : value);
  const { path, points } = pathFor(values);
  const dateAt = (index: number) => {
    const date = new Date(Date.UTC(2026, 10, 12));
    date.setUTCDate(date.getUTCDate() - Math.round((period - 1) * (1 - index / (values.length - 1))));
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
  };
  const activePoint = active === null ? null : points[active];

  return <div className={styles.dashboard} data-crm-dashboard>
    <div className={styles.layout}>
      <div className={styles.mainColumn}>
        <div className={styles.metrics}>
          {[{ label: t("repeatRate"), value: "38.4%", delta: "2.7%" }, { label: t("orders"), value: Math.round(1842 * factor).toLocaleString(locale), delta: "4.1%" }, { label: t("orderValue"), value: money(154600), delta: "1.3%", down: true }].map((metric) => <div key={metric.label}>
            <p>{metric.label}</p><strong>{metric.value}</strong>
            <span className={metric.down ? styles.negative : styles.positive}>{metric.down ? <ArrowDownRight size={13} aria-hidden="true" /> : <ArrowUpRight size={13} aria-hidden="true" />}{metric.delta}<span>{t("priorPeriod")}</span></span>
          </div>)}
        </div>
        <section className={styles.revenue}>
          <header><div><strong>{money(92400000 * factor)}</strong><p>{t("revenue")}</p></div><span className={styles.positive}><ArrowUpRight size={14} aria-hidden="true" />27.4%<span>{t("priorPeriod")}</span></span></header>
          <div className={styles.chart} role="group" tabIndex={0} aria-label={t("chartLabel")}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault(); setActive((current) => Math.min(Math.max((current ?? 0) + (event.key === "ArrowRight" ? 1 : -1), 0), points.length - 1));
              }
              if (event.key === "Escape") setActive(null);
            }}>
            <svg viewBox="0 0 660 250" preserveAspectRatio="none" role="img" aria-label={t("chartDescription")} onPointerLeave={() => setActive(null)}
              onPointerMove={(event) => { const box = event.currentTarget.getBoundingClientRect(); setActive(Math.min(Math.max(Math.round(((event.clientX - box.left) / box.width * 660 - 44) / 600 * (points.length - 1)), 0), points.length - 1)); }}>
              <defs><linearGradient id="crm-revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b9bbc6" stopOpacity=".13" /><stop offset="100%" stopColor="#b9bbc6" stopOpacity="0" /></linearGradient></defs>
              {[0, 20, 40, 60, 80, 100].map((value) => <g key={value}><line x1="44" x2="644" y1={221 - value * 1.9} y2={221 - value * 1.9} stroke="#252528" strokeDasharray="3 5" /><text x="0" y={225 - value * 1.9} fill="#85858f" fontSize="10">{value === 0 ? "0" : `${+(value * factor).toFixed(1)}M`}</text></g>)}
              <path d={`${path} L 644 221 L 44 221 Z`} fill="url(#crm-revenue-fill)" />
              <motion.path key={period} d={path} fill="none" stroke="#d7d8e0" strokeWidth="2" strokeLinecap="round" initial={reduce ? false : { pathLength: 0, opacity: .5 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: .7, ease: "easeOut" }} />
              {activePoint && <g><line x1={activePoint.x} x2={activePoint.x} y1="22" y2="221" stroke="#686870" strokeDasharray="3 4" /><circle cx={activePoint.x} cy={activePoint.y} r="4" fill="#e5e6ec" stroke="#101012" strokeWidth="2" /></g>}
            </svg>
            {activePoint && active !== null && <div className={styles.chartTooltip} style={{ left: `${Math.min(Math.max(activePoint.x / 660 * 100, 14), 83)}%`, top: `${Math.max(activePoint.y / 250 * 100 - 21, 0)}%` }}><span>{dateAt(active)}</span><strong>{money(values[active] * 1000000 * factor)}</strong></div>}
            <div className={styles.chartDates}>{[0, 5, 10, 15, 19].map((index) => <span key={index}>{dateAt(index)}</span>)}</div>
          </div>
        </section>
        {showInsights && <div className={styles.lowerGrid}>
          <section className={styles.insight}><h3><Sparkles size={15} aria-hidden="true" />{t("insights")}</h3><p>{t.rich("insightText", { strong: (chunks) => <strong>{chunks}</strong> })}</p><button type="button" onClick={() => onNavigate("runs")}>{t("viewOperations")}<ArrowRight size={13} aria-hidden="true" /></button></section>
          <section className={styles.pipeline}><h3>{t("pipeline")}</h3><strong>124 <span>{t("tasks")}</span></strong><div className={styles.pipelineBar}>{[50, 25, 25].map((value, index) => <span key={index} style={{ flex: value }}><span>{value}%</span></span>)}</div><ul>{["completed", "inProgress", "waiting"].map((key, index) => <li key={key}><i style={{ background: ["#9b9ca3", "#5d5e66", "#32333a"][index] }} />{t(key)}</li>)}</ul></section>
        </div>}
        {showActivity && <section className={styles.activity}><header><h3>{t("activity")}</h3><span>{t("today")}</span></header><div role="table" aria-label={t("activity")}>
          {(["quote", "payment", "report"] as const).map((item, index) => <div role="row" key={item}><span className={styles.activityDot} /><div role="cell"><strong>{t(`events.${item}.name`)}</strong><span>{t(`events.${item}.description`)}</span></div><span role="cell" className={styles.eventStatus}>{t(index === 0 ? "inProgress" : "completed")}</span><time role="cell">{["14:32", "13:48", "11:06"][index]}</time></div>)}
        </div></section>}
      </div>
      <aside className={styles.summary} aria-label={t("businessSummary")}>
        <section className={styles.revenueSummary}>
          <div className={styles.gauge} role="img" aria-label={t("revenueGauge")}><svg viewBox="0 0 220 220" aria-hidden="true">{Array.from({ length: 64 }, (_, index) => { const angle = (135 + index * 270 / 63) * Math.PI / 180; return <line key={index} x1={110 + Math.cos(angle) * 81} y1={110 + Math.sin(angle) * 81} x2={110 + Math.cos(angle) * 99} y2={110 + Math.sin(angle) * 99} stroke={index < 49 ? "#a6a7af" : "#2e2f35"} strokeWidth="4" strokeLinecap="round" />; })}</svg><div className={styles.gaugeCenter}><span><Wallet size={17} aria-hidden="true" /></span><p>{t("totalRevenue")}</p><strong>{money(284920000)}</strong></div></div>
          <ul className={styles.legend}><li><i />{t("subscriptions")}</li><li><i />{t("services")}</li></ul>
          <button type="button" className={styles.detailButton} aria-expanded={details} onClick={() => setDetails(!details)}>{t("viewDetails")}<ChevronDown size={14} style={{ transform: details ? "rotate(180deg)" : undefined }} aria-hidden="true" /></button>
          {details && <dl className={styles.breakdown}><div><dt>{t("subscriptions")}</dt><dd>{money(223000000)}</dd></div><div><dt>{t("services")}</dt><dd>{money(61920000)}</dd></div></dl>}
        </section>
        <section className={styles.customers}><h3>{t("activeCustomers")}</h3><strong>2,540</strong><span className={styles.customerRate}>78%</span><div className={styles.customerBars} aria-label={t("paidShare")}>{Array.from({ length: 60 }, (_, index) => <span key={index} data-filled={index < 47} />)}</div><ul className={styles.legend}><li><i />{t("paid")}</li><li><i />{t("free")}</li></ul></section>
        <section className={styles.payment}><h3>{t("latestPayment")}</h3><dl><div><dt>{t("customer")}</dt><dd>{t("paymentCompany")}</dd></div><div><dt>{t("amount")}</dt><dd>{money(2250000)}</dd></div><div><dt>{t("method")}</dt><dd>•••• 4432</dd></div><div><dt>{t("status")}</dt><dd><span>{t("paidComplete")}</span></dd></div></dl></section>
      </aside>
    </div>
  </div>;
}
