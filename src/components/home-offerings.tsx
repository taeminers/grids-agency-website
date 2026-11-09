"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { X } from "lucide-react";
import BrandLogo from "./brand-logo";
import FallbackAvatar from "./fallback-avatar";
import { useLocale, useTranslations } from "next-intl";
import ConsultationLink from "./consultation-link";
import GrowthPreview from "./growth-preview";
import WebsitePreview from "./website-preview";
import styles from "./home-offerings.module.css";

export default function HomeOfferings() {
  const locale = useLocale();
  const t = useTranslations("HomeOfferings");
  const partnershipRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: partnershipRef, offset: ["start 0.9", "start 0.65"] });
  const partnershipOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const mark = partnershipRef.current;
    if (!mark) return;
    mark.dataset.enhanced = "true";
    return () => { delete mark.dataset.enhanced; };
  }, []);

  return (
    <section id="offerings" className={styles.section} aria-labelledby="offerings-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <motion.div ref={partnershipRef} className={styles.partnership} style={{ opacity: partnershipOpacity }} role="img" aria-label={t("partnership")}>
            <div className={styles.partner} aria-hidden="true">
              <span className={styles.partnerMark}><BrandLogo className={styles.partnerLogo} /></span>
              <span className={styles.partnerLabel}>GRIDS</span>
            </div>
            <X className={styles.partnerCross} size={24} strokeWidth={2.5} aria-hidden="true" />
            <div className={styles.partner} aria-hidden="true">
              <span className={styles.partnerMark}>
                <FallbackAvatar name="GRIDS Growth" size={44} animated={true} className={styles.partnerAvatar} />
              </span>
              <span className={styles.partnerLabel}>{t("yourCompany")}</span>
            </div>
          </motion.div>
          <h2 id="offerings-heading" className={styles.heading}>
            {t("heading")}{" "}<span>{t("headingSecondary")}</span>
          </h2>
          <p className={styles.introduction}>{t("introduction")}</p>
        </header>

        <div className={styles.grid}>
          {(["build", "growth"] as const).map((offering) => (
            <article key={offering} className={styles.offering} aria-labelledby={`offering-${offering}`}>
              <div className={styles.imagePlaceholder}>
                {offering === "growth" ? <GrowthPreview /> : <WebsitePreview />}
              </div>
              <div className={styles.copy}>
                <h3 id={`offering-${offering}`}>{t(`${offering}.title`)}</h3>
                <p>{t(`${offering}.description`)}</p>
                <ConsultationLink href={`/${locale}/connect`} label={t(`${offering}.cta`)} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
