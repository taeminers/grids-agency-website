"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./rules-grid.module.css";

type SectionLink = { id: string; label: string };

export default function RulesNavigation({ label, items }: { label: string; items: SectionLink[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    const sections = sectionIds.map((id) => document.getElementById(id)).filter((section) => section !== null);
    let frame = 0;

    const update = () => {
      frame = 0;
      // Match the sections' scroll margin below the fixed site navigation.
      let current = sections[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 160) current = section.id;
        else break;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sectionIds]);

  return (
    <aside className={styles.sidebar}>
      <nav aria-label={label} className={styles.navigation}>
        <p className={cn(styles.navigationTitle, "text-xs font-medium text-muted-foreground")}>{label}</p>
        <ul className={styles.navigationItems}>
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <li key={item.id} className={styles.navigationItem}>
                <a
                  href={`#${item.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "group relative flex min-h-11 items-center justify-between gap-5 px-5 py-3 text-sm leading-5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary motion-reduce:transition-none lg:min-h-12",
                    active ? "bg-foreground/[0.055] font-medium text-foreground" : "text-muted-foreground hover:bg-foreground/[0.025] hover:text-foreground",
                  )}
                >
                  <span aria-hidden="true" className={cn("absolute inset-y-3 left-0 w-0.5 bg-tertiary transition-opacity motion-reduce:transition-none", active ? "opacity-100" : "opacity-0")} />
                  <span className="whitespace-nowrap lg:whitespace-normal">{item.label}</span>
                  <ArrowRight size={14} aria-hidden="true" className={cn("shrink-0 transition-opacity motion-reduce:transition-none", active ? "opacity-70" : "opacity-0 group-hover:opacity-40 group-focus-visible:opacity-40")} />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
