"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import WebsiteHeroPreview from "./website-hero-preview";
import MobileAppPreview from "./mobile-app-preview";
import CrmDashboardPreview from "./crm-dashboard-preview";
import AutomationWorkflowPreview from "./automation-workflow-preview";
import AiChatPreview from "./ai-chat-preview";
import styles from "./website-preview.module.css";


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
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
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
    <div className={styles.visual}>
      <div className={styles.backdrop} aria-hidden="true" />
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
                <div className={styles.preview} data-service={key}>
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
