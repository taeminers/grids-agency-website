"use client";

import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./pricing-example-viewport.module.css";

export type ExamplePreviewDevice = "desktop" | "tablet" | "mobile";

const devices = [
  { id: "desktop", icon: Monitor, width: Infinity },
  { id: "tablet", icon: Tablet, width: 768 },
  { id: "mobile", icon: Smartphone, width: 390 },
] as const;

function subscribeToScreenSize(onChange: () => void) {
  const queries = [window.matchMedia("(min-width: 640px)"), window.matchMedia("(min-width: 1024px)")];
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}

function screenDevice(): ExamplePreviewDevice {
  return window.matchMedia("(min-width: 1024px)").matches ? "desktop" : window.matchMedia("(min-width: 640px)").matches ? "tablet" : "mobile";
}

const serverDevice = (): ExamplePreviewDevice => "desktop";

export default function PricingExampleViewport({ kind, children }: { kind: "homepage" | "crm" | "automation" | "chatbot"; children: (device: ExamplePreviewDevice) => ReactNode }) {
  const t = useTranslations("Pricing.examples.previewControls");
  const [preferredDevice, setDevice] = useState<ExamplePreviewDevice>("desktop");
  const screen = useSyncExternalStore(subscribeToScreenSize, screenDevice, serverDevice);
  const device = screen === "mobile" ? "mobile" : screen === "tablet" && preferredDevice === "desktop" ? "tablet" : preferredDevice;
  const availableDevices = screen === "tablet" ? devices.filter((option) => option.id !== "desktop") : devices;
  const [revision, setRevision] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const viewportId = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const selected = devices.find((option) => option.id === device)!;
  const width = availableWidth ? Math.min(availableWidth, selected.width) : "100%";
  const resetLabel = t(kind === "homepage" ? "resetWebsite" : kind === "crm" ? "resetCrm" : kind === "automation" ? "resetAutomation" : "resetLabel");

  return (
    <>
      <div className={styles.toolbar}>
        {screen !== "mobile" && <div className={styles.deviceSwitch} role="group" aria-label={t("viewport")}>
          {availableDevices.map(({ id, icon: Icon }) => (
            <button key={id} data-device-option={id} type="button" aria-pressed={device === id} aria-controls={viewportId}
              aria-label={t(id)} title={t(id)} onClick={() => setDevice(id)}>
              <Icon size={16} strokeWidth={1.6} aria-hidden="true" /><span>{t(id)}</span>
            </button>
          ))}
        </div>}
        <button type="button" className={styles.reset} aria-controls={viewportId}
          aria-label={resetLabel} title={resetLabel} onClick={() => setRevision((current) => current + 1)}>
          <RotateCcw size={15} strokeWidth={1.6} aria-hidden="true" /><span>{t("reset")}</span>
        </button>
      </div>
      <div ref={stage} className={styles.stage} data-preview-device={device} data-example-service={kind}>
        <motion.div id={viewportId} className={styles.viewport} data-example-viewport
          initial={false} animate={{ width }} transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.4 }}>
          <Fragment key={revision}>{children(device)}</Fragment>
        </motion.div>
      </div>
    </>
  );
}
