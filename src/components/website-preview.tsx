"use client";

import dynamic from "next/dynamic";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import { WebGLGuard } from "./coin-preview/webgl-guard";
import WebsiteHeroPreview from "./website-hero-preview";
import MobileAppPreview from "./mobile-app-preview";
import CrmDashboardPreview from "./crm-dashboard-preview";
import AutomationWorkflowPreview from "./automation-workflow-preview";
import AiChatPreview from "./ai-chat-preview";
import styles from "./website-preview.module.css";

const CobaltLouvre = dynamic(() => import("./originkit/ui/cobalt-louvre"), { ssr: false });

const services = [
  { key: "commerce", label: "website", Preview: WebsiteHeroPreview },
  { key: "applications", label: "appStore", Preview: MobileAppPreview },
  { key: "crm", label: "internal", Preview: CrmDashboardPreview },
  { key: "automation", label: "automation", Preview: AutomationWorkflowPreview },
  { key: "assistant", label: "chatbot", Preview: AiChatPreview },
] as const;

export default function WebsitePreview() {
  const t = useTranslations("HomeOfferings.build.visual");
  const id = useId();
  const host = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const backgroundReady = useInView(host, { once: true, margin: "400px 0px" });
  const reduced = useReducedMotionPreference();

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % services.length; break;
      case "ArrowLeft": next = (index + services.length - 1) % services.length; break;
      case "Home": next = 0; break;
      case "End": next = services.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus({ preventScroll: true });
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  return (
    <div ref={host} className={styles.visual}>
      <div className={styles.backdrop} aria-hidden="true">
        {backgroundReady && !reduced && (
          <WebGLGuard>
            <CobaltLouvre background="#171819" glowColor="#ffffff"
              orientation="vertical" glass={{ slats: 18 }} pointerReactive={false} />
          </WebGLGuard>
        )}
      </div>
      <motion.div className={styles.stack} initial={false}
        animate={{ maxWidth: active === 0 ? 640 : 480 }}
        transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.55 }}>
        <div className={styles.shelf}>
          <div role="tablist" aria-label={t("label")} className={styles.tabs}>
            {services.map(({ key, label }, index) => (
              <button key={key} ref={element => { tabs.current[index] = element; }}
                type="button" role="tab" id={`${id}-tab-${key}`}
                aria-controls={`${id}-panel-${key}`} aria-selected={active === index}
                tabIndex={active === index ? 0 : -1} className={styles.tab}
                onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}>
                {t(label)}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          {services.map(({ key, Preview }, index) => (
            <div key={key} role="tabpanel" id={`${id}-panel-${key}`}
              aria-labelledby={`${id}-tab-${key}`} hidden={active !== index}
              tabIndex={0} className={styles.panel}>
              {active === index && (
                <div className={`dark ${styles.preview}`} data-service={key}>
                  <Preview />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
