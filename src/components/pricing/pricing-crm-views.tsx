"use client";

import { ChevronRight, Pause, Play, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { AgentConsoleData, ConsoleSection } from "@/components/agent-console";
import type { BackgroundAgent } from "@/components/ui/background-agents";
import { StatGrid } from "@/components/ui/stat-grid";
import { RunTrace } from "@/components/ui/run-trace";
import { ToolApprovalQueue, type ToolApprovalQueueProps } from "@/components/ui/tool-approval-queue";
import { EvalResults, type EvalLabels } from "@/components/ui/eval-results";
import { UsageSummary } from "@/components/ui/usage-summary";
import { RateLimits } from "@/components/ui/rate-limits";
import { ContextWindowMeter } from "@/components/ui/context-window-meter";
import styles from "./pricing-crm-views.module.css";

type Props = {
  section: ConsoleSection;
  data: AgentConsoleData;
  selected: string;
  evalLabels: EvalLabels;
  settings: ReactNode;
  onSelect: (agent: BackgroundAgent) => void;
  onPause: (agent: BackgroundAgent) => void;
  onResume: (agent: BackgroundAgent) => void;
  onDecide: ToolApprovalQueueProps["onDecide"];
  onUndo: ToolApprovalQueueProps["onUndo"];
};

export default function PricingCrmViews({ section, data, selected, evalLabels, settings, onSelect, onPause, onResume, onDecide, onUndo }: Props) {
  const t = useTranslations("Pricing.examples.console");
  return <div className={styles.page} data-crm-subpage={section}>
    {section !== "settings" && <p className={styles.description}>{t(`views.${section}Description`)}</p>}
    {section === "runs" && <>
      <div className={styles.metrics}><StatGrid data={data.stats} sparklines={false} className="max-w-none" /></div>
      <div className={styles.runLayout}>
        <div className={styles.runMain}>
          <section className={styles.tasks} aria-label={t("ui.backgroundAgents")}>
            <header className={styles.sectionHeading}><h3>{t("ui.backgroundAgents")}</h3><span>{t("views.agentCount", { count: data.agents.length })}</span></header>
            <div className={styles.taskRows}>
              {data.agents.map((agent) => <div key={agent.id} className={styles.taskRow} data-selected={selected === agent.id}>
                <div className={styles.identity}><span className={styles.agentIcon}><Workflow size={15} aria-hidden="true" /></span><div><button type="button" onClick={() => onSelect(agent)}>{agent.name}<ChevronRight strokeWidth={3.5} size={11} aria-hidden="true" /></button><p>{agent.task}</p><span>{agent.action}</span></div></div>
                <span className={styles.status} data-status={agent.status}>{t(`ui.status.${agent.status}`)}</span>
                <div className={styles.progress}><span>{Math.round(agent.progress * 100)}%</span><div role="progressbar" aria-label={agent.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(agent.progress * 100)}><span style={{ transform: `scaleX(${agent.progress})` }} /></div></div>
                <div className={styles.actions}>{agent.status === "running" && <button type="button" aria-label={t("ui.pauseAgent", { name: agent.name })} title={t("ui.pauseAgent", { name: agent.name })} onClick={() => onPause(agent)}><Pause size={13} aria-hidden="true" /></button>}{agent.status === "paused" && <button type="button" aria-label={t("ui.resumeAgent", { name: agent.name })} title={t("ui.resumeAgent", { name: agent.name })} onClick={() => onResume(agent)}><Play size={13} aria-hidden="true" /></button>}<button type="button" aria-label={t("ui.openAgent", { name: agent.name })} title={t("ui.openAgent", { name: agent.name })} onClick={() => onSelect(agent)}><ChevronRight strokeWidth={3.5} size={13} aria-hidden="true" /></button></div>
              </div>)}
            </div>
          </section>
          <section className={styles.trace}><header className={styles.sectionHeading}><h3>{data.run.name}</h3><span>{t("views.traceHint")}</span></header><RunTrace key={selected} data={{ spans: data.run.spans, elapsedMs: data.run.elapsedMs }} className="max-w-none" /></section>
        </div>
        <aside className={styles.approvals}><ToolApprovalQueue data={data.approvals ?? []} layout="flat" defaultExpanded={data.approvals?.find((item) => !item.status || item.status === "pending")?.id} onDecide={onDecide} onUndo={onUndo} className="max-w-none" /></aside>
      </div>
    </>}
    {section === "evals" && <section className={styles.evaluations}><EvalResults data={data.evals} labels={evalLabels} view="compare" className="max-w-none" /></section>}
    {section === "usage" && <div className={styles.usageLayout}><section className={styles.usageChart}><UsageSummary data={data.usage} title={t("ui.usage")} className="max-w-none" /></section><aside className={styles.capacity}><RateLimits data={data.limits} className="max-w-none" /><ContextWindowMeter data={data.context} className="max-w-none" /></aside></div>}
    {section === "settings" && settings}
  </div>;
}
