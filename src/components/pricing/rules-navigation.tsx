"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
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
        <p className={styles.navigationTitle}>{label}</p>
        <ul className={styles.navigationItems}>
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <li key={item.id} className={styles.navigationItem}>
                <a
                  href={`#${item.id}`}
                  aria-current={active ? "location" : undefined}
                  className={styles.navigationLink}
                >
                  <span className={styles.navigationLabel}>{item.label}</span>
                  <ChevronRight strokeWidth={3.5} size={14} aria-hidden="true" className={styles.navigationArrow} />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
