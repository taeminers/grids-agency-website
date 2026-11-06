"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import ConsultationLink from "./consultation-link";
import GrowthPreview from "./growth-preview";
import styles from "./home-offerings.module.css";

export default function HomeOfferings() {
  const locale = useLocale();
  const t = useTranslations("HomeOfferings");

  return (
    <section id="offerings" className={styles.section} aria-labelledby="offerings-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <ul className={styles.logos} aria-label={t("organizations")}>
            <li className={styles.badge}>
              <span className={styles.snuMark}>
                <Image src="/images/organizations/snu.png" alt="Seoul National University" width={542} height={240} />
              </span>
            </li>
            <li className={styles.badge}>
              <Image src="/images/organizations/google.svg" alt="Google" width={28} height={29} />
            </li>
            <li className={styles.badge}>
              <Image src="/images/organizations/samsung.svg" alt="Samsung" width={46} height={46} />
            </li>
            <li className={styles.badge}>
              <Image src="/images/organizations/lg.svg" alt="LG" width={32} height={32} />
            </li>
          </ul>
          <h2 id="offerings-heading" className={styles.heading}>
            {t("heading")}{" "}<span>{t("headingSecondary")}</span>
          </h2>
          <p className={styles.introduction}>{t("introduction")}</p>
        </header>

        <div className={styles.grid}>
          {(["build", "growth"] as const).map((offering) => (
            <article key={offering} className={styles.offering} aria-labelledby={`offering-${offering}`}>
              <div className={styles.imagePlaceholder} aria-hidden={offering === "build" ? true : undefined}>
                {offering === "growth" && <GrowthPreview />}
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
