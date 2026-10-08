"use client";

import { Component, useRef, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useInView, useReducedMotion } from "motion/react";
import { useSurfaceTheme } from "@/components/spectrumui/use-surface-theme";

const Beams = dynamic(() => import("@/components/Beams"), { ssr: false });

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

export function FooterBeams() {
  const { ref, nearby, active, dark } = useFooterScene();
  return (
    <div data-scroll-reveal="fade" ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_35%,var(--tertiary),transparent_65%)] opacity-[0.08]" />
      <div className="absolute -inset-1 opacity-50 blur-[0.5px] dark:opacity-70">
        {nearby && (
          <GraphicsBoundary>
            <Beams active={Boolean(active)} beamWidth={3} beamHeight={22} beamNumber={8} speed={0.35} rotation={24} noiseIntensity={0.35} scale={0.16} lightColor={dark ? "#c4d8f2" : "#62b0ed"} beamColor={dark ? "#171a22" : "#192532"} backgroundColor={dark ? "#171717" : "#ffffff"} lightMode={!dark} />
          </GraphicsBoundary>
        )}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,transparent_20%,transparent_40%,var(--background)_95%)]" />
      <div className="absolute inset-0 bg-linear-to-r from-background/75 via-background/40 to-transparent" />
    </div>
  );
}
