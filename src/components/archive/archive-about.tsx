"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import HeroGridBackground from "@/components/hero-grid-background";
import { WordsStagger } from "@/components/words-stagger";
import { BlurReveal } from "@/components/blur-reveal";

export function ArchiveAbout({ active, onExplore }: { active: boolean; onExplore: () => void }) {
  const t = useTranslations("Archive.Gallery");
  const richText = {
    strong: (children: ReactNode) => <strong className="font-medium text-foreground">{children}</strong>,
  };

  return (
    <div className="@container/about relative isolate flex min-h-full flex-col overflow-hidden px-5 pt-6 pb-6 sm:px-8 sm:pt-8 md:pb-8 lg:px-12 lg:pt-10">
      {active && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <HeroGridBackground />
        </div>
      )}

      <div className="flex items-center justify-between gap-6 font-mono text-[10px] tracking-[0.12em] text-foreground/60 sm:text-xs">
        <span>ABOUT</span>
        <span aria-hidden="true">[00 / 04]</span>
      </div>

      <div className="flex flex-1 items-center justify-center py-8 @min-[700px]/about:py-10">
        <div className="relative w-full max-w-[800px] border border-black/10 bg-[#faf9f5]/95 shadow-[0_2px_4px_#00000003,0_24px_64px_-32px_#35302335] dark:border-white/10 dark:bg-[#20221f]/95 dark:shadow-[0_2px_4px_#0001,0_24px_64px_-32px_#0008]">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-[5px] z-20 text-foreground/35">
            <span className="absolute top-0 left-0 size-5 border-t-2 border-l-2 border-current" />
            <span className="absolute top-0 right-0 size-5 border-t-2 border-r-2 border-current" />
            <span className="absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-current" />
            <span className="absolute right-0 bottom-0 size-5 border-r-2 border-b-2 border-current" />
          </div>
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/15" />
          <div className="px-5 pt-6 pb-7 @min-[480px]/about:px-9 @min-[700px]/about:px-12 @min-[700px]/about:pt-9 @min-[700px]/about:pb-10">
            <div className="mb-8 flex items-center justify-between gap-5 @min-[700px]/about:mb-10">
              <span className="text-[10px] font-medium tracking-[0.1em] text-foreground/50 sm:text-xs">{t("note.label")}</span>
              <BrandLogo className="size-5 bg-foreground/70" />
            </div>

            <h2
              aria-label={`${t("headline.first")} ${t("headline.emphasis")}`}
              className="text-[clamp(28px,4.6cqw,48px)] leading-[1.3] font-medium tracking-[-0.055em] [word-break:keep-all]"
            >
              <span aria-hidden="true" className="flex flex-col items-start gap-1">
                <WordsStagger autoStart={active} stagger={0.06} speed={0.65} className="text-foreground/45">
                  {t("headline.first")}
                </WordsStagger>
                <WordsStagger autoStart={active} delay={0.12} stagger={0.06} speed={0.65}>
                  {t("headline.emphasis")}
                </WordsStagger>
              </span>
            </h2>
            <BlurReveal
              key={`intro-${active}`}
              delay={0.25}
              speedReveal={2.5}
              speedSegment={0.75}
              className="mt-5 max-w-[38em] text-[15px] leading-[1.85] text-foreground/60 [word-break:keep-all] sm:text-base"
            >
              {t("note.intro")}
            </BlurReveal>

            <div className="mt-7 space-y-4 border-t border-foreground/10 pt-7 text-[15px] leading-[1.95] tracking-[-0.015em] text-foreground/60 [word-break:keep-all] sm:text-base @min-[700px]/about:mt-8 @min-[700px]/about:pt-8">
              {(["client", "internal", "nda"] as const).map((reason) => (
                <p key={reason}>{t.rich(`note.${reason}`, richText)}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 border-t border-foreground/10 bg-black/[0.015] px-5 py-5 dark:bg-white/[0.015] @min-[480px]/about:px-9 @min-[640px]/about:flex-row @min-[640px]/about:items-center @min-[640px]/about:justify-between @min-[700px]/about:px-12">
            <p className="max-w-[26em] text-xs leading-[1.8] text-foreground/50 [word-break:keep-all]">{t("note.closing")}</p>
            <button type="button" data-archive-select onClick={onExplore} className="group/start flex min-h-11 w-fit shrink-0 cursor-pointer items-center gap-5 text-sm font-medium transition-colors hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary">
              {t("explore")}
              <ChevronRight strokeWidth={3.5} size={18} aria-hidden="true" className="transition-transform group-hover/start:translate-x-1 motion-reduce:transform-none" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
