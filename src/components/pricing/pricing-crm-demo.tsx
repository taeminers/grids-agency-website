"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, Database, FolderSync, Mail, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PricingCrmViews from "./pricing-crm-views";
import BrandLogo from "@/components/brand-logo";
import FallbackAvatar from "@/components/fallback-avatar";
import PricingCrmDashboard, { type DashboardPeriod } from "./pricing-crm-dashboard";
import { AgentConsole, type AgentConsoleData, type ConsoleSection } from "@/components/agent-console";
import type { BackgroundAgent } from "@/components/ui/background-agents";
import type { EvalLabels } from "@/components/ui/eval-results";
import type { ToolApprovalRequest, ToolDecision, GrantScope } from "@/components/ui/tool-approval-queue";
import { toast } from "@/components/ui/toast-stack";
import styles from "./pricing-crm-demo.module.css";
import type { ExamplePreviewDevice } from "./pricing-example-viewport";

function Connections({ enabled, onToggle }: { enabled: boolean[]; onToggle: (index: number) => void }) {
  const t = useTranslations("Pricing.examples.console");
  return <section className={styles.settings}>
    <h3>{t("ui.settings")}</h3><p>{t("settingsDescription")}</p>
    {[{ id: "drive", icon: FolderSync }, { id: "crm", icon: Database }, { id: "gmail", icon: Mail }].map(({ id, icon: Icon }, index) => (
      <div key={id} className={styles.connection}>
        {id === "drive" ? <Image src="/icons/integrations/google-drive.svg" width={22} height={22} alt="" /> : id === "gmail" ? <Image src="/icons/integrations/gmail.svg" width={22} height={18} alt="" /> : <Icon size={22} aria-hidden="true" />}
        <div><strong>{t(`connections.${id}.name`)}</strong><p>{t(`connections.${id}.description`)}</p></div>
        <button type="button" role="switch" aria-checked={enabled[index]} aria-label={t(`connections.${id}.name`)} onClick={() => onToggle(index)}><span /></button>
      </div>
    ))}
  </section>;
}

function ConsoleSession({ device }: { device: ExamplePreviewDevice }) {
  const t = useTranslations("Pricing.examples.console");
  const root = useRef<HTMLDivElement>(null);
  const visible = useInView(root, { amount: 0.1 });
  const [enabled, setEnabled] = useState([true, true, true]);
  const [period, setPeriod] = useState<DashboardPeriod>(30);
  const [showInsights, setShowInsights] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [section, setSection] = useState<ConsoleSection>("agents");
  const [agents, setAgents] = useState<BackgroundAgent[]>(() => t.raw("agents") as BackgroundAgent[]);
  const [approvals, setApprovals] = useState<ToolApprovalRequest[]>(() => t.raw("approvals") as ToolApprovalRequest[]);
  const [selected, setSelected] = useState("support");
  useEffect(() => () => toast.dismiss("crm-example-approval"), []);
  const agent = agents.find((item) => item.id === selected) ?? agents[0];

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => setAgents((current) => {
      if (!current.some((agent) => agent.status === "running")) return current;
      return current.map((agent) => {
        if (agent.status !== "running") return agent;
        const progress = Math.min(agent.progress + 0.025, 1);
        return { ...agent, progress, elapsedMs: agent.elapsedMs + 1000, status: progress === 1 ? "done" : "running", action: progress === 1 ? t("ui.complete") : agent.action };
      });
    }), 1000);
    return () => clearInterval(timer);
  }, [visible, t]);

  const decide = (requests: ToolApprovalRequest[], decision: ToolDecision, scope: GrantScope) => {
    const ids = new Set(requests.map((request) => request.id));
    setApprovals((current) => current.map((request) => ids.has(request.id) ? { ...request, status: decision, scope } : request));
    if (ids.has("email-review")) setAgents((current) => current.map((agent) => agent.id === "support" ? { ...agent, status: decision === "approved" ? "done" : "paused", progress: decision === "approved" ? 1 : agent.progress, action: t(decision === "approved" ? "ui.emailApproved" : "ui.emailHeld") } : agent));
    toast.success(t(decision === "approved" ? "ui.approvalToast" : "ui.denialToast"), { id: "crm-example-approval", duration: 3000 });
  };
  const pending = approvals.filter((request) => !request.status || request.status === "pending").length;
  const data: AgentConsoleData = {
    title: t("title"), environment: t("environment"),
    team: agents.map((agent) => ({ id: agent.id, name: agent.name, status: agent.status === "running" ? "working" : agent.status === "waiting" ? "away" : "online" })),
    stats: [
      { id: "completed", label: t("stats.completed"), value: String(124 + approvals.filter((request) => request.status === "approved").length), delta: 18.1, trend: [45, 58, 52, 77, 94, 104, 124], hint: t("stats.today") },
      { id: "saved", label: t("stats.saved"), value: t("stats.savedValue"), delta: 24, trend: [1.2, 2.3, 2.1, 3.7, 4.5, 5.9, 6.8], hint: t("stats.estimated") },
      { id: "approvals", label: t("stats.approvals"), value: String(pending), higherIsBetter: false, hint: t("stats.review") },
      { id: "quality", label: t("stats.quality"), value: "98.4%", delta: 2.3, trend: [92, 94, 93, 96, 95, 97, 98.4], hint: t("stats.week") },
    ],
    agents,
    run: { name: t("ui.traceFor", { name: agent.name }), elapsedMs: 9600, spans: t.raw(`traces.${agent.id}`) as AgentConsoleData["run"]["spans"] },
    evals: t.raw("evals") as AgentConsoleData["evals"],
    usage: {
      models: [{ id: "assistant", name: t("usage.assistant"), color: "#b9bac4" }, { id: "routing", name: t("usage.routing"), color: "#565762" }],
      days: Array.from({ length: 12 }, (_, i) => ({ date: `2026-11-${String(i + 1).padStart(2, "0")}`, byModel: { assistant: { tokens: 12000 + i * 1600 + (i % 3) * 2800, cost: 0.38 + i * 0.04 }, routing: { tokens: 3000 + i * 420, cost: 0.08 + i * 0.012 } } })),
      previousCost: 13.6, budget: { limit: 30, label: t("usage.budget") },
    },
    limits: { model: t("usage.workspace"), limits: [{ id: "requests", label: t("usage.requests"), limit: 100, remaining: 82, resetsInMs: 45000 }, { id: "tokens", label: t("usage.tokens"), limit: 100000, remaining: 76200, resetsInMs: 45000 }] },
    context: { limit: 32000, model: "LOCUS AI", segments: [{ id: "rules", label: t("context.rules"), tokens: 1200, color: "#565762" }, { id: "documents", label: t("context.documents"), tokens: 4800, color: "#b9bac4" }, { id: "history", label: t("context.history"), tokens: 1600, color: "#858692" }] },
    approvals,
  };
  const evalLabels: EvalLabels = {
    results: t("ui.evals"), filter: t("ui.evalFilter"), cases: t("ui.evalCases"), count: (count) => t("ui.caseCount", { count }),
    running: (count, total) => t("ui.evalRunning", { count, total }), finished: (passed, total) => t("ui.evalFinished", { passed, total }),
    filters: { all: t("ui.all"), failed: t("ui.failed"), regressed: t("ui.regressed"), improved: t("ui.improved") },
    statuses: { pending: t("ui.status.queued"), running: t("ui.status.running"), pass: t("ui.pass"), fail: t("ui.failed"), regressed: t("ui.regressed"), improved: t("ui.improved") },
    compare: { up: t("ui.up"), down: t("ui.down"), baselineDelta: t("ui.baselineDelta"), baseline: t("ui.baseline"), candidate: t("ui.candidate"), better: t("ui.better"), worse: t("ui.worse"), noChange: t("ui.noChange"), regressed: t("ui.regressedCases"), noRegressions: t("ui.noRegressions") },
    input: t("ui.input"), expected: t("ui.expected"), actual: t("ui.actual"), score: t("ui.score"),
  };
  const selectAgent = (agent: BackgroundAgent) => { setSelected(agent.id); setSection("runs"); };
  const pauseAgent = (agent: BackgroundAgent) => setAgents((current) => current.map((item) => item.id === agent.id ? { ...item, status: "paused" } : item));
  const resumeAgent = (agent: BackgroundAgent) => setAgents((current) => current.map((item) => item.id === agent.id ? { ...item, status: "running" } : item));
  const undo = (request: ToolApprovalRequest) => {
    toast.dismiss("crm-example-approval");
    setApprovals((current) => current.map((item) => item.id === request.id ? { ...item, status: "pending" } : item));
    setAgents((current) => current.map((item) => item.id === "support" ? { ...item, status: "waiting", progress: .85, action: t("ui.status.waiting") } : item));
  };
  const settings = <Connections enabled={enabled} onToggle={(index) => setEnabled((current) => current.map((value, i) => i === index ? !value : value))} />;
  return <div ref={root} className={styles.demo} data-pricing-crm data-device={device}>
    <AgentConsole data={data} section={section} onSectionChange={setSection} evalLabels={evalLabels}
      hideTeam hideEnvironment
      brand={<span className={styles.brand}><BrandLogo className="size-[17px] bg-current" />GRIDS CRM</span>}
      headerTitle={section === "agents" ? t("dashboard.greeting") : t(`ui.${section}`)}
      sidebarIntro={<><div className={styles.workspace}><FallbackAvatar name="GRIDS Growth" size={28} animated={false} /><span><strong>GRIDS Studio</strong><span>{t("environment")}</span></span></div><p className={styles.platform}>{t("dashboard.platform")}</p></>}
      headerActions={section === "agents" && <div className={styles.headerActions}>
        <Select value={String(period)} onValueChange={(value) => setPeriod(Number(value) as DashboardPeriod)}>
          <SelectTrigger size="sm" className={styles.periodTrigger} aria-label={t("dashboard.period")}><SelectValue /></SelectTrigger>
          <SelectContent position="popper" align="end" sideOffset={5} className={styles.periodMenu}>
            {([7, 30, 90] as const).map((days) => <SelectItem key={days} value={String(days)} className={styles.periodOption}>{t("dashboard.days", { count: days })}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className={styles.dateRange}><CalendarDays size={13} aria-hidden="true" />{period === 7 ? "11.06 – 11.12" : period === 90 ? "08.15 – 11.12" : "10.14 – 11.12"}, 2026</span>
        <details className={styles.customize} onKeyDown={(event) => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}><summary aria-label={t("dashboard.customize")}><SlidersHorizontal size={14} aria-hidden="true" /><span>{t("dashboard.customize")}</span></summary><div><label><input type="checkbox" checked={showInsights} onChange={(event) => setShowInsights(event.target.checked)} />{t("dashboard.insights")}</label><label><input type="checkbox" checked={showActivity} onChange={(event) => setShowActivity(event.target.checked)} />{t("dashboard.activity")}</label></div></details>
      </div>}
      overview={<PricingCrmDashboard period={period} showInsights={showInsights} showActivity={showActivity} onNavigate={setSection} />}
      settingsPanel={settings}
      sectionContent={section !== "agents" && <PricingCrmViews section={section} data={data} selected={selected} evalLabels={evalLabels} settings={settings} onSelect={selectAgent} onPause={pauseAgent} onResume={resumeAgent} onDecide={decide} onUndo={undo} />}
      onUndo={undo} onSelectAgent={selectAgent} onDecide={decide} onPauseAgent={pauseAgent} onResumeAgent={resumeAgent}
    />
  </div>;
}

export default function PricingCrmDemo({ device = "desktop" }: { device?: ExamplePreviewDevice }) {
  const locale = useLocale();
  return <ConsoleSession key={locale} device={device} />;
}
