"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { useSurfaceTheme } from "@/components/spectrumui/use-surface-theme";

const MosaicLens = dynamic(() => import("@/components/originkit/ui/mosaic-lens"), { ssr: false });
const sceneStyle = { minWidth: 0, minHeight: 0 };

export function ArchiveHeader() {
  const t = useTranslations("Archive");
  const theme = useSurfaceTheme();
  const reducedMotion = useReducedMotion();

  return (
    <header className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-background">
        <MosaicLens
          background={theme === "dark" ? "#141414" : "#ffffff"}
          color1="#277db8"
          color2="#62b0ed"
          paused={Boolean(reducedMotion)}
          hover={reducedMotion ? 0 : 88}
          style={sceneStyle}
        />
        <div className="absolute inset-0 bg-linear-to-r from-background/35 via-background/15 to-background/45" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_65%,var(--background)_100%)]" />
      </div>

      <div className="mx-auto grid min-h-[540px] max-w-[1920px] items-center gap-10 px-5 pt-36 pb-20 sm:px-8 md:min-h-[600px] md:grid-cols-[1.15fr_1fr] md:gap-14 md:px-12 md:pt-44 md:pb-24 lg:gap-24 lg:px-16">
        <h1 className="whitespace-pre-line text-[clamp(36px,5.5vw,68px)] leading-[1.12] font-medium tracking-[-0.055em]">{t("Index.title")}</h1>
        <div className="max-w-md [word-break:keep-all] md:justify-self-end">
          <p className="text-xl leading-[1.65] font-medium tracking-[-0.025em] lg:text-[22px]">{t("Index.disclosureHeadline")}</p>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-foreground/75 sm:text-lg">{t("Index.disclosureDescription")}</p>
        </div>
      </div>
    </header>
  );
}
