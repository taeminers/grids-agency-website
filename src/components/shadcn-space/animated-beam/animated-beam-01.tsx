import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/components/shadcn-space/animated-beam/animated-beam-01.css";

export type BeamTarget = {
  id: string;
  label: string;
  icon: ReactNode;
  color?: string;
};

type AnimatedBeamDataFlowProps = {
  source: ReactNode;
  hub: ReactNode;
  targets: readonly BeamTarget[];
  label: string;
  captions: { intake: string; delivery: string };
  animated?: boolean;
  className?: string;
};

// Preserve the source → hub → targets sequence, flowing from left to right.
const TARGET_ROW_HEIGHT = 64;
function targetPath(y: number, middle: number) {
  if (y === middle) return `M180 ${middle} H410`;
  const direction = y < middle ? -1 : 1;
  return `M180 ${middle} H245 Q270 ${middle} 270 ${middle + direction * 25} V${y - direction * 25} Q270 ${y} 295 ${y} H410`;
}

export default function AnimatedBeamDataFlow({
  source, hub, targets, label, captions, animated = true, className,
}: AnimatedBeamDataFlowProps) {
  const height = targets.length * TARGET_ROW_HEIGHT;
  const middle = 14 + (targets.length - 1) * TARGET_ROW_HEIGHT / 2;
  const sourcePath = `M40 ${middle} H180`;
  return (
    <div className={cn("animated-beam-01", className)} data-animated={animated} role="group" aria-label={label}
      style={{ "--beam-stage-height": `${height}px`, "--beam-midline": `${middle}px` } as CSSProperties}>
      <svg aria-hidden="true" viewBox={`0 0 500 ${height}`} preserveAspectRatio="none" fill="none" className="animated-beam-01-lines">
        <path d={sourcePath} pathLength={100} strokeWidth={1.5} vectorEffect="non-scaling-stroke" className="beam-track" />
        <path d={sourcePath} pathLength={100} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="beam-pulse beam-pulse-source" />
        {targets.map((target, index) => {
          const path = targetPath(14 + index * TARGET_ROW_HEIGHT, middle);
          return (
            <g key={target.id} style={{ "--beam-color": target.color ?? "#a7d8f4" } as CSSProperties}>
              <path d={path} pathLength={100} strokeWidth={1.5} vectorEffect="non-scaling-stroke" className="beam-track" />
              <path d={path} pathLength={100} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="beam-pulse beam-pulse-target" />
            </g>
          );
        })}
      </svg>
      <p className="animated-beam-01-divider animated-beam-01-divider-intake">
        <span>{captions.intake}</span>
      </p>
      <p className="animated-beam-01-divider animated-beam-01-divider-delivery">
        <span>{captions.delivery}</span>
      </p>
      <div className="animated-beam-01-source" aria-hidden="true">{source}</div>
      <div className="animated-beam-01-hub" aria-hidden="true">{hub}</div>
      <ul className="animated-beam-01-targets">
        {targets.map((target) => (
          <li key={target.id} className="animated-beam-01-target">
            <span className="animated-beam-01-icon" aria-hidden="true" style={{ color: target.color }}>{target.icon}</span>
            <span className="animated-beam-01-label">{target.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
