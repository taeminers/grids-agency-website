"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type PointerEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import FeaturedWorkInfo from "@/components/featured-work-info";
import { featuredProjects } from "@/components/archive/archive-project-data";
import styles from "./featured-work-list.module.css";

const projects = [
  { key: "tcl", slug: "the-clear-labs" },
  { key: "aether", slug: "aether" },
  { key: "jiam", slug: "jiam" },
].map(project => ({ ...featuredProjects.find(item => item.slug === project.slug)!, ...project }));

function followPointer(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const media = event.currentTarget;
  const badge = media.querySelector<HTMLElement>("[data-project-cursor]");
  if (!badge) return;
  const rect = media.getBoundingClientRect();
  const halfWidth = badge.offsetWidth / 2 + 12;
  const halfHeight = badge.offsetHeight / 2 + 12;
  const x = Math.max(halfWidth, Math.min(rect.width - halfWidth, event.clientX - rect.left));
  const y = Math.max(halfHeight, Math.min(rect.height - halfHeight, event.clientY - rect.top));
  media.style.setProperty("--cursor-x", `${x}px`);
  media.style.setProperty("--cursor-y", `${y}px`);
  media.dataset.tracking = "true";
}

export default function FeaturedWorkList() {
  const t = useTranslations("About.layout");
  const locale = useLocale();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const videos = Array.from(element.querySelectorAll("video"));
    const visible = new Set<HTMLVideoElement>();
    const canPlay = (video: HTMLVideoElement) => visible.has(video) && !document.hidden && !reduced.matches;
    const sync = () => {
      videos.forEach(video => {
        if (canPlay(video)) {
          void video.play().then(() => {
            if (!canPlay(video)) video.pause();
          }).catch(() => { /* Keep the poster when autoplay is unavailable. */ });
        } else video.pause();
      });
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) visible.add(video);
        else visible.delete(video);
      });
      sync();
    }, { threshold: 0.1 });
    videos.forEach(video => observer.observe(video));
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      visible.clear();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      videos.forEach(video => video.pause());
    };
  }, []);

  return (
    <div ref={root} className={styles.list}>
      {projects.map(project => {
        const { key, slug, video, poster } = project;
        const href = `/${locale}/archive/${slug}`;
        return (
          <article key={key} className={styles.row} aria-labelledby={`${id}-${key}`} data-scroll-reveal="fade">
            <Link href={href} className={styles.media} aria-label={`${t("viewProject")}: ${t(`${key}.title`)}`}
              onPointerEnter={followPointer} onPointerMove={followPointer}
              onPointerLeave={event => { delete event.currentTarget.dataset.tracking; }}
              onPointerCancel={event => { delete event.currentTarget.dataset.tracking; }}>
              <video src={video} poster={poster ?? undefined} aria-hidden="true"
                className={styles.video} muted loop playsInline preload="metadata" />
              <span className={styles.cursor} data-project-cursor aria-hidden="true">{t("viewProject")}</span>
            </Link>
            <FeaturedWorkInfo project={project} href={href} headingId={`${id}-${key}`} />
          </article>
        );
      })}
    </div>
  );
}
