"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ArchiveProject } from "./archive-project-data";
import { ArchiveProjectMedia } from "./archive-project-media";
import ConsultationLink from "@/components/consultation-link";
import styles from "./archive-project-detail.module.css";

export function ArchiveProjectDetail({ project }: { project: ArchiveProject }) {
  const locale = useLocale();
  const t = useTranslations(`Archive.${project.namespace}`);
  const common = useTranslations("Archive.Detail");
  const title = project.title ?? t("projectTitle");


  return (
    <article className={styles.page} lang={locale}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {project.status === "inactive" ? (
          <p className={styles.status}>{common("inactive")}</p>
        ) : project.href ? <ConsultationLink
          label={t("visit")}
          className={styles.visit}
          href={project.external ? project.href : `/${locale}${project.href}`}
          target={project.external ? "_blank" : undefined}
          rel={project.external ? "noopener noreferrer" : undefined}
        /> : null}
      </header>

      <div data-archive-detail-media={project.slug} className={styles.heroMedia} style={{ viewTransitionName: "archive-project-media" }}>
        <ArchiveProjectMedia project={project} title={title} eager className={styles.mediaContent} />
      </div>

      <div className={styles.overview}>
        <section className={styles.details} aria-labelledby="project-details-heading">
          <h2 id="project-details-heading" className={styles.sectionLabel}>{common("details")}</h2>
          <dl className={styles.facts}>
            <div><dt>{common("client")}</dt><dd>{t("client")}</dd></div>
            <div><dt>{common("services")}</dt><dd>{t("scope")}</dd></div>
            <div><dt>{t("industryLabel")}</dt><dd>{t("industry")}</dd></div>
          </dl>
        </section>
        <section className={styles.introduction} aria-labelledby="project-introduction-heading">
          <h2 id="project-introduction-heading" className={styles.sectionLabel}>{common("introduction")}</h2>
          <p className={styles.statement}>{t("heading")}</p>
          <p className={styles.description}>{t("description")}</p>
        </section>
      </div>

    </article>
  );
}
