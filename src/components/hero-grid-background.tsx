"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import PredictiveArc from "@/components/originkit/ui/predictive-arc";

const arch = { peak: 43, archHeight: 60, thickness: 135, falloff: 250 };
const pointer = { enabled: false };
const subscribeToHydration = () => () => {};

export default function HeroGridBackground() {
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  // Match the dark default on the server and during the first hydration render.
  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent_88%)]"
    >
      <PredictiveArc
        variant="aurora"
        background={isDark ? "#0a0a0a" : "#ffffff"}
        baseColor={isDark ? "#789ebd" : "#62b0ed"}
        accentColor={isDark ? "#b8d9f0" : "#277db8"}
        highlight={isDark ? "#e8f6ff" : "#d8efff"}
        intensity={isDark ? 1.1 : 1.4}
        speed={reducedMotion ? 0 : 24}
        arch={arch}
        pointer={pointer}
      />
    </div>
  );
}
