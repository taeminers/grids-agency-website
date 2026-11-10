"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import { WebGLGuard } from "./coin-preview/webgl-guard";
import styles from "./website-hero-preview.module.css";

const GlimmerVale = dynamic(() => import("./originkit/ui/glimmer-vale"), { ssr: false });

export default function WebsiteHeroPreview() {
  const t = useTranslations("HomeOfferings.build.hero");
  const locale = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const visible = useInView(root);
  const reduced = useReducedMotionPreference();
  const [expanded, setExpanded] = useState(false);

  return (
    <div ref={root} lang={locale} className={styles.hero} role="group" aria-label={t("label")}>
      <div className={styles.masthead}>
        <span className={styles.brand}>ROAM</span>
      </div>
      <div className={styles.content}>
        <p className={styles.headline}>
          {t("headline").split("\n").map(line => <span key={line}>{line}</span>)}
        </p>
        <button className={styles.cta} type="button" aria-pressed={expanded}
          onClick={() => setExpanded(value => !value)}>
          {t("cta")}
        </button>
      </div>
      <div className={styles.deck} data-expanded={expanded} aria-hidden="true">
        <div className={`${styles.card} ${styles.backLeft}`} />
        <div className={`${styles.card} ${styles.backRight}`} />
        <div className={`${styles.card} ${styles.featured}`}>
          <div className={styles.artwork}>
            {visible && (
              <WebGLGuard>
                <GlimmerVale speed={reduced ? 0 : 35} style={{ minWidth: 0, minHeight: 0 }} advanced={{ hover: 0 }} />
              </WebGLGuard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
