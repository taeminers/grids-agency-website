"use client";

import Container from "@/components/container";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { useSurfaceTheme } from "@/components/spectrumui/use-surface-theme";
import styles from "./pricing-header.module.css";

const CloudSky = dynamic(() => import("@/components/originkit/ui/cloud-sky"), { ssr: false });

const palettes = {
  dark: {
    background: "#17243e",
    baseColor: "#b27b79",
    accentColor: "#aaa0bc",
    sun: { x: 78, y: 18, glow: "rgba(236, 198, 227, 0.85)" },
    clouds: { softness: 130, shadow: 110, cirrus: 30 },
  },
  light: {
    background: "#62b0ed",
    baseColor: "#d8efff",
    accentColor: "#ffffff",
    sun: { x: 78, y: 82, glow: "rgba(255, 249, 222, 0.8)" },
    clouds: { softness: 115, shadow: 65, cirrus: 35 },
  },
};
const pointer = { parallax: 0, wind: 0 };
const skyStyle = { minWidth: 0, minHeight: 0 };

export default function PricingHeader() {
  const t = useTranslations("Pricing");
  const theme = useSurfaceTheme("auto");
  const reducedMotion = useReducedMotion();

  return (
    <header className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#62b0ed,#d8efff)] dark:bg-[linear-gradient(180deg,#17243e,#605572_65%,#b27b79)]">
        <CloudSky {...palettes[theme]} density={58} size={105} speed={14} paused={Boolean(reducedMotion)} pixelRatio={1.25} pointer={pointer} style={skyStyle} />
        <div className="absolute inset-0 bg-linear-to-r from-background/35 via-background/10 to-background/25 dark:from-background/45 dark:via-background/20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,var(--background)_100%)]" />
      </div>

      <Container innerClassName={styles.layout}>
        <h1 className={styles.title}>
          {t("title").split("\n").map((line, index) => <span key={line} className={index > 0 ? styles.titleSecondary : undefined}>{line}</span>)}
        </h1>
        <aside className={styles.card} aria-labelledby="pricing-guidance-heading">
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>{t("guidanceLabel")}</p>
            <p className={styles.currency}>
              <span>KRW</span><span className={styles.currencyDivider} aria-hidden="true" /><span>{t("vatNote")}</span>
            </p>
          </div>
          <h2 id="pricing-guidance-heading" className={styles.cardTitle}>{t("budgetNote")}</h2>
          <p className={styles.description}>{t("description")}</p>
        </aside>
      </Container>
    </header>
  );
}
