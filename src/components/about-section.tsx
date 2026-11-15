"use client";

import Container from "@/components/container";

import ConsultationLink from "@/components/consultation-link";
import { useLocale, useTranslations } from "next-intl";
import FeaturedWorkCarousel from "@/components/featured-work-carousel";
import { cn } from "@/lib/utils";
import spacing from "./home-spacing.module.css";
import styles from "./about-section.module.css";

interface AboutSectionProps {
  className?: string;
}

export default function AboutSection({ className }: AboutSectionProps) {
  const t = useTranslations("About.layout");
  const locale = useLocale();

  return (
    <section
      id="about-details"
      aria-labelledby="about-heading"
      className={cn(
        "relative w-full scroll-mt-24 bg-background text-foreground",
        spacing.section,
        className,
      )}
    >
      <Container>
      <div className={`${styles.header} ${spacing.heading}`}>
        <h2 id="about-heading" data-scroll-reveal="text" className={styles.heading}>
          {t("heading")}
          <span className={styles.headingSecondary}>{t("headingSecondary")}</span>
        </h2>
        <ConsultationLink href={`/${locale}/archive`} label={t("archiveLink")} className={styles.archiveLink} />
      </div>
      <FeaturedWorkCarousel />
      </Container>
    </section>
  );
}
