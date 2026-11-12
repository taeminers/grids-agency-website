"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Building2, Check, ChevronDown, FileText, LoaderCircle, Package, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./pricing-automation-scenario.module.css";

export const scenarioIds = ["quote", "onboarding", "delivery"] as const;
export type ScenarioId = (typeof scenarioIds)[number];
export type ScenarioSource = {
  id: string;
  provider: "drive" | "crm" | "orders";
  title: string;
  location: string;
  excerpt: string;
};
export type ChatScenario = {
  title: string;
  hint: string;
  question: string;
  answer: string;
  steps: { title: string; detail: string }[];
  sources: ScenarioSource[];
  email?: { to: string; subject: string; body: string; attachment: string };
};

function ProviderIcon({ provider }: { provider: ScenarioSource["provider"] }) {
  return provider === "drive"
    ? <Image src="/icons/integrations/google-drive.svg" width={18} height={18} alt="Google Drive" />
    : provider === "crm" ? <Building2 size={17} aria-hidden="true" /> : <Package size={17} aria-hidden="true" />;
}

function SourceRecord({ source }: { source: ScenarioSource }) {
  const t = useTranslations("Pricing.examples.chat.workflow");
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={styles.source}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span className={styles.provider}><ProviderIcon provider={source.provider} /></span>
        <span className={styles.sourceName}><strong>{source.title}</strong><span>{source.location}</span></span>
        <ChevronDown size={15} className={open ? styles.flipped : undefined} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && <motion.div id={id} className={styles.sourcePreview} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.3 }}>
          <p className={styles.previewLabel}>{t("recordPreview")}</p><p>{source.excerpt}</p>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}

function EmailDraft({ email }: { email: NonNullable<ChatScenario["email"]> }) {
  const t = useTranslations("Pricing.examples.chat.workflow");
  const [review, setReview] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <section className={styles.email} aria-label={t("emailDraft")}>
      <header><Image src="/icons/integrations/gmail.svg" width={20} height={16} alt="Gmail" /><strong>{t(sent ? "emailSent" : "emailDraft")}</strong><span>{t("simulation")}</span></header>
      {sent ? <div className={styles.sent} role="status"><Check size={18} aria-hidden="true" /><div><strong>{t("sentTitle")}</strong><p>{t("sentDetail", { to: email.to })}</p></div></div> : <>
        <dl><div><dt>{t("recipient")}</dt><dd>{email.to}</dd></div><div><dt>{t("subject")}</dt><dd>{email.subject}</dd></div></dl>
        <AnimatePresence initial={false}>
          {review && <motion.div className={styles.emailBody} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.35 }}>
            <p>{email.body}</p><span className={styles.attachment}><FileText size={14} aria-hidden="true" />{email.attachment}</span>
          </motion.div>}
        </AnimatePresence>
        <footer><button type="button" className={styles.review} aria-expanded={review} onClick={() => setReview(!review)}>{t(review ? "hideDraft" : "reviewDraft")}<ChevronDown size={14} className={review ? styles.flipped : undefined} aria-hidden="true" /></button>
          {review && <button type="button" className={styles.send} onClick={() => setSent(true)}>{t("sendExample")}<Send size={13} aria-hidden="true" /></button>}
        </footer>
      </>}
    </section>
  );
}

export default function PricingAutomationScenario({ scenario, completedSteps, streaming, complete, children }: {
  scenario: ChatScenario;
  completedSteps: number;
  streaming: boolean;
  complete: boolean;
  children: ReactNode;
}) {
  const t = useTranslations("Pricing.examples.chat.workflow");
  const reduce = useReducedMotion();
  const replyStarted = completedSteps >= scenario.steps.length;
  return (
    <div className={styles.scenario} data-reply={replyStarted}>
      <div className={styles.workflow}>
        <p className={styles.workflowLabel}>{t("exampleConnections")}</p>
        <ol aria-label={t("lookupSteps")}>
          {scenario.steps.map((step, index) => {
            const done = index < completedSteps;
            const running = index === completedSteps && streaming;
            return <li key={step.title} data-state={done ? "done" : running ? "running" : "pending"}>
              <span className={styles.stepIcon}>{done ? <Check size={13} aria-hidden="true" /> : running ? <LoaderCircle size={13} className={styles.spinner} aria-hidden="true" /> : <span />}</span>
              <span><strong>{step.title}</strong><span>{step.detail}</span></span>
              <span className={styles.stepStatus}>{t(done ? "found" : running ? "checking" : streaming ? "waiting" : "paused")}</span>
            </li>;
          })}
        </ol>
      </div>
      {completedSteps > 0 && <div className={styles.sources} aria-label={t("sources")}>
        <p>{t("sources")}<ArrowUpRight size={12} aria-hidden="true" /></p>
        {scenario.sources.slice(0, completedSteps).map((source) => <motion.div key={source.id} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}><SourceRecord source={source} /></motion.div>)}
      </div>}
      {replyStarted && <div className={styles.answer}>{children}{streaming && <span className={styles.replyCursor} aria-hidden="true" />}</div>}
      <AnimatePresence>
        {complete && scenario.email && <motion.div className={styles.emailReveal} initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}><EmailDraft email={scenario.email} /></motion.div>}
      </AnimatePresence>
    </div>
  );
}
