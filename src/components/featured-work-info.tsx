"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import ConsultationLink from "@/components/consultation-link";
import type { ArchiveProject } from "@/components/archive/archive-project-data";
import styles from "./featured-work-list.module.css";

export default function FeaturedWorkInfo({ project, href, headingId }: {
  project: ArchiveProject;
  href: string;
  headingId: string;
}) {
  const t = useTranslations(`Archive.${project.namespace}`);
  const common = useTranslations("About.layout");
  const [selected, setSelected] = useState(0);
  const title = project.title ?? t("projectTitle");
  const image = project.gallery[selected];

  return (
    <div className={styles.info}>
      <Dialog.Root>
        <div className={styles.gallery} role="group" aria-label={t("galleryLabel")}>
          {project.gallery.map((item, index) => (
            <Dialog.Trigger key={item.key} asChild>
              <button type="button" className={styles.thumbnail} onClick={() => setSelected(index)}
                aria-label={t("enlarge", { image: t(`images.${item.key}`) })}>
                <Image src={item.src} alt={t(`images.${item.key}`)} fill
                  sizes="(max-width: 767px) 32vw, 160px" className={styles.thumbnailImage} />
              </button>
            </Dialog.Trigger>
          ))}
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.galleryOverlay} />
          <Dialog.Content className={styles.galleryDialog}>
            <div className={styles.galleryHeader}>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Close className={styles.galleryClose} aria-label={t("close")}><X size={20} /></Dialog.Close>
            </div>
            {image && <div className={styles.enlargedImage}>
              <Image src={image.src} alt={t(`images.${image.key}`)} fill sizes="(max-width: 960px) 92vw, 900px" />
            </div>}
            <Dialog.Description className={styles.galleryCaption}>{image ? t(`images.${image.key}`) : t("galleryLabel")}</Dialog.Description>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className={styles.copy}>
        <h3 id={headingId} className={styles.title}>{title}</h3>
        <p className={styles.description}>{t("heading")}</p>
      </div>
      <dl className={styles.facts}>
        <div><dt>{t("industryLabel")}</dt><dd>{t("industry")}</dd></div>
        <div><dt>{t("scopeLabel")}</dt><dd>{t("scope")}</dd></div>
      </dl>
      <div className={styles.footer}>
        <ConsultationLink href={href} label={common("viewProject")} aria-label={`${common("viewProject")}: ${title}`} />
      </div>
    </div>
  );
}
