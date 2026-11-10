"use client";

import Container from "@/components/container";
import { useTranslations } from "next-intl";
import { HaloBands, type HaloPalette } from "@/components/detent/components/halo/HaloBands";
import { ArchiveDisclosure } from "./archive-disclosure";
import styles from "./archive-header.module.css";

// Start with the hero glass colors, then cycle through distinct color families.
const GLASS_HALOS: HaloPalette[] = [
  { name: "GRIDS glass", core: "#f5e5de", mid: "#8bcff0", edge: "#b299ef" },
  { name: "Rose", core: "#ffe0ed", mid: "#e591b7", edge: "#bba2e7" },
  { name: "Jade", core: "#e7f3aa", mid: "#6acdb4", edge: "#98dcdf" },
  { name: "Sunset", core: "#fff0b5", mid: "#eeb47f", edge: "#e49db8" },
];

export function ArchiveHeader() {
  const t = useTranslations("Archive");

  return (
    <header className={styles.hero}>
      <div className={styles.haloViewport}>
        <HaloBands className={styles.halo} palettes={GLASS_HALOS} pressToChange={true}>
          <Container className={styles.layout} innerClassName={styles.content} size="headline">
              <ArchiveDisclosure />
            <h1 className={styles.title}>
              <span>{t("Index.headline")}</span>
              <span className={styles.titleSecondary}>
                {t("Index.headlineSecondary")}
              </span>
            </h1>
          </Container>
        </HaloBands>
      </div>
    </header>
  );
}
