"use client";

import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import styles from "./project-questionnaire.module.css";
import { trackEvent } from "@/lib/analytics";
import { showPrivacyLinks } from "@/lib/privacy-publication";

const steps = ["name", "company", "build", "budget", "email", "notes"] as const;
const services = ["website", "app", "admin", "automation", "ai", "unsure", "other"] as const;
const budgets = ["small", "medium", "large", "enterprise", "scale", "discuss", "flexible", "business"] as const;
const inputClass = "w-full rounded-none border-0 border-b border-foreground/25 bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-tertiary md:text-lg";

export default function ProjectQuestionnaire({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const t = useTranslations("Connect.Questionnaire");
  const locale = useLocale();
  const contact = useTranslations("Connect");
  const reduced = useReducedMotion();
  const [closing, setClosing] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ name: "", company: "", email: "", notes: "", budget: "", other: "", build: [] as string[] });
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const sending = useRef(false);
  const contactStarted = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = steps[step];
  const final = step === steps.length - 1;
  const validation = (() => {
    if (current === "name" && !draft.name.trim()) return t("nameRequired");
    if (current === "build" && !draft.build.length) return t("required");
    if (current === "build" && draft.build.includes("other") && !draft.other.trim()) return t("otherRequired");
    if (current === "budget" && !draft.budget) return t("required");
    if (current === "email") {
      if (!draft.email.trim()) return t("emailRequired");
      if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(draft.email.trim())) return t("emailInvalid");
    }
    return "";
  })();
  const feedback = touched && validation ? validation : error;
  const summary = () => [
    `${t("name.title")}: ${draft.name}`,
    `${t("company.title")}: ${draft.company || "—"}`,
    `${t("build.title")}: ${draft.build.map(value => value === "other" ? `${t("services.other")}: ${draft.other.trim()}` : t(`services.${value}`)).join(", ")}`,
    `${t("budget.title")}: ${t(`budgets.${draft.budget}`)}`,
    `${t("email.title")}: ${draft.email}`,
    `${t("notes.title")}: ${draft.notes || "—"}`,
  ].join("\n\n");

  const trackContactStart = () => {
    if (contactStarted.current) return;
    contactStarted.current = true;
    trackEvent("contact_start", { form_name: "project_inquiry" });
  };

  const trackContactStartFromControl = (target: EventTarget) => {
    if (!(target instanceof Element)) return;
    const control = target.closest("input, textarea, select, button, label");
    if (control?.closest("fieldset")) trackContactStart();
  };

  const trackLeadFailure = () => {
    trackEvent("generate_lead_failed", { form_name: "project_inquiry" });
  };

  const advance = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    if (validation) {
      setTouched(true);
      return;
    }
    setError("");
    if (!final) { setTouched(false); setStep(step + 1); return; }
    const service = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const template = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (!service || !template || !publicKey) {
      trackLeadFailure();
      setError(t("unavailable"));
      return;
    }
    sending.current = true;
    setStatus("sending");
    try {
      await emailjs.send(service, template, {
        to_email: "kyle@gridsagency.com",
        to_name: "Kyle",
        reply_to: draft.email.trim(),
        from_name: draft.name.trim(),
        subject: `${t("emailSubject")} — ${draft.name.trim()}`,
        firstName: draft.name.trim(), lastName: "", email: draft.email.trim(), phone: "",
        company: draft.company.trim(), message: summary(),
      }, { publicKey });
      trackEvent("generate_lead", { form_name: "project_inquiry" });
      setStatus("success");
      onSuccess();
    } catch {
      trackLeadFailure();
      setStatus("idle");
      setError(t("sendError"));
    } finally {
      sending.current = false;
    }
  };

  return (
    <form
      noValidate
      onSubmit={advance}
      onFocusCapture={(event) => trackContactStartFromControl(event.target)}
      onInputCapture={(event) => trackContactStartFromControl(event.target)}
      onClickCapture={(event) => trackContactStartFromControl(event.target)}
      onKeyDown={event => {
      if (event.key === "Enter" && event.target instanceof HTMLInputElement && ["text", "email"].includes(event.target.type)) {
        event.preventDefault();
        event.currentTarget.requestSubmit();
      }
    }}
      className="relative isolate flex min-h-[calc(100svh-112px)] w-full flex-col items-center pt-12 pb-28 md:min-h-[calc(100svh-72px)] md:pt-16 md:pb-12"
    >
      <div className="flex w-full flex-1 items-center justify-center py-10 md:py-16">
        <motion.div
          layout="position"
          transition={{ layout: { duration: reduced ? 0 : 0.9, ease: [0.4, 0, 0.2, 1] } }}
          className="w-full max-w-2xl text-center"
        >
            <h1 ref={heading} tabIndex={-1} id="question-title" className="relative overflow-hidden py-1 text-[clamp(26px,3vw,44px)] leading-tight font-medium tracking-[-0.05em] text-balance outline-none [perspective:800px]">
              <span className="sr-only">{t(status === "success" ? "successTitle" : `${current}.title`)}</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={status === "success" ? "success" : current}
                  aria-hidden="true"
                  initial={{ y: reduced ? 0 : "110%", rotateX: reduced ? 0 : -55 }}
                  animate={{ y: 0, rotateX: 0 }}
                  exit={{ y: reduced ? 0 : "-110%", rotateX: reduced ? 0 : 55 }}
                  transition={{ duration: reduced ? 0 : 0.9, ease: [0.4, 0, 0.2, 1] }}
                  onAnimationComplete={() => heading.current?.focus({ preventScroll: true })}
                  className="block w-full origin-center [backface-visibility:hidden]"
                >
                  {t(status === "success" ? "successTitle" : `${current}.title`)}
                </motion.span>
              </AnimatePresence>
            </h1>
            <motion.div
              key={status === "success" ? "success-answer" : `answer-${current}`}
              initial={{ opacity: reduced ? 1 : 0, clipPath: reduced ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }}
              animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="px-1 pb-1"
            >
            {status === "success" ? (
              <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-foreground/60">{t("successDescription")}</p>
            ) : (
              <fieldset disabled={status === "sending"} aria-describedby="question-error" onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setTouched(true);
              }} className="mx-auto mt-10 w-full max-w-lg border-0 p-0">
                <legend className="sr-only">{t(`${current}.title`)}</legend>
                {(current === "name" || current === "company" || current === "email") && (
                  <input
                    key={current} aria-labelledby="question-title" aria-describedby="question-error" aria-invalid={touched && Boolean(validation)}
                    name={current} type={current === "email" ? "email" : "text"}
                    autoComplete={current === "company" ? "organization" : current}
                    required={current !== "company"} maxLength={current === "email" ? 254 : 120}
                    placeholder={t(`${current}.placeholder`)} value={draft[current]}
                    onChange={event => { setDraft({ ...draft, [current]: event.target.value }); setError(""); }}
                    className={`${inputClass} max-w-sm`}
                  />
                )}
                {current === "build" && (
                  <>
                    <p className="mb-5 text-xs text-foreground/50">{t("multiple")}</p>
                    <div className={styles.choiceGrid}>
                      {services.map((value, index) => <motion.button initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.26 + index * 0.06, ease: [0.4, 0, 0.2, 1] }} key={value} type="button" aria-pressed={draft.build.includes(value)} onClick={() => { setDraft({ ...draft, build: draft.build.includes(value) ? draft.build.filter(item => item !== value) : [...draft.build, value] }); setError(""); }} className={`${styles.choiceCard} ${styles.serviceOption}`}><span>{t(`services.${value}`)}</span><span className={styles.selectionMark} aria-hidden="true"><Check size={12} /></span></motion.button>)}
                    </div>
                    <AnimatePresence initial={false}>
                      {draft.build.includes("other") && (
                        <motion.div key="other-details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.5, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden text-left">
                          <label htmlFor="project-other" className="mt-6 block text-xs text-foreground/60">{t("otherLabel")}</label>
                          <input id="project-other" name="other" type="text" required maxLength={500} value={draft.other} placeholder={t("otherPlaceholder")} aria-describedby="question-error" aria-invalid={touched && !draft.other.trim()} onChange={event => { setDraft({ ...draft, other: event.target.value }); setError(""); }} className={inputClass} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
                {current === "budget" && (
                  <div className={styles.choiceGrid}>
                    {budgets.map((value, index) => <motion.label initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.26 + index * 0.06, ease: [0.4, 0, 0.2, 1] }} key={value} className={styles.choiceCard}><input type="radio" name="budget" value={value} required checked={draft.budget === value} onChange={() => { setDraft({ ...draft, budget: value }); setError(""); }} className={styles.radio} /><span>{t(`budgets.${value}`)}</span></motion.label>)}
                  </div>
                )}
                {current === "notes" && (
                  <>
                    <div className={styles.noteField}>
                      <label htmlFor="project-notes" className="sr-only">{t("notes.label")}</label>
                      <textarea
                        id="project-notes"
                        aria-describedby="project-notes-meta"
                        name="notes" rows={6} maxLength={5000} value={draft.notes}
                        onChange={event => setDraft({ ...draft, notes: event.target.value })}
                        placeholder={t("notes.placeholder")}
                        className={styles.noteInput}
                      />
                      <div id="project-notes-meta" className={styles.noteMeta}>
                        <span>{t("notes.optional")}</span>
                        {draft.notes.length > 0 && <span aria-label={t("notes.count", { count: draft.notes.length })}>{draft.notes.length.toLocaleString()} / 5,000</span>}
                      </div>
                    </div>
                  </>
                )}
              </fieldset>
            )}
            </motion.div>
        </motion.div>
      </div>
      <div className="w-full max-w-lg text-center">
        {showPrivacyLinks && status !== "success" && <p className={styles.privacyNotice}>{t("privacyNotice")} <Link href={`/${locale}/privacy`}>{t("privacyLink")}</Link></p>}
        <div id="question-error" role="alert" className="mb-5 min-h-5 text-xs text-foreground/70">
          <AnimatePresence mode="wait" initial={false}>
            {feedback && (
              <motion.div
                key={feedback}
                initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(4px)" }}
                transition={{ duration: reduced ? 0 : 0.35, ease: "easeInOut" }}
              >
                <p>{feedback}</p>
                {final && error && !validation && <a className="mt-2 inline-block underline underline-offset-4" href={`mailto:${contact("Cards.emailValue")}?subject=${encodeURIComponent(t("emailSubject"))}&body=${encodeURIComponent(summary())}`} onClick={() => trackEvent("cta_click", { cta_location: "contact_form", cta_text: t("emailFallback") })}>{t("emailFallback")}</a>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {status === "success" ? <button type="button" className={styles.button} disabled={closing} onClick={() => { setClosing(true); onClose(); }}>{t("done")}</button> : (
          <nav aria-label={t("navigation")} className={styles.navigation}>
            <button
              type="button"
              className={styles.button}
              disabled={status === "sending"}
              onClick={() => { setError(""); setTouched(false); if (step === 0) onClose(); else setStep(step - 1); }}
            >{t("back")}</button>
            <span aria-live="polite" aria-atomic="true" className={styles.progress}>{step + 1} / {steps.length}</span>
            <button
              className={styles.button}
              type="submit"
              aria-describedby="question-error"
              aria-busy={status === "sending"}
              disabled={status === "sending" || Boolean(validation)}
            >{t(status === "sending" ? "sending" : final ? "send" : "next")}</button>
          </nav>
        )}
      </div>
    </form>
  );
}
