"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { archiveProjects } from "./archive-project-data";
import { ArchiveProjectMedia } from "./archive-project-media";
import { ArchiveHeader } from "./archive-header";
import { ArchiveLink } from "./archive-navigation";
import styles from "./archive-grid.module.css";

export function ArchiveGrid() {
  const t = useTranslations("Archive");
  const locale = useLocale();

  return (
    <section className="text-foreground">
      <ArchiveHeader />
      <div className="mx-auto max-w-[1920px] px-5 pt-12 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-8 md:px-12 md:pt-20 lg:px-16">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:gap-y-12">
          {archiveProjects.map((project) => {
            const title = project.title ?? t(`${project.namespace}.projectTitle`);
            return (
              <ArchiveLink key={project.key} href={`/${locale}/archive/${project.slug}`} mediaSlug={project.slug} data-archive-project={project.slug} className={`group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-foreground ${styles.projectLink}`} aria-label={t("Index.open", { title })}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--site-card-radius)] bg-muted">
                  <div data-archive-media={project.slug} className="absolute inset-0 overflow-hidden rounded-[inherit]">
                    <ArchiveProjectMedia project={project} title={title} active className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transform-none" />
                  </div>
                  <div className={styles.notch}>
                    <h2 className={styles.projectName}>{title}</h2>
                    <span className={styles.separator} aria-hidden="true" />
                    <p className={styles.category}>{t(`${project.namespace}.title`)}</p>
                  </div>
                  <span aria-hidden="true" className={styles.openProject}><ArrowUpRight size={19} strokeWidth={1.6} /></span>
                </div>
              </ArchiveLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
