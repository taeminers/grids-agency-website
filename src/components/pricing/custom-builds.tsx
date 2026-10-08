"use client";

import { useId, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MetalButton } from "@/components/spectrumui/metal-button";
import styles from "./custom-builds.module.css";

const project = (u: number, v: number) => [0.866 * (u - v), (u + v) / 2];
const points = (vertices: number[][]) => vertices.map((point) => point.join(",")).join(" ");
const delay = (seconds: number) => ({ "--delay": `${seconds}s` }) as CSSProperties;

function Tile({ x, y, width, height, depth = 10, fill, children }: {
  x: number; y: number; width: number; height: number; depth?: number;
  fill: string; children?: ReactNode;
}) {
  const left = project(-width / 2, height / 2);
  const front = project(width / 2, height / 2);
  const right = project(width / 2, -height / 2);
  const lower = ([px, py]: number[]) => [px, py + depth];
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={points([left, front, lower(front), lower(left)])} fill="var(--background)" />
      <polygon points={points([left, front, lower(front), lower(left)])} fill="currentColor" fillOpacity="0.09" stroke="currentColor" strokeOpacity="0.2" />
      <polygon points={points([front, right, lower(right), lower(front)])} fill="var(--background)" />
      <polygon points={points([front, right, lower(right), lower(front)])} fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeOpacity="0.2" />
      <g transform="matrix(.866 .5 -.866 .5 0 0)">
        <g transform={`translate(${-width / 2} ${-height / 2})`}>
          <rect width={width} height={height} fill="var(--background)" />
          <rect width={width} height={height} fill={fill} stroke="currentColor" strokeOpacity="0.28" />
          {children}
        </g>
      </g>
    </g>
  );
}

function ConnectedSystems() {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const active = useInView(ref, { amount: 0.15 });
  const surface = `url(#${id}-surface)`;
  const routes = [
    "M172 156 L172 184 L264 237",
    "M460 164 L460 190 L376 238",
    "M320 260 L320 296 L420 354",
  ];

  return (
    <svg ref={ref} viewBox="0 0 640 460" fill="none" aria-hidden="true" focusable="false" className={styles.scene} data-active={active}>
      <defs>
        <linearGradient id={`${id}-surface`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="currentColor" stopOpacity="0.02" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.14" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop stopColor="var(--tertiary)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--tertiary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-edge`}>
          <stop stopColor="var(--tertiary)" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="var(--tertiary)" />
          <stop offset="1" stopColor="var(--tertiary)" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <ellipse cx="320" cy="268" rx="290" ry="170" fill={`url(#${id}-halo)`} />
      <g transform="matrix(.866 .5 -.866 .5 320 250)" stroke="currentColor" strokeOpacity="0.08">
        {Array.from({ length: 11 }, (_, i) => -180 + i * 36).map((position) => (
          <g key={position}>
            <path d={`M${position} -180 V180`} />
            <path d={`M-180 ${position} H180`} />
          </g>
        ))}
        <path d="M-180 -156 V-180 H-156 M156 -180 H180 V-156 M180 156 V180 H156 M-156 180 H-180 V156" strokeOpacity="0.5" strokeWidth="2" />
      </g>

      {routes.map((route, index) => (
        <g key={route}>
          <path d={route} stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
          <path d={route} pathLength="1" stroke="var(--tertiary)" strokeWidth="2.5" strokeLinecap="round" className={styles.signal} style={delay(-index * 1.6)} />
        </g>
      ))}

      {/* Dashboard: records and reporting. */}
      <g className={styles.float} style={delay(-2)}>
        <Tile x={172} y={128} width={150} height={102} fill={surface}>
          <path d="M0 23 H150 M36 23 V102" stroke="currentColor" strokeOpacity="0.18" />
          <circle cx="12" cy="12" r="3" fill="var(--tertiary)" />
          <text x="24" y="16" fill="currentColor" fontSize="10" fontFamily="monospace" letterSpacing="2">CRM</text>
          {[38, 51, 64, 77].map((y) => <path key={y} d={`M10 ${y} H25`} stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />)}
          <rect x="46" y="34" width="40" height="19" fill="currentColor" fillOpacity="0.06" />
          <rect x="92" y="34" width="46" height="19" fill="currentColor" fillOpacity="0.06" />
          <path d="M47 85 H138 M47 62 H138" stroke="currentColor" strokeOpacity="0.1" />
          <path d="M48 81 L65 73 L80 78 L98 64 L115 69 L137 58" stroke="var(--tertiary)" strokeWidth="2" />
          <circle cx="137" cy="58" r="3" fill="var(--tertiary)" />
        </Tile>
      </g>

      {/* Automation: one trigger branches into coordinated tasks. */}
      <g className={styles.float} style={delay(-4)}>
        <Tile x={460} y={135} width={128} height={106} fill={surface}>
          <path d="M64 28 V45 H31 V68 M64 45 H97 V68" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
          <rect x="49" y="10" width="30" height="25" rx="3" fill="var(--background)" stroke="var(--tertiary)" strokeOpacity="0.7" />
          <path d="M67 15 L59 24 H65 L61 31" stroke="var(--tertiary)" strokeWidth="1.5" strokeLinejoin="round" />
          {[16, 82].map((x) => (
            <g key={x}>
              <rect x={x} y="65" width="30" height="26" rx="3" fill="var(--background)" stroke="currentColor" strokeOpacity="0.3" />
              <path d={`M${x + 8} 78 L${x + 13} 83 L${x + 22} 73`} stroke="var(--tertiary)" strokeWidth="1.5" />
            </g>
          ))}
          <circle cx="64" cy="45" r="3" fill="var(--tertiary)" className={styles.core} />
        </Tile>
      </g>

      {/* AI core: a stack of compute layers with a illuminated circuit face. */}
      <Tile x={320} y={243} width={110} height={110} depth={7} fill={surface} />
      <Tile x={320} y={230} width={110} height={110} depth={7} fill={surface} />
      <g className={styles.float}>
        <Tile x={320} y={207} width={110} height={110} depth={13} fill={surface}>
          <rect x="8" y="8" width="94" height="94" stroke={`url(#${id}-edge)`} />
          {[33, 47, 63, 77].map((p) => <path key={p} d={`M${p} 15 V28 M${p} 82 V95 M15 ${p} H28 M82 ${p} H95`} stroke="var(--tertiary)" strokeOpacity="0.6" />)}
          <rect x="28" y="28" width="54" height="54" fill="var(--tertiary)" fillOpacity="0.07" stroke="var(--tertiary)" strokeOpacity="0.6" />
          <text x="55" y="65" textAnchor="middle" fill="currentColor" fontSize="28" fontWeight="500" fontFamily="monospace" letterSpacing="-2">AI</text>
          <rect x="8" y="8" width="94" height="94" stroke="var(--tertiary)" className={styles.core} />
        </Tile>
      </g>

      {/* Mobile: the same system, delivered to a handheld interface. */}
      <g className={styles.float} style={delay(-1)}>
        <Tile x={420} y={328} width={72} height={132} depth={8} fill={surface}>
          <rect x="6" y="6" width="60" height="120" rx="6" fill="var(--background)" stroke="currentColor" strokeOpacity="0.2" />
          <path d="M28 14 H44 M28 118 H44" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="14" y="28" width="44" height="30" rx="3" fill="var(--tertiary)" fillOpacity="0.1" />
          <path d="M29 44 L34 49 L44 38" stroke="var(--tertiary)" strokeWidth="2" />
          {[69, 85, 101].map((y) => <g key={y}><rect x="14" y={y - 5} width="8" height="8" fill="currentColor" fillOpacity="0.12" /><path d={`M28 ${y - 1} H56 M28 ${y + 3} H46`} stroke="currentColor" strokeOpacity="0.2" /></g>)}
        </Tile>
      </g>
    </svg>
  );
}

export default function CustomBuilds() {
  const t = useTranslations("Pricing.custom");
  const locale = useLocale();

  return (
    <section aria-labelledby="custom-builds-title" className="relative isolate mt-14 grid min-w-0 border border-foreground/15 bg-foreground/[0.018] lg:mt-20 lg:grid-cols-[1fr_1.05fr] lg:items-center">
      <div className="relative z-10 min-w-0 px-6 pt-9 pb-3 sm:px-10 sm:pt-12 lg:py-14 lg:pl-14 lg:pr-4">
        <h3 id="custom-builds-title" className="max-w-[22ch] text-[clamp(28px,3vw,42px)] leading-[1.3] font-medium tracking-[-0.05em] [word-break:keep-all]">{t("title")}</h3>
        <p className="mt-6 max-w-xl text-base leading-8 text-foreground/70 [word-break:keep-all] sm:text-lg sm:leading-9">{t("description")}</p>
        <MetalButton asChild size="lg" wrapperClassName="mt-8 rounded-none" className="min-h-14 gap-6 rounded-none text-sm">
          <Link href={`/${locale}/connect`}>{t("cta")}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </MetalButton>
      </div>
      <div className="pointer-events-none min-w-0 select-none px-3 pb-5 sm:px-6 lg:py-8">
        <ConnectedSystems />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-foreground/40">
        <span className="absolute top-0 left-0 size-3 border-t border-l" />
        <span className="absolute top-0 right-0 size-3 border-t border-r" />
        <span className="absolute bottom-0 left-0 size-3 border-b border-l" />
        <span className="absolute bottom-0 right-0 size-3 border-b border-r" />
      </div>
    </section>
  );
}
