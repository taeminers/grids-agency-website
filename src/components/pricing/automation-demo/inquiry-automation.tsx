"use client";

import { useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCheck, Inbox, LoaderCircle, RotateCcw, WandSparkles } from "lucide-react";
import ConsultationLink from "@/components/consultation-link";
import { trackEvent } from "@/lib/analytics";
import { industries, type Locale } from "./scenarios";
import { useInquirySimulation } from "./use-inquiry-simulation";
import Workflow from "./result-views";
import styles from "./inquiry-automation.module.css";



export default function InquiryAutomation() {
  const locale = useLocale() === "ko" ? "ko" : "en";
  return <InquiryExperience key={locale} locale={locale} />;
}

function InquiryExperience({ locale }: { locale: Locale }) {
  const t = useTranslations("Pricing.automationDemo");
  const reduced = useReducedMotion();
  const ids = useId();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [industryIndex, setIndustryIndex] = useState(0);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [custom, setCustom] = useState(false);
  const [message, setMessage] = useState("");
  const simulation = useInquirySimulation();
  const industry = industries[industryIndex];
  const scenario = industry.scenarios[sampleIndex];
  const complete = simulation.completed === 5;
  const input = { industry, scenario, locale, ...(custom ? { customMessage: message } : {}) };
  const start = () => {
    void simulation.run(input);
    resultsRef.current?.scrollIntoView({ block: "start", behavior: reduced ? "instant" : "smooth" });
  };
  const announcement = simulation.error ? t("error") : complete ? t("completeAnnouncement")
    : simulation.running && simulation.completed === 1 && simulation.result && simulation.sourcesRead < simulation.result.sources.length
      ? t("sources.loadingAnnouncement", { source: simulation.result.sources[simulation.sourcesRead].name })
    : simulation.running ? t(`workflow.stages.${Math.min(simulation.completed, 4)}`) : t("ready");

  return (
    <div className={styles.demo}>
      <header className={styles.header}>
        <span className={styles.demoLabel}><span aria-hidden="true" />{t("demoLabel")}</span>
        <h4>{t("headline")}</h4>
        <p>{t("description")}</p>
      </header>
      <div className={styles.industrySelector} role="group" aria-label={t("chooseIndustry")}>
        {industries.map((item, index) => <button key={item.id} type="button" aria-pressed={industryIndex === index}
          onClick={() => { simulation.reset(); setIndustryIndex(index); setSampleIndex(0); setCustom(false); setMessage(""); }}>
          {item.name[locale]}
        </button>)}
      </div>
      <p className={styles.disclosure}>{t("disclosure")}</p>

      <div className={styles.workspace}>
        <div className={styles.inbox}>
          <div className={styles.panelHeading}><span><Inbox size={17} aria-hidden="true" />{t("inbox")}</span><span className={styles.inquiryStatus} data-complete={complete}>{complete ? t("organized") : t("newInquiry")}</span></div>
          <div className={styles.inboxBody}>
            <div className={styles.modeSwitch} role="group" aria-label={t("inputMode")}>
              <button type="button" aria-pressed={!custom} onClick={() => { simulation.reset(); setCustom(false); }}>{t("sample")}</button>
              <button type="button" aria-pressed={custom} onClick={() => { simulation.reset(); setCustom(true); }}>{t("custom")}</button>
            </div>
            {!custom && <label className={styles.samplePicker}>{t("chooseSample")}
              <select value={sampleIndex} onChange={event => { simulation.reset(); setSampleIndex(Number(event.target.value)); }}>
                {industry.scenarios.map((item, index) => <option key={item.id} value={index}>{item.title[locale]}</option>)}
              </select>
            </label>}
            <div className={styles.sender}>
              <span className={styles.avatar} aria-hidden="true">{custom ? "?" : scenario.customer[locale].slice(0, 1)}</span>
              <div><strong>{custom ? t("customCustomer") : scenario.customer[locale]}</strong><span>{custom ? t("customChannel") : scenario.channel[locale]}</span></div>
              <time dateTime="10:24">10:24</time>
            </div>
            {custom ? <div className={styles.customInput}>
              <label htmlFor={`${ids}-message`}>{t("messageLabel")}</label>
              <textarea id={`${ids}-message`} value={message} maxLength={600} rows={6} placeholder={t("messagePlaceholder")}
                aria-describedby={`${ids}-custom-note`} onChange={event => { simulation.reset(); setMessage(event.target.value); }} />
              <span className={styles.counter}>{message.length} / 600</span>
              <p id={`${ids}-custom-note`}>{t("customNote")}</p>
            </div> : <div className={styles.message}>{scenario.message[locale]}</div>}
            <div className={styles.inputActions}>
              <button className={styles.runButton} type="button" disabled={simulation.running || (custom && !message.trim())}
                onClick={start}>
                {simulation.running ? <LoaderCircle className={styles.spinner} size={17} aria-hidden="true" /> : <WandSparkles size={17} aria-hidden="true" />}
                {simulation.running ? t("processing") : complete ? t("runAgain") : t("run")}
                {!simulation.running && <ArrowRight size={16} aria-hidden="true" />}
              </button>
              {(simulation.running || simulation.result || simulation.error) && <button className={styles.resetButton} type="button" onClick={simulation.reset}><RotateCcw size={14} aria-hidden="true" />{t("reset")}</button>}
            </div>
          </div>
        </div>

        <div ref={resultsRef} className={styles.results}>
          <Workflow simulation={simulation} reduced={!!reduced} onRetry={start} />
        </div>
      </div>
      <p className={styles.liveStatus} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      {complete && <motion.div className={styles.completion} initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .3 }}>
        <div className={styles.outcome}><CheckCheck size={20} aria-hidden="true" /><div><strong>{t("outcomeTitle")}</strong><p>{t("outcomeDescription")}</p></div></div>
        <div className={styles.conversion}><div><h5>{t("ctaTitle")}</h5><p>{t("ctaDescription")}</p></div>
          <ConsultationLink href={`/${locale}/connect`} label={t("cta")} onClick={() => trackEvent("cta_click", { cta_location: "pricing_automation_demo", cta_text: t("cta") })} />
        </div>
      </motion.div>}
    </div>
  );
}
