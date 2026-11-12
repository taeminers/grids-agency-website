"use client";

import { ArrowsIn, Lock, Warning } from "@phosphor-icons/react";
import { MotionConfig } from "motion/react";
import { Button } from "@/components/ui/action-button";
import { RollingNumber } from "@/components/ui/rolling-number";
import { Tag } from "@/components/ui/status-pill";
import { Panel, Shell } from "@/components/ui/surface";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export type ContextSegment = {
  id: string;
  label: string;
  tokens: number;
  /** Secondary text under the label, such as "14 tools". */
  detail?: string;
  /** Marks a segment that compaction never drops. */
  pinned?: boolean;
  /** Any CSS color. Defaults to the built-in palette by position. */
  color?: string;
};

export type ContextWindowMeterProps = {
  data: { limit: number; segments: ContextSegment[]; model?: string };
  /** Share of the limit (0–1) where the warning zone starts. */
  warnAt?: number;
  onCompact?: () => void;
  compacting?: boolean;
  /** `card` for a panel, `inline` for a single row in a composer footer. */
  variant?: "card" | "inline" | "bar";
  className?: string;
};

// Segment colors: the brand blue, indigo, purple, teal, green, gray.
const palette = ["var(--brand)", "#5e5ce6", "#bf5af2", "#40c8e0", "#30c05a", "#8e8e93"];

export const formatTokens = (n: number) =>
  n < 1000 ? `${Math.round(n)}` : `${(n / 1000).toFixed(n < 100_000 ? 1 : 0)}k`;

/** Splits the limit into `count` cells and colors each by the segment that fills it. */
function fillCells(
  segments: { tokens: number; color: string }[],
  limit: number,
  count: number,
) {
  const cells: (string | null)[] = [];
  for (const s of segments) {
    // Every non-empty segment gets at least one cell, so small ones stay visible.
    const n = s.tokens > 0 ? Math.max(1, Math.round((s.tokens / limit) * count)) : 0;
    for (let i = 0; i < n && cells.length < count; i++) cells.push(s.color);
  }
  while (cells.length < count) cells.push(null);
  return cells;
}

export function ContextWindowMeter({
  data,
  warnAt = 0.8,
  onCompact,
  compacting = false,
  variant = "card",
  className,
}: ContextWindowMeterProps) {
  const t = useTranslations("Pricing.examples.chat.ui");
  const c = useTranslations("Pricing.examples.console.ui");
  const locale = useLocale();
  const { limit, segments } = data;
  const used = segments.reduce((n, s) => n + s.tokens, 0);
  const ratio = used / limit;
  const warning = ratio >= warnAt;
  const colored = segments.map((s, i) => ({
    ...s,
    color: s.color ?? palette[i % palette.length],
  }));
  const inline = variant === "inline";
  const count = inline ? 20 : 100;
  const cells = fillCells(colored, limit, count);
  const percent = Math.round(ratio * 100);

  const grid = (
    <div
      role="meter"
      aria-label="Context window usage"
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={used}
      aria-valuetext={`${used.toLocaleString("en-US")} of ${limit.toLocaleString("en-US")} tokens (${percent}%)`}
      className={cn(
        "grid",
        inline ? "w-28 grid-cols-[repeat(20,1fr)] gap-px" : "grid-cols-20 gap-1",
      )}
    >
      {cells.map((color, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            "transition-colors duration-200 ease-out motion-reduce:duration-0",
            inline ? "h-2.5 rounded-[2px]" : "aspect-square rounded-[3px]",
            !color &&
              (i >= Math.round(warnAt * count)
                ? "bg-warning/20"
                : "bg-foreground/[0.07]"),
          )}
          style={{ background: color ?? undefined }}
        />
      ))}
    </div>
  );

  const compactButton = onCompact && (
    <Button
      onClick={onCompact}
      loading={compacting}
      icon={ArrowsIn}
      iconWeight="bold"
      aria-label={c(compacting ? "compacting" : "compact")}
      className={cn(
        "disabled:opacity-70",
        warning && "bg-warning/15 text-warning hover:bg-warning/25",
        inline && "h-6 gap-1.5 px-2.5 text-[0.6875rem]",
      )}
    >
      {c(compacting ? "compacting" : "compact")}
    </Button>
  );

  const announcement = compacting
    ? "Compacting context"
    : warning
      ? "Approaching context limit"
      : "";

  if (variant === "bar") {
    const segmentCount = 24;
    const filled = Math.ceil(Math.min(Math.max(ratio, 0), 1) * segmentCount);
    const usageColors = ["#45baf2", "#6287e8", "#9b7ce8", "#b89ae9"];
    return (
      <div className={cn("flex w-full max-w-80 items-center gap-3 py-1", className)} title={t("tokenUsage")}>
        <div role="meter" aria-label={t("tokenUsage")} aria-valuemin={0} aria-valuemax={limit}
          aria-valuenow={Math.min(used, limit)} aria-valuetext={t("tokenValue", { used: used.toLocaleString(locale), limit: limit.toLocaleString(locale) })}
          className="grid min-w-16 max-w-36 flex-1 grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px]">
          {Array.from({ length: segmentCount }, (_, index) => (
            <span key={index} aria-hidden="true"
              className={cn("h-2 rounded-[1px] transition-colors duration-200 motion-reduce:transition-none",
                index >= filled && (index >= Math.round(warnAt * segmentCount) ? "bg-warning/20" : "bg-foreground/10"))}
              style={{ backgroundColor: index < filled ? usageColors[index % usageColors.length] : undefined }} />
          ))}
        </div>
        <span aria-hidden="true" className="shrink-0 whitespace-nowrap font-mono text-[0.6875rem] leading-none text-muted-foreground tabular-nums">
          <span className="text-foreground/80">{formatTokens(used)}</span>
          <span className="px-1.5 opacity-50">/</span>
          {formatTokens(limit)}
        </span>
      </div>
    );
  }

  if (inline) {
    return (
      <MotionConfig reducedMotion="user">
        <div className={cn("flex items-center gap-2 text-xs", className)}>
          {warning && (
            <Warning
              weight="fill"
              className="size-3.5 text-warning"
              aria-label="Near limit"
            />
          )}
          {grid}
          <span className="font-mono text-muted-foreground tabular-nums">
            <span className={cn("text-foreground", warning && "text-warning")}>
              <RollingNumber value={formatTokens(used)} />
            </span>
            {" / "}
            {formatTokens(limit)}
          </span>
          {warning && compactButton}
          <p role="status" aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <Shell aria-label={c("contextTitle")} className={cn("max-w-md", className)}>
        <Panel className="p-4">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h3 className="text-[0.8125rem] text-muted-foreground">
              {c("contextTitle")}
              {data.model && (
                <Tag className="ml-2 rounded-full px-2 text-foreground">{data.model}</Tag>
              )}
            </h3>
            {compactButton}
          </div>
          <p className="mb-4 flex items-baseline gap-2">
            <span
              className={cn(
                "font-mono text-[2rem] leading-tight font-medium tracking-tight tabular-nums",
                warning && "text-warning",
              )}
            >
              <RollingNumber value={formatTokens(used)} />
            </span>
            <span className="text-[0.8125rem] text-muted-foreground">
              {c("contextOf")} {formatTokens(limit)} · <RollingNumber value={`${percent}%`} /> {c("contextFull")}
            </span>
          </p>
          {grid}
          <p
            className={cn(
              "mt-3 flex items-center gap-1.5 text-xs",
              warning ? "text-warning" : "text-muted-foreground",
            )}
          >
            {warning && (
              <Warning weight="fill" className="size-3.5 shrink-0" aria-hidden="true" />
            )}
            {warning
              ? c("contextRemaining", { count: formatTokens(Math.max(limit - used, 0)) })
              : c("contextTail", { percent: 100 - Math.round(warnAt * 100) })}
          </p>
        </Panel>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1 px-3 py-3 @sm:grid-cols-2">
          {colored.map((s) => (
            <li key={s.id} className="flex items-start gap-2.5 py-1">
              <span
                aria-hidden="true"
                className="mt-1 size-2.5 shrink-0 rounded-[3px]"
                style={{ background: s.color }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 truncate text-[0.8125rem]">
                  {s.label}
                  {s.pinned && (
                    <Lock
                      weight="fill"
                      className="size-3 shrink-0 text-muted-foreground"
                      aria-label={c("pinned")}
                    />
                  )}
                </span>
                {s.detail && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {s.detail}
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatTokens(s.tokens)}
              </span>
            </li>
          ))}
        </ul>
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </Shell>
    </MotionConfig>
  );
}
