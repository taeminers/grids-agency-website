"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useSpring } from "framer-motion";
import styles from "./article-timeline.module.css";

type ArticleSection = { id: string; label: string };

/** Adds reading-position feedback; the article itself remains server-rendered. */
export default function ArticleTimeline({ sections }: { sections: readonly ArticleSection[] }) {
  const wrapper = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const progress = useSpring(0, { stiffness: 300, damping: 35, mass: .8 });

  useEffect(() => {
    if (!sections.length) return;
    const root = wrapper.current?.closest<HTMLElement>("[data-article-body]");
    if (!root || !list.current) return;
    const fills = Array.from(list.current.querySelectorAll<HTMLElement>("[data-article-progress]"));
    let frame = 0;
    let initialized = false;
    let lastTarget = 0;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const unsubscribe = progress.on("change", value => {
      fills.forEach((fill, index) => {
        const filled = Math.max(0, Math.min(1, value - index));
        // Reveal the fixed gradient without compressing its colors as it fills.
        fill.style.clipPath = `inset(0 0 ${(1 - filled) * 100}% 0)`;
      });
    });

    const update = () => {
      frame = 0;
      if (!matchMedia("(min-width: 768px)").matches) {
        progress.stop();
        initialized = false;
        return;
      }
      const targets = sections.map(section => document.getElementById(section.id));
      if (targets.some(target => !target)) return;
      const offset = Math.min(innerHeight * .3, Math.max(96, parseFloat(getComputedStyle(document.documentElement).fontSize) * 7));
      const readingY = scrollY + offset;
      const positions = targets.map(target => target!.getBoundingClientRect().top + scrollY);
      let index = 0;
      for (let i = 0; i < positions.length; i++) if (readingY + 1 >= positions[i]) index = i;
      setActive(current => current === index ? current : index);

      const start = positions[index];
      const end = positions[index + 1] ?? root.getBoundingClientRect().bottom + scrollY;
      const fraction = Math.max(0, Math.min(1, (readingY - start) / Math.max(1, end - start)));
      const target = index + fraction;
      // One cumulative value keeps completed sections full and fills the current
      // rectangle top to bottom, with continuous motion when scrolling reverses.
      if (!initialized || reducedMotion.matches) {
        progress.jump(target);
      } else if (target !== lastTarget) {
        progress.set(target);
      }
      lastTarget = target;
      initialized = true;
    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(document.documentElement);
    observer.observe(list.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reducedMotion.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      unsubscribe();
      progress.stop();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
    };
  }, [sections, progress]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", `#${id}`);
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  if (!sections.length) return null;
  return <aside ref={wrapper} className={styles.wrapper}>
    <nav className={styles.timeline} aria-label="이 글의 목차">
        <ol ref={list} className={styles.sections} role="list">
          {sections.map((section, index) => <li key={section.id} style={{
            "--segment-start": `${100 - index / sections.length * 100}%`,
            "--segment-end": `${100 - (index + 1) / sections.length * 100}%`,
          } as CSSProperties}>
            <span className={styles.segment} aria-hidden="true" data-article-segment>
              <span className={styles.fill} data-article-progress />
            </span>
            <a href={`#${section.id}`} aria-current={index === active ? "location" : undefined}
              onClick={event => navigate(event, section.id)}>{section.label}</a>
          </li>)}
        </ol>
    </nav>
  </aside>;
}
