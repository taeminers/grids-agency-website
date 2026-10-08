"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import styles from "./package-card.module.css";

function outline(width: number, height: number) {
  const right = width - 1;
  const bottom = height - 1;
  const shoulder = Math.min(width * 0.25, 100);
  const foot = width * 0.72;

  return `M17 25 H${shoulder - 16}
    Q${shoulder - 5} 25 ${shoulder - 3} 14
    Q${shoulder - 1} 1 ${shoulder + 12} 1
    H${right - 16} Q${right} 1 ${right} 17
    V${bottom - 34} Q${right} ${bottom - 18} ${right - 16} ${bottom - 18}
    H${foot + 14} Q${foot + 3} ${bottom - 18} ${foot + 1} ${bottom - 9}
    Q${foot - 1} ${bottom} ${foot - 13} ${bottom}
    H17 Q1 ${bottom} 1 ${bottom - 16}
    V41 Q1 25 17 25 Z`;
}

export default function PackageCard({ children, featured }: { children: ReactNode; featured: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const id = useId();
  const [size, setSize] = useState({ width: 400, height: 640 });

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setSize((previous) => previous.width === width && previous.height === height ? previous : { width, height });
      }
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const followPointer = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    card.style.setProperty("--rotate-x", `${(0.5 - y) * 3}deg`);
    card.style.setProperty("--rotate-y", `${(x - 0.5) * 3}deg`);
  };

  const resetPointer = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.removeProperty("--rotate-x");
    event.currentTarget.style.removeProperty("--rotate-y");
  };

  const path = outline(size.width, size.height);

  return (
    <article ref={ref} className={styles.card} data-featured={featured} onPointerMove={followPointer} onPointerLeave={resetPointer} onPointerCancel={resetPointer}>
      <svg aria-hidden="true" focusable="false" className={styles.surface} viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--foreground)" stopOpacity="0.075" />
            <stop offset="0.45" stopColor="var(--foreground)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--foreground)" stopOpacity="0.025" />
          </linearGradient>
        </defs>
        <path d={path} fill="var(--background)" />
        <path d={path} className={styles.fill} />
        <path d={path} fill={`url(#${id}-sheen)`} className={styles.sheen} />
        <path d={path} fill="none" className={styles.border} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="relative z-10 flex min-w-0 flex-1 flex-col px-6 pt-14 pb-10 sm:px-8 sm:pt-16 sm:pb-12">
        {children}
      </div>
    </article>
  );
}
