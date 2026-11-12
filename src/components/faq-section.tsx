"use client";

import Container from "@/components/container";

import { useLocale, useTranslations } from "next-intl";
import ConsultationLink from "@/components/consultation-link";
import { Accordion } from "radix-ui";
import { useState } from "react";
import { motion } from "motion/react";
import Dots08 from "@/components/shadcn-space/dots/dots-08";
import styles from "./faq-section.module.css";
import spacing from "./home-spacing.module.css";
import { trackEvent } from "@/lib/analytics";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";

const questions = [
  "company",
  "services",
  "starting",
  "pricing",
  "quality",
  "support",
] as const;

function FaqContactCard() {
  const t = useTranslations("FAQ");
  const locale = useLocale();

  return (
    <aside className={styles.contactCard} aria-labelledby="faq-contact-heading">
      <h3 id="faq-contact-heading" className={styles.contactMessage}>
        {t.rich("contactMessage", { highlight: (text) => <strong>{text}</strong> })}
      </h3>
      <div className={styles.contactAction}>
        <ConsultationLink
          label={t("contactPrompt")}
          hoverLabel={t("contactLink")}
          href={`/${locale}/connect`}
          onClick={() =>
            trackEvent("cta_click", {
              cta_location: "faq",
              cta_text: t("contactPrompt"),
            })
          }
        />
      </div>
      <div className={styles.locusStage} aria-hidden="true">
        <span className={styles.locusShadow} />
        <Dots08 size={256} />
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
      className={`${spacing.section} relative scroll-mt-24 bg-background text-foreground`}
    >
      <Container>
      <header className={styles.heading}>
        <h2 id="faq-heading">
          {t("layoutHeading")}
          <span>{t("layoutHeadingSecondary")}</span>
        </h2>
      </header>
      <div className={styles.layout}>
        <Accordion.Root
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
          className={styles.questionCard}
        >
          {questions.map((key) => (
            <Accordion.Item
              key={key}
              value={key}
              className={styles.questionItem}
            >
              <Accordion.Header className={styles.questionHeader}>
                <Accordion.Trigger className={styles.questionTrigger}>
                  <span className={styles.questionText}>{t(`items.${key}.question`)}</span>
                  <span aria-hidden="true" className={styles.indicator} />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount asChild>
                <motion.div
                  className={styles.questionContent}
                  initial={false}
                  inert={openItem !== key}
                  aria-hidden={openItem !== key}
                  animate={{
                    height: openItem === key ? "auto" : 0,
                    opacity: openItem === key ? 1 : 0,
                  }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : {
                          height: { type: "spring", bounce: 0, duration: 0.42 },
                          opacity: { duration: 0.22, ease: "easeOut" },
                        }
                  }
                >
                  <p className={styles.answer}>
                    {t(`items.${key}.answer`)}
                  </p>
                </motion.div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
        <FaqContactCard />
      </div>
      </Container>
    </section>
  );
}
