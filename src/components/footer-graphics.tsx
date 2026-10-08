"use client";

import { Component, useRef, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useInView, useReducedMotion } from "motion/react";
import { useSurfaceTheme } from "@/components/spectrumui/use-surface-theme";

const PredictiveArc = dynamic(() => import("@/components/originkit/ui/predictive-arc"), { ssr: false });
const arch = { peak: 43, archHeight: 60, thickness: 135, falloff: 250 };
const pointer = { enabled: false };

function subscribeToVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const visibleSnapshot = () => !document.hidden;
const serverSnapshot = () => false;

class GraphicsBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback ?? null : this.props.children; }
}

function useFooterScene() {
  const ref = useRef<HTMLDivElement>(null);
  const nearby = useInView(ref, { margin: "200px 0px" });
  const visible = useInView(ref);
  const reducedMotion = useReducedMotion();
  const pageVisible = useSyncExternalStore(subscribeToVisibility, visibleSnapshot, serverSnapshot);
  const theme = useSurfaceTheme();
  return { ref, nearby: nearby && pageVisible && !reducedMotion, active: visible && pageVisible && !reducedMotion, dark: theme === "dark" };
}

export function FooterAurora() {
  const { ref, nearby, active, dark } = useFooterScene();
  return (
    <div data-scroll-reveal="fade" ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_35%,var(--tertiary),transparent_65%)] opacity-[0.08]" />
      <div className="absolute inset-0">
        {nearby && (
          <GraphicsBoundary>
            <PredictiveArc
              variant="aurora"
              background={dark ? "#141414" : "#ffffff"}
              baseColor={dark ? "#789ebd" : "#62b0ed"}
              accentColor={dark ? "#b8d9f0" : "#277db8"}
              highlight={dark ? "#e8f6ff" : "#d8efff"}
              intensity={dark ? 1.1 : 1.4}
              speed={active ? 24 : 0}
              arch={arch}
              pointer={pointer}
            />
          </GraphicsBoundary>
        )}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,transparent_20%,transparent_40%,var(--background)_95%)]" />
      <div className="absolute inset-0 bg-background/20" />
    </div>
  );
}
