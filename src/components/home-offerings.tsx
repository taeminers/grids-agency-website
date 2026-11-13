"use client";

import Container from "@/components/container";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import BrandLogo from "./brand-logo";
import FallbackAvatar from "./fallback-avatar";
import { useLocale, useTranslations } from "next-intl";
import ConsultationLink from "./consultation-link";
import GrowthPreview from "./growth-preview";
import WebsitePreview from "./website-preview";
import styles from "./home-offerings.module.css";

function HeadlineMark({ progress, index, children }: { progress: MotionValue<number>; index: number; children: ReactNode }) {
  const reveal = useTransform(progress, [index * 0.2, 0.7 + index * 0.2], [0, 1]);
  const eased = useTransform(reveal, value => value * value * (3 - 2 * value));
  const y = useTransform(eased, [0, 1], [12, 0]);
  const scale = useTransform(eased, [0, 1], [0.86, 1]);
  return <motion.span className={styles.headlineMark} style={{ opacity: eased, y, scale }} aria-hidden="true">{children}</motion.span>;
}

export default function HomeOfferings() {
  const locale = useLocale();
  const t = useTranslations("HomeOfferings");
  const partnershipRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: partnershipRef, offset: ["start 0.9", "start 0.65"] });

  useEffect(() => {
    const mark = partnershipRef.current;
    if (!mark) return;
    mark.dataset.enhanced = "true";
    return () => { delete mark.dataset.enhanced; };
  }, []);

  return (
    <section id="offerings" className={styles.section} aria-labelledby="offerings-heading">
      <Container>
        <header ref={partnershipRef} className={styles.header}>
          <h2 id="offerings-heading" className={styles.heading}>
            {t.rich("heading", {
              grids: chunks => <span className={styles.headlineName}>
                <HeadlineMark progress={scrollYProgress} index={0}><BrandLogo className={styles.partnerLogo} /></HeadlineMark>
                {chunks}
              </span>,
              company: chunks => <span className={styles.headlineName}>
                <HeadlineMark progress={scrollYProgress} index={1}><FallbackAvatar name="GRIDS Growth" size={40} animated={true} className={styles.partnerAvatar} /></HeadlineMark>
                {chunks}
              </span>,
            })}{" "}<span className={styles.headingSecondary}>{t("headingSecondary")}</span>
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
                <ConsultationLink href={offering === "build" ? `/${locale}/pricing#pricing-examples` : `/${locale}/connect`} label={t(`${offering}.cta`)} />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
