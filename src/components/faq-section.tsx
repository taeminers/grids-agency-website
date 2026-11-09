"use client";

import { useLocale, useTranslations } from "next-intl";
import ConsultationLink from "@/components/consultation-link";
import { Accordion } from "radix-ui";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import BrandLogo from "@/components/brand-logo";
import styles from "./faq-section.module.css";
import { trackEvent } from "@/lib/analytics";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";

const LiquidFilm = dynamic(
  () => import("@/components/originkit/ui/liquid-film"),
  { ssr: false },
);

const questions = ["company", "services", "starting", "pricing", "quality", "support"] as const;

function FaqContactCard() {
  const t = useTranslations("FAQ");
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { once: true, margin: "200px" });
  const reducedMotion = useReducedMotion();


  return (
    <aside ref={ref} className={styles.contactCard} aria-labelledby="faq-contact-heading">
      <div className={styles.artwork} aria-hidden="true">
        {visible && (
          <LiquidFilm
            background="#050505"
            color1="#1252EE"
            color2="#287DFF"
            speed={30}
            paused={!!reducedMotion}
            hover={0}
            ripple={0}
            style={{ position: "absolute", inset: 0, minWidth: 0, minHeight: 0 }}
          />
        )}
      </div>
      <div className={styles.glass}>
        <div className={styles.contactHeading}>
          <span className={styles.brandIcon}><BrandLogo className={styles.brandMark} /></span>
          <h3 id="faq-contact-heading">{t("contactCardTitle")}</h3>
        </div>
        <p>{t("contactCardDescription")}</p>
        <ConsultationLink
          label={t("contactPrompt")}
          hoverLabel={t("contactLink")}
          href={`/${locale}/connect`}
          onClick={() => trackEvent("cta_click", { cta_location: "faq", cta_text: t("contactPrompt") })}
        />
      </div>
    </aside>
  );
}

export default function FaqSection() {
  const t = useTranslations("FAQ");
  const [openItem, setOpenItem] = useState<string>(questions[0]);
  const reducedMotion = useReducedMotionPreference();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-24 bg-background px-[clamp(20px,4.2vw,72px)] py-section text-foreground"
    >
      <header className={styles.heading}>
        <h2 id="faq-heading">{t("layoutHeading")}<span>{t("layoutHeadingSecondary")}</span></h2>
        <p>{t("description")}</p>
      </header>
      <div className={styles.layout}>
        <Accordion.Root
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
          className="min-w-0 self-start overflow-hidden rounded-[var(--site-card-radius)] border border-[#e4e5e2] bg-background"
        >
          {questions.map((key, index) => (
            <Accordion.Item
              key={key}
              value={key}
              className="border-b border-[#ededeb] last:border-b-0"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex min-h-[72px] w-full cursor-pointer items-center gap-4 px-5 py-5 text-left text-base leading-relaxed font-medium sm:text-lg lg:text-xl text-[#272b26] transition-colors hover:bg-[#fafbf9] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-tertiary sm:gap-6 sm:px-7 [word-break:keep-all]">
                  <span aria-hidden="true" className="shrink-0 text-[10px] font-normal text-[#92968e] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">{t(`items.${key}.question`)}</span>
                  <span
                    aria-hidden="true"
                    className="size-[7px] shrink-0 rounded-full border border-[#cbd0c6] transition-colors duration-180 group-data-[state=open]:border-[#252b26] group-data-[state=open]:bg-[#252b26] motion-reduce:transition-none"
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount asChild>
                <motion.div className="overflow-hidden" initial={false}
                  inert={openItem !== key} aria-hidden={openItem !== key}
                  animate={{ height: openItem === key ? "auto" : 0, opacity: openItem === key ? 1 : 0 }}
                  transition={reducedMotion ? { duration: 0 } : {
                    height: { type: "spring", bounce: 0, duration: .42 },
                    opacity: { duration: .22, ease: "easeOut" },
                  }}>
                <p className="pr-5 pb-[30px] pl-12 text-sm leading-7 text-muted-foreground [word-break:keep-all] sm:pr-7 sm:pl-16">
                  {t(`items.${key}.answer`)}
                </p>
                </motion.div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
        <FaqContactCard />
      </div>
    </section>
  );
}
