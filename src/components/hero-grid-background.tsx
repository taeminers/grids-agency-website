"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { useSurfaceTheme } from "@/components/spectrumui/use-surface-theme";

const LiquidFilm = dynamic(() => import("@/components/originkit/ui/liquid-film"), { ssr: false });

export default function HeroGridBackground() {
  const reducedMotion = useReducedMotion();
  const isDark = useSurfaceTheme() === "dark";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent_95%)]"
    >
      <LiquidFilm
        background={isDark ? "#141414" : "#ffffff"}
        color1={isDark ? "#789ebd" : "#62b0ed"}
        color2={isDark ? "#b8d9f0" : "#277db8"}
        speed={24}
        flow={100}
        hover={reducedMotion ? 0 : 50}
        ripple={reducedMotion ? 0 : 70}
        paused={Boolean(reducedMotion)}
        style={{ minWidth: 0, minHeight: 0 }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-background/70 via-background/30 to-background/10" />
    </div>
  );
}
