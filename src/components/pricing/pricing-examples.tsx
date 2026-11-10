"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { ArrowRight, Building2, Globe2, MessageCircle, MessageSquareReply, ReceiptText, RefreshCw, Smartphone, Sunrise } from "lucide-react";
import styles from "./pricing-examples.module.css";
import InquiryAutomation from "./automation-demo/inquiry-automation";

const serviceIcons = { homepage: Globe2, webApp: Smartphone, crm: Building2, automation: RefreshCw, chatbot: MessageCircle };
type ExampleService = keyof typeof serviceIcons;
const automationExamples = [
  { id: "messages", icon: MessageSquareReply },
  { id: "invoices", icon: ReceiptText },
  { id: "briefing", icon: Sunrise },
] as const;

export default function PricingExamples({ service }: { service: ExampleService }) {
  const t = useTranslations("Pricing.examples");
  const Icon = serviceIcons[service];
  const interactive = service === "automation" || service === "chatbot";
  const [automationIndex, setAutomationIndex] = useState(0);
  const tabsId = useId();
  const automationTitle = t(`services.automation.tabs.${automationExamples[automationIndex].id}`);
  const liveDemo = service === "automation" && automationIndex === 0;

  return (
    <section className={styles.section} aria-labelledby="pricing-examples-heading">
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>{t("label")}</p>
          <h2 id="pricing-examples-heading">{t("heading")}<span>{t("headingSecondary")}</span></h2>
        </div>
        <p>{t(`services.${service}.description`)}</p>
      </header>
      <div className={styles.frame}>
        <div className={styles.toolbar}>
          <div className={styles.frameTitle}><Icon size={18} strokeWidth={1.6} aria-hidden="true" /><h3>{t(`services.${service}.title`)}</h3></div>
        </div>
        {interactive ? (
          <div className={styles.demoLayout} data-live={liveDemo}>
            <aside className={styles.scenario}>
              {service === "automation" ? (
                <div className={styles.automationTabs} role="tablist" aria-label={t("services.automation.title")} aria-orientation="vertical">
                  {automationExamples.map(({ id, icon: TabIcon }, index) => (
                    <button key={id} type="button" role="tab" id={`${tabsId}-${id}`} aria-controls={`${tabsId}-panel`}
                      aria-selected={automationIndex === index} tabIndex={automationIndex === index ? 0 : -1}
                      onClick={() => setAutomationIndex(index)}
                      onKeyDown={event => {
                        const next = event.key === "ArrowDown" ? (index + 1) % automationExamples.length
                          : event.key === "ArrowUp" ? (index + automationExamples.length - 1) % automationExamples.length
                          : event.key === "Home" ? 0 : event.key === "End" ? automationExamples.length - 1 : -1;
                        if (next < 0) return;
                        event.preventDefault();
                        setAutomationIndex(next);
                        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
                      }}>
                      <TabIcon size={18} strokeWidth={1.6} aria-hidden="true" />
                      <span>{t(`services.automation.tabs.${id}`)}</span>
                    </button>
                  ))}
                </div>
              ) : <>
              <h4>{t(`services.${service}.scenario`)}</h4>
              <p>{t(`services.${service}.scenarioDescription`)}</p>
              <div className={styles.steps}>
                {["first", "second", "third"].map((step, index) => (
                  <div key={step}><span className={styles.stepNumber}>0{index + 1}</span><span>{t(`services.${service}.steps.${step}`)}</span></div>
                ))}
              </div>
              </>}
            </aside>
            <div className={`${styles.demoStage} ${liveDemo ? styles.liveDemo : ""}`} role={service === "automation" ? "tabpanel" : undefined}
              id={service === "automation" ? `${tabsId}-panel` : undefined}
              aria-labelledby={service === "automation" ? `${tabsId}-${automationExamples[automationIndex].id}` : undefined}
              tabIndex={service === "automation" ? 0 : undefined}>
              {liveDemo ? <InquiryAutomation /> : <>
              <div className={styles.stageHeading}><span>{service === "automation" ? automationTitle : t("conversation")}</span><span className={styles.stageDot} aria-hidden="true" /></div>
              <div className={styles.placeholder}>
                <div className={styles.demoMotif} aria-hidden="true">
                  {service === "automation" ? <><span /><ArrowRight size={20} strokeWidth={1.3} /><span /><ArrowRight size={20} strokeWidth={1.3} /><span /></> : <div className={styles.chatMotif}><span /><span /><span /></div>}
                </div>
                <p>{t(service === "automation" ? "automationPlaceholder" : "chatbotPlaceholder")}</p>
              </div>
              </>}
            </div>
          </div>
        ) : (
          <div className={styles.previewStage}>
            <div className={styles.previewCanvas}>
              <div className={styles.placeholder}>
                <Icon className={styles.placeholderIcon} size={32} strokeWidth={1.2} aria-hidden="true" />
                <p>{t(`services.${service}.placeholder`)}</p>
                <span>{t("previewHint")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
