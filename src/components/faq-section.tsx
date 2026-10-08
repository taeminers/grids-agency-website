"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { Accordion } from "radix-ui";
import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { BeamCard } from "@/components/spectrumui/beam-card";
import { trackEvent } from "@/lib/analytics";

const AnimatedGradient = dynamic(
  () => import("@/components/animated-gradient"),
  { ssr: false },
);

const questions = [
  "company",
  "services",
  "pricing",
  "quality",
  "starting",
  "support",
] as const;

function FaqTitle() {
  const t = useTranslations("FAQ");
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref);
  const reducedMotion = useReducedMotion();
  const config = useMemo(
    () => ({
      preset: "Prism" as const,
      speed: reducedMotion ? 0 : 30,
    }),
    [reducedMotion],
  );

  return (
    <header
      data-scroll-reveal="fade"
      ref={ref}
      className="relative min-w-0 self-stretch"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-1 -right-1 z-10 size-5 border-t-2 border-r-2 border-foreground/25"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1 -left-1 z-10 size-5 border-b-2 border-l-2 border-foreground/25"
      />
      <BeamCard
        size="pulse-inner"
        colorVariant="ocean"
        strength={1}
        theme={"auto"}
        duration={8}
        borderRadius={0}
        active={visible && !reducedMotion}
        wrapperClassName="h-full rounded-none [--beam-stroke-opacity:10] dark:[--beam-stroke-opacity:6] [--beam-inner-opacity:0.08] [--beam-bloom-opacity:0.12]"
        className="h-full overflow-hidden rounded-none border-foreground/15 bg-background p-0 dark:border-foreground/15 dark:bg-background"
        contentClassName="h-full"
      >
        <div className="relative isolate flex h-full min-h-72 flex-col p-8 sm:min-h-80 md:p-10 lg:min-h-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -inset-y-12 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_65%,transparent)]"
          >
            <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_25%,black_75%,transparent)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,#62b0ed30,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_50%_65%,#66b3ff40,transparent_70%)]" />
              {visible && (
                <AnimatedGradient config={config} style={{ zIndex: 0 }} />
              )}
              <div className="absolute inset-0 bg-linear-to-b from-background/90 via-background/10 to-transparent" />
            </div>
          </div>
          <h2
            data-scroll-reveal="text"
            id="faq-heading"
            className="whitespace-pre-line text-[clamp(36px,3.8vw,56px)] leading-[1.15] font-medium tracking-[-0.055em] [word-break:keep-all]"
          >
            {t("heading")}
          </h2>
          <div
            data-scroll-reveal="text"
            className="mt-auto self-end pt-12 text-right"
          >
            <p className="text-xs leading-6 text-muted-foreground md:text-sm">
              {t("contactPrompt")}
            </p>
            <Link
              href={`/${locale}/connect`}
              onClick={() =>
                trackEvent("cta_click", {
                  cta_location: "faq",
                  cta_text: t("contactLink"),
                })
              }
              className="mt-2 inline-flex items-center gap-2 border-b border-foreground/25 pb-1 text-sm font-medium transition-colors hover:border-tertiary hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary"
            >
              {t("contactLink")}
              <ArrowRight size={14} aria-hidden="true" className="-rotate-45" />
            </Link>
          </div>
        </div>
      </BeamCard>
    </header>
  );
}

export default function FaqSection() {
  const t = useTranslations("FAQ");

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-24 bg-background px-[clamp(20px,4.2vw,72px)] py-section text-foreground"
    >
      <div className="grid items-stretch gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <FaqTitle />

        <Accordion.Root
          data-scroll-reveal="fade"
          type="single"
          collapsible
          className="min-w-0 border-t border-foreground/15"
        >
          {questions.map((key) => (
            <Accordion.Item
              key={key}
              data-scroll-reveal="surface"
              value={key}
              className="border-b border-foreground/15"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-base leading-relaxed font-medium tracking-[-0.025em] transition-colors hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary md:py-7 md:text-lg [word-break:keep-all]">
                  {t(`items.${key}.question`)}
                  <span
                    aria-hidden="true"
                    className="relative size-6 shrink-0 text-foreground/55 transition-colors duration-300 group-hover:text-tertiary group-data-[state=open]:text-tertiary motion-reduce:transition-none"
                  >
                    <span className="absolute inset-[6px] scale-75 bg-tertiary opacity-0 transition-[opacity,scale] duration-250 ease-out group-data-[state=open]:scale-100 group-data-[state=open]:opacity-100 motion-reduce:transition-none" />
                    <span className="absolute top-[3px] left-[3px] size-1.5 border-t-[1.5px] border-l-[1.5px] border-current" />
                    <span className="absolute top-[3px] right-[3px] size-1.5 border-t-[1.5px] border-r-[1.5px] border-current" />
                    <span className="absolute bottom-[3px] left-[3px] size-1.5 border-b-[1.5px] border-l-[1.5px] border-current" />
                    <span className="absolute right-[3px] bottom-[3px] size-1.5 border-r-[1.5px] border-b-[1.5px] border-current" />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
                <p className="max-w-2xl pr-10 pb-7 text-sm leading-7 text-muted-foreground [word-break:keep-all] md:text-base md:leading-8">
                  {t(`items.${key}.answer`)}
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
