"use client";

import { ArchiveProjectMedia } from "@/components/archive/archive-project-media";
import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { featuredProjects } from "@/components/archive/archive-project-data";
import { useReducedMotionPreference } from "@/components/coin-preview/use-reduced-motion";
import styles from "./featured-work-carousel.module.css";

const projects = [
  { key: "tcl", slug: "the-clear-labs" },
  { key: "aether", slug: "aether" },
  { key: "jiam", slug: "jiam" },
].map(project => ({ ...featuredProjects.find(item => item.slug === project.slug)!, ...project }));

export default function FeaturedWorkCarousel() {
  const t = useTranslations("About.layout");
  const locale = useLocale();
  const reducedMotion = useReducedMotionPreference();
  const [viewportRef, api] = useEmblaCarousel({
    align: "center", loop: true, duration: reducedMotion ? 0 : 30,
  });
  const subscribe = useCallback((notify: () => void) => {
    if (!api) return () => {};
    api.on("select", notify).on("reInit", notify);
    return () => { api.off("select", notify).off("reInit", notify); };
  }, [api]);
  const snapshot = useCallback(() => api?.selectedScrollSnap() ?? 0, [api]);
  const active = useSyncExternalStore(subscribe, snapshot, () => 0);
  const project = projects[active];
  const move = (direction: -1 | 1) => {
    if (direction === 1) api?.scrollNext(reducedMotion);
    else api?.scrollPrev(reducedMotion);
  };

  return (
    <div className={styles.root}>
      <div ref={viewportRef} className={styles.carousel}
        role="region" aria-roledescription="carousel" aria-label={t("carouselHint")} tabIndex={0}
        onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}>
        <div className={styles.track}>
          {projects.map((item, index) => (
            <div key={item.slug} className={styles.slide} role="group" aria-roledescription="slide"
              aria-label={`${index + 1} / ${projects.length}`}>
              <Link href={`/${locale}/archive/${item.slug}`} className={styles.imageLink}
                tabIndex={index === active ? 0 : -1} draggable={false}
                aria-label={`${t(`${item.key}.title`)} — ${t("viewProject")}`}>
                <ArchiveProjectMedia project={item} title={t(`${item.key}.title`)}
                  className="absolute inset-0" />
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.footer}>
        <Link href={`/${locale}/archive/${project.slug}`} className={styles.projectLink} aria-label={`${t(`${project.key}.title`)} — ${t("viewProject")}`}>
          {t(`${project.key}.title`)}<ChevronRight size={18} strokeWidth={1.8} aria-hidden />
        </Link>
        <div className={styles.controls} role="group" aria-label={t("carouselLabel")}>
          <button type="button" onClick={() => move(-1)} aria-label={t("previousProject")}><ChevronLeft size={20} strokeWidth={1.8} aria-hidden /></button>
          <span className={styles.count} aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, "0")}<span>/ {String(projects.length).padStart(2, "0")}</span></span>
          <button type="button" onClick={() => move(1)} aria-label={t("nextProject")}><ChevronRight size={20} strokeWidth={1.8} aria-hidden /></button>
        </div>
      </div>
    </div>
  );
}
