// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
"use client";

import { ArrowDown, ArrowUp, Check, CircleNotch, Flask, X } from "@phosphor-icons/react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RollingNumber } from "@/components/ui/rolling-number";
import { Segmented } from "@/components/ui/segmented-control";
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import { Inset, Panel, Shell, ShellHeader } from "@/components/ui/surface";
import { useReducedMotionPreference } from "@/components/coin-preview/use-reduced-motion";
import { cn } from "@/lib/utils";

export type EvalStatus =
  "pending" | "running" | "pass" | "fail" | "regressed" | "improved";

export type EvalCase = {
  id: string;
  name: string;
  status: EvalStatus;
  /** Grader score from 0 to 1. */
  score?: number;
  input?: string;
  expected?: string;
  actual?: string;
  /** Why the grader scored it this way. */
  reason?: string;
};

export type EvalMetric = {
  id: string;
  label: string;
  baseline: number;
  candidate: number;
  /** Which direction counts as an improvement. */
  better: "higher" | "lower";
  format?: (value: number) => string;
};

export type EvalFilter = "all" | "failed" | "regressed" | "improved";

export type EvalLabels = {
  results: string; filter: string; cases: string;
  count: (count: number) => string;
  running: (count: number, total: number) => string;
  finished: (passed: number, total: number) => string;
  filters: Record<EvalFilter, string>;
  statuses: Record<EvalStatus, string>;
  input: string; expected: string; actual: string; score: string;
  compare?: { up: string; down: string; baselineDelta: string; baseline: string; candidate: string; better: string; worse: string; noChange: string; regressed: string; noRegressions: string };
};
const defaultCompareLabels: NonNullable<EvalLabels["compare"]> = { up: "Up", down: "Down", baselineDelta: "pts vs baseline", baseline: "Baseline", candidate: "Candidate", better: "Better", worse: "Worse", noChange: "No change", regressed: "Regressed cases", noRegressions: "Nothing regressed." };
const defaultLabels: EvalLabels = {
  results: "Eval results", filter: "Filter cases", cases: "Cases",
  count: (count) => `${count} cases`, running: (count, total) => `${count} of ${total} running`,
  finished: (passed, total) => `Eval finished: ${passed} of ${total} passed`,
  filters: { all: "All", failed: "Failed", regressed: "Regressed", improved: "Improved" },
  statuses: { pending: "Pending", running: "Running", pass: "Pass", fail: "Fail", regressed: "Regressed", improved: "Improved" },
  input: "Input", expected: "Expected", actual: "Actual", score: "Score",
};

export type EvalResultsProps = {
  data: {
    suite: string;
    /** e.g. "opus-5.5 vs sonnet-5.5". */
    label?: string;
    cases: EvalCase[];
    /** Baseline pass rate (0–1) for the delta next to the big number. */
    baselinePassRate?: number;
    metrics?: EvalMetric[];
  };
  /** `grid` shows every case; `compare` shows metrics and regressions. */
  view?: "grid" | "compare";
  filter?: EvalFilter;
  onFilterChange?: (filter: EvalFilter) => void;
  selectedId?: string | null;
  onSelectCase?: (testCase: EvalCase) => void;
  className?: string;
  labels?: EvalLabels;
  columns?: number;
  animateResults?: boolean;
  active?: boolean;
  /** Called once after the results and initial detail expansion finish. */
  onComplete?: () => void;
};

const statuses: Record<
  EvalStatus,
  { label: string; cell: string; icon?: typeof Check; tone: StatusTone }
> = {
  pending: {
    label: "Pending",
    cell: "bg-foreground/[0.07]",
    tone: "neutral",
  },
  running: {
    label: "Running",
    cell: "bg-[color-mix(in_srgb,var(--tuff-brand,#65aeda)_20%,transparent)] text-[var(--tuff-brand,#65aeda)]",
    icon: CircleNotch,
    tone: "brand",
  },
  pass: {
    label: "Pass",
    cell: "bg-[color-mix(in_srgb,var(--tuff-positive,#538674)_15%,transparent)] text-[var(--tuff-positive,#538674)]",
    icon: Check,
    tone: "positive",
  },
  fail: {
    label: "Fail",
    cell: "bg-[color-mix(in_srgb,var(--tuff-negative,#ba8383)_80%,transparent)] text-white",
    icon: X,
    tone: "negative",
  },
  regressed: {
    label: "Regressed",
    cell: "bg-[color-mix(in_srgb,var(--tuff-warning,#b48d5d)_85%,transparent)] text-white",
    icon: ArrowDown,
    tone: "warning",
  },
  improved: {
    label: "Improved",
    cell: "bg-[color-mix(in_srgb,var(--tuff-brand,#65aeda)_20%,transparent)] text-[var(--tuff-brand,#65aeda)]",
    icon: ArrowUp,
    tone: "brand",
  },
};

const filters: { id: EvalFilter; label: string; match: (s: EvalStatus) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "failed", label: "Failed", match: (s) => s === "fail" || s === "regressed" },
  { id: "regressed", label: "Regressed", match: (s) => s === "regressed" },
  { id: "improved", label: "Improved", match: (s) => s === "improved" },
];

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function EvalResults({
  data,
  view = "grid",
  filter: filterProp,
  onFilterChange,
  selectedId: selectedProp,
  onSelectCase,
  className,
  labels = defaultLabels,
  columns = 12,
  animateResults = false,
  active = true,
  onComplete,
}: EvalResultsProps) {
  const { cases } = data;
  const reduce = useReducedMotionPreference();
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (!animateResults || !active || reduce) return;
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setRevealed(count);
      if (count >= cases.length) clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, [animateResults, active, reduce, cases.length]);
  const displayCases = animateResults && !reduce
    ? cases.map((item, index): EvalCase => index < revealed ? item : { ...item, status: "pending" })
    : cases;
  const [filterState, setFilter] = useState<EvalFilter>("all");
  const [selectedState, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const [animateDetail, setAnimateDetail] = useState(true);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridColumns, setGridColumns] = useState(columns);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(([entry]) => {
      // Keep each check at least 24px wide, with 6px between checks.
      setGridColumns(Math.min(columns, Math.max(1, Math.floor((entry.contentRect.width + 6) / 30))));
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [columns, view]);
  const filter = filterProp ?? filterState;
  const selectedId = selectedProp !== undefined ? selectedProp : selectedState;
  const revealComplete = !animateResults || reduce || revealed >= cases.length;
  const selected = revealComplete ? cases.find((c) => c.id === selectedId) : undefined;
  const completionNotified = useRef(false);
  const notifyComplete = () => {
    if (!active || !revealComplete || completionNotified.current) return;
    completionNotified.current = true;
    onComplete?.();
  };
  useEffect(() => {
    if (active && revealComplete && (!selected || reduce) && !completionNotified.current) {
      completionNotified.current = true;
      onComplete?.();
    }
  }, [active, revealComplete, selected, reduce, onComplete]);
  const match = filters.find((f) => f.id === filter)!.match;

  const finished = displayCases.filter((c) => c.status !== "pending" && c.status !== "running");
  const passed = finished.filter((c) => c.status === "pass" || c.status === "improved");
  const rate = finished.length ? passed.length / (animateResults ? cases.length : finished.length) : 0;
  const delta = data.baselinePassRate !== undefined ? rate - data.baselinePassRate : null;
  const inFlight = cases.length - finished.length;
  const regressed = cases.filter((c) => c.status === "regressed");

  const select = (c: EvalCase, viaKeyboard: boolean) => {
    setAnimateDetail(!viaKeyboard);
    setSelected(c.id);
    onSelectCase?.(c);
  };

  const onGridKey = (e: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: gridColumns,
      ArrowUp: -gridColumns,
    };
    let next = focus;
    if (e.key in moves) next = focus + moves[e.key];
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = cases.length - 1;
    else return;
    e.preventDefault();
    next = Math.max(0, Math.min(cases.length - 1, next));
    setFocus(next);
    cells.current[next]?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <Shell
        aria-label={`${labels.results}: ${data.suite}`}
        className={cn("max-w-lg", className)}
      >
        <ShellHeader
          icon={Flask}
          title={data.suite}
          subtitle={
            <>
              {data.label ? `${data.label} · ` : ""}
              {inFlight ? labels.running(inFlight, cases.length) : labels.count(cases.length)}
            </>
          }
          aside={
            <div className="text-right">
              <p className="font-mono text-2xl leading-tight font-medium tracking-tight tabular-nums">
                <RollingNumber value={pct(rate)} />
              </p>
              {delta !== null && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums",
                    delta >= 0 ? "text-[var(--tuff-positive,#538674)]" : "text-[var(--tuff-negative,#ba8383)]",
                  )}
                >
                  {delta >= 0 ? (
                    <ArrowUp weight="bold" className="size-3" aria-hidden="true" />
                  ) : (
                    <ArrowDown weight="bold" className="size-3" aria-hidden="true" />
                  )}
                  <span className="sr-only">{delta >= 0 ? (labels.compare?.up ?? "Up") : (labels.compare?.down ?? "Down")}</span>
                  <RollingNumber value={Math.abs(delta * 100).toFixed(1)} /> {labels.compare?.baselineDelta ?? "pts vs baseline"}
                </span>
              )}
            </div>
          }
        />

        <Panel className="p-3">
          {view === "grid" ? (
            <>
              <Segmented
                label={labels.filter}
                className="mb-3"
                value={filter}
                onValueChange={(next) => {
                  setFilter(next);
                  onFilterChange?.(next);
                }}
                options={filters.map((f) => ({
                  value: f.id,
                  label: (
                    <>
                      {labels.filters[f.id]}
                      <RollingNumber
                        className="ml-1.5 font-mono text-xs opacity-60"
                        value={String(cases.filter((c) => f.match(c.status)).length)}
                      />
                    </>
                  ),
                }))}
              />
              <div
                ref={gridRef}
                role="group"
                aria-label={labels.cases}
                onKeyDown={onGridKey}
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
              >
                {displayCases.map((c, i) => {
                  const s = statuses[c.status];
                  const Icon = s.icon;
                  const dim = !match(c.status);
                  return (
                    <button
                      key={c.id}
                      ref={(el) => {
                        cells.current[i] = el;
                      }}
                      type="button"
                      tabIndex={i === focus ? 0 : -1}
                      aria-pressed={c.id === selected?.id}
                      aria-label={`${c.name}: ${labels.statuses[c.status]}`}
                      title={`${c.name} · ${labels.statuses[c.status]}`}
                      onFocus={() => setFocus(i)}
                      onClick={(e) => select(c, e.detail === 0)}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-[5px] transition-[background-color,opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] motion-reduce:transition-none",
                        s.cell,
                        dim && "opacity-20",
                        // Selection changes the shape, not an outline.
                        c.id === selected?.id && "scale-90 rounded-full",
                      )}
                    >
                      {Icon && (
                        <Icon
                          weight="bold"
                          className={cn(
                            "size-3",
                            c.status === "running" &&
                              "animate-spin motion-reduce:animate-none",
                          )}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <Compare
              labels={{ ...defaultCompareLabels, ...labels.compare }}
              metrics={data.metrics ?? []}
              regressed={regressed}
              onSelect={(c, kb) => select(c, kb)}
            />
          )}

          <AnimatePresence mode="wait" initial={false}>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0 } : {
                  height: { type: "spring", bounce: 0, duration: 0.5 },
                  opacity: { duration: animateDetail ? 0.25 : 0.12 },
                }}
                className="overflow-hidden"
                data-eval-detail=""
                onAnimationComplete={(definition) => {
                  if (typeof definition === "object" && "height" in definition && definition.height === "auto") notifyComplete();
                }}
              >
                <div className="pt-3"
              >
                <Inset className="p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <p className="min-w-0 flex-1 text-[0.8125rem] font-medium">
                      {selected.name}
                    </p>
                    <StatusPill
                      size="sm"
                      tone={statuses[selected.status].tone}
                      className="text-xs"
                    >
                      {labels.statuses[selected.status]}
                    </StatusPill>
                    {selected.score !== undefined && (
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {labels.score} {selected.score.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <dl className="grid gap-2 @lg:grid-cols-3">
                    {(
                      [
                        [labels.input, selected.input],
                        [labels.expected, selected.expected],
                        [labels.actual, selected.actual],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="min-w-0 rounded-lg bg-[var(--tuff-surface-inset,#ffffff)] p-2"
                      >
                        <dt className="mb-1 text-xs text-muted-foreground">{label}</dt>
                        <dd className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                          {value ?? "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {selected.reason && (
                    <p className="mt-2 text-[0.8125rem] text-muted-foreground">
                      {selected.reason}
                    </p>
                  )}
                </Inset>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>

        <p role="status" aria-live="polite" className="sr-only">
          {cases.length > 0 && !inFlight
            ? labels.finished(passed.length, cases.length)
            : ""}
        </p>
      </Shell>
    </MotionConfig>
  );
}

function Compare({
  labels,
  metrics,
  regressed,
  onSelect,
}: {
  labels: NonNullable<EvalLabels["compare"]>;
  metrics: EvalMetric[];
  regressed: EvalCase[];
  onSelect: (c: EvalCase, viaKeyboard: boolean) => void;
}) {
  return (
    <div data-slot="eval-comparison">
      <ul className="space-y-3">
        {metrics.map((m) => {
          const max = Math.max(m.baseline, m.candidate, Number.EPSILON);
          const fmt = m.format ?? ((v: number) => v.toLocaleString("en-US"));
          const diff = m.candidate - m.baseline;
          const improved = m.better === "higher" ? diff > 0 : diff < 0;
          const same = Math.abs(diff) < Number.EPSILON;
          return (
            <li key={m.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.8125rem]">
                <span>{m.label}</span>
                <StatusPill
                  size="sm"
                  tone={same ? "neutral" : improved ? "positive" : "negative"}
                  className="text-xs"
                >
                  {same
                    ? labels.noChange
                    : `${improved ? labels.better : labels.worse} · ${fmt(Math.abs(diff))}`}
                </StatusPill>
              </div>
              {(
                [
                  [labels.baseline, m.baseline, "neutral"],
                  [labels.candidate, m.candidate, "brand"],
                ] as const
              ).map(([label, value, color]) => (
                <div key={label} className="flex items-center gap-2 py-0.5">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground">
                    {label}
                  </span>
                  <ProgressBar
                    kind="meter"
                    striped
                    tone={color}
                    value={value}
                    max={max}
                    label={`${m.label}, ${label.toLowerCase()}`}
                    valueText={fmt(value)}
                    className="flex-1"
                  />
                  <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums">
                    {fmt(value)}
                  </span>
                </div>
              ))}
            </li>
          );
        })}
      </ul>
      <h4 className="mt-4 mb-1 text-[0.8125rem] text-muted-foreground">
        {labels.regressed} · {regressed.length}
      </h4>
      {regressed.length === 0 ? (
        <p className="py-2 text-[0.8125rem] text-muted-foreground">{labels.noRegressions}</p>
      ) : (
        <ul>
          {regressed.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={(e) => onSelect(c, e.detail === 0)}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-[background-color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-foreground/[0.04] active:scale-[0.99]"
              >
                <ArrowDown
                  weight="bold"
                  className="size-3.5 shrink-0 text-[var(--tuff-warning,#b48d5d)]"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 text-[0.8125rem] font-medium">
                  {c.name}
                </span>
                {c.score !== undefined && (
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {c.score.toFixed(2)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
