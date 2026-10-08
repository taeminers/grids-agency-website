"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { useSurfaceTheme } from "@/components/spectrumui/use-surface-theme";

const CloudSky = dynamic(() => import("@/components/originkit/ui/cloud-sky"), { ssr: false });

const palettes = {
  dark: {
    background: "#17243e",
    baseColor: "#b27b79",
    accentColor: "#aaa0bc",
    sun: { x: 78, y: 18, glow: "rgba(236, 198, 227, 0.85)" },
    clouds: { softness: 130, shadow: 110, cirrus: 30 },
  },
  light: {
    background: "#62b0ed",
    baseColor: "#d8efff",
    accentColor: "#ffffff",
    sun: { x: 78, y: 82, glow: "rgba(255, 249, 222, 0.8)" },
    clouds: { softness: 115, shadow: 65, cirrus: 35 },
  },
};
const pointer = { parallax: 0, wind: 0 };
const skyStyle = { minWidth: 0, minHeight: 0 };

export default function PricingHeader() {
  const t = useTranslations("Pricing");
  const theme = useSurfaceTheme("auto");
  const reducedMotion = useReducedMotion();

  return (
    <header className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#62b0ed,#d8efff)] dark:bg-[linear-gradient(180deg,#17243e,#605572_65%,#b27b79)]">
        <CloudSky {...palettes[theme]} density={58} size={105} speed={14} paused={Boolean(reducedMotion)} pixelRatio={1.25} pointer={pointer} style={skyStyle} />
        <div className="absolute inset-0 bg-linear-to-r from-background/35 via-background/10 to-background/25 dark:from-background/45 dark:via-background/20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,var(--background)_100%)]" />
      </div>

      <div className="mx-auto grid min-h-[540px] max-w-[1920px] items-center gap-10 px-(--pricing-gutter) pt-36 pb-20 md:min-h-[600px] md:grid-cols-[1.15fr_1fr] md:gap-14 md:pt-44 md:pb-24 lg:gap-24">
        <h1 className="whitespace-pre-line text-[clamp(36px,5.5vw,68px)] leading-[1.12] font-medium tracking-[-0.055em]">{t("title")}</h1>
        <div className="max-w-md [word-break:keep-all] md:justify-self-end">
          <p className="max-w-[30ch] text-base leading-8 text-foreground/75 sm:text-lg">{t("description")}</p>
          <p className="mt-5 whitespace-pre-line text-xl leading-[1.65] font-medium tracking-[-0.025em] lg:text-[22px]">{t("budgetNote")}</p>
          <p className="mt-6 text-xs leading-6 text-foreground/65">{t("currencyNote")}</p>
        </div>
      </div>
    </header>
  );
}
