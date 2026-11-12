"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, BookOpen, CalendarCheck, ChevronDown, MapPin } from "lucide-react";
import { Airplane, ChatsCircle, Ticket } from "@phosphor-icons/react";
import { SupportWidget, type SupportWidgetData } from "@/components/support-widget";
import FallbackAvatar from "@/components/fallback-avatar";
import Dots08 from "@/components/shadcn-space/dots/dots-08";
import WebsiteHeroPreview from "@/components/website-hero-preview";
import type { ExamplePreviewDevice } from "./pricing-example-viewport";
import styles from "./pricing-support-demo.module.css";

type Topic = "booking" | "policy" | "human";
type Turn = { id: string; role: "user" | "assistant"; text: string; at: string; author?: string; streaming?: boolean; complete?: boolean; kind?: "lookup" | "reservation" | "policy" };
const topics: Topic[] = ["booking", "policy", "human"];

function ReservationLookup({ disabled, onFind }: { disabled: boolean; onFind: () => void }) {
  const t = useTranslations("Pricing.examples.support.lookup");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const id = useId();
  return <form className={styles.lookup} onSubmit={(event) => { event.preventDefault(); if (disabled) return; if (value.trim().toUpperCase() !== "RM-2048") { setError(true); return; } setError(false); onFind(); }}>
    <label htmlFor={id}>{t("label")}</label>
    <div><input id={id} aria-describedby={`${id}-help`} aria-invalid={error || undefined} value={value} placeholder="RM-2048" maxLength={30} disabled={disabled} onChange={(event) => { setValue(event.target.value); setError(false); }} /><button type="submit" disabled={disabled || !value.trim()}>{t("find")}<ArrowRight size={12} aria-hidden="true" /></button></div>
    <p id={`${id}-help`} role={error ? "alert" : undefined}>{t(error ? "error" : "hint")}</p>
  </form>;
}

function Reservation() {
  const t = useTranslations("Pricing.examples.support.reservation");
  return <section className={styles.reservation} aria-label={t("title")}><header><CalendarCheck size={15} aria-hidden="true" /><strong>{t("title")}</strong><span>{t("confirmed")}</span></header><h3>{t("trip")}</h3><p><MapPin size={12} aria-hidden="true" />{t("destination")}</p><dl><div><dt>{t("number")}</dt><dd>RM-2048</dd></div><div><dt>{t("dates")}</dt><dd>2026.12.04 – 12.06</dd></div><div><dt>{t("guests")}</dt><dd>{t("guestValue")}</dd></div></dl></section>;
}

function Policy() {
  const t = useTranslations("Pricing.examples.support.policy");
  return <details className={styles.policy}><summary><BookOpen size={14} aria-hidden="true" /><span>{t("title")}</span><ChevronDown size={13} aria-hidden="true" /></summary><p>{t("body")}</p></details>;
}

function SupportSession({ device }: { device: ExamplePreviewDevice }) {
  const t = useTranslations("Pricing.examples.support");
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const handoffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [handoff, setHandoff] = useState<"bot" | "waiting" | "human">("bot");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const welcome = (): Turn => ({ id: "welcome", role: "assistant", text: t("welcome"), at: new Date().toISOString(), complete: true });
  const [turns, setTurns] = useState<Turn[]>(() => [welcome()]);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); if (handoffTimer.current) clearTimeout(handoffTimer.current); }, []);
  const busy = !!streamingId || handoff === "waiting";

  const respond = (text: string, options: { prompt?: string; kind?: Turn["kind"]; author?: string; after?: () => void } = {}) => {
    if (timer.current || handoffTimer.current) return;
    const turnId = ++sequence.current;
    const id = `answer-${turnId}`;
    const at = new Date().toISOString();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTurns((current) => [...current, ...(options.prompt ? [{ id: `question-${turnId}`, role: "user" as const, text: options.prompt, at }] : []), { id, role: "assistant", text: reduced ? text : "", at, author: options.author, kind: options.kind, streaming: !reduced, complete: reduced }]);
    if (reduced) { options.after?.(); return; }
    setStreamingId(id);
    const letters = Array.from(text);
    let ticks = 0;
    let count = 0;
    timer.current = setInterval(() => {
      if (++ticks < 8) return;
      count = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? letters.length : Math.min(count + 2, letters.length);
      const done = count === letters.length;
      const revealed = letters.slice(0, count).join("");
      setTurns((current) => current.map((turn) => turn.id === id ? { ...turn, text: revealed, streaming: !done, complete: done } : turn));
      if (done) { if (timer.current) clearInterval(timer.current); timer.current = null; setStreamingId(null); options.after?.(); }
    }, 32);
  };

  const quickReply = (topic: Topic) => {
    if (busy) return;
    if (topic === "human") {
      respond(t("replies.handoff"), { prompt: t("questions.human"), after: () => {
        setHandoff("waiting");
        handoffTimer.current = setTimeout(() => { handoffTimer.current = null; setHandoff("human"); respond(t("replies.human"), { author: t("human.name") }); }, 900);
      } });
    } else respond(t(`replies.${topic}`), { prompt: t(`questions.${topic}`), kind: topic === "booking" ? "lookup" : "policy" });
  };
  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    if (handoffTimer.current) clearTimeout(handoffTimer.current);
    timer.current = null; handoffTimer.current = null;
    setTurns([welcome()]); setStreamingId(null); setHandoff("bot");
  };
  const data: SupportWidgetData = {
    bot: { name: "LOCUS", role: t("botRole") }, human: { name: t("human.name"), role: t("human.role") }, visitor: { name: t("visitor") },
    mode: handoff === "human" ? "human" : streamingId ? "typing" : handoff,
    wait: handoff === "waiting" ? t("human.wait") : undefined,
    messages: turns.map(({ kind, text, ...turn }) => ({ ...turn, content: <div className={styles.turn}><p>{turn.streaming ? Array.from(text).map((letter, index) => <span className={styles.letter} key={index}>{letter}</span>) : text}</p>{turn.complete && kind === "lookup" && <ReservationLookup disabled={busy || turns.some((item) => item.kind === "reservation")} onFind={() => respond(t("replies.reservation"), { prompt: t("lookup.userMessage"), kind: "reservation" })} />}{turn.complete && kind === "reservation" && <Reservation />}{turn.complete && kind === "policy" && <Policy />}</div> })),
    quickReplies: handoff === "bot" ? topics.map((topic, index) => ({ id: topic, title: t(`questions.${topic}`), prompt: t(`questions.${topic}`), icon: [Ticket, Airplane, ChatsCircle][index] })) : undefined,
  };

  return <div className={styles.demo} data-pricing-support data-device={device}>
    <SupportWidget data={data} open={open} busy={busy} onOpenChange={setOpen} onClose={reset}
      onSend={(text) => respond(t("fallback"), { prompt: text, author: handoff === "human" ? t("human.name") : undefined })}
      onQuickReply={(prompt) => { const topic = topics.find((topic) => t(`questions.${topic}`) === prompt); if (topic) quickReply(topic); }}
      botAvatar={<span className={styles.botAvatar} aria-hidden="true"><Dots08 size={36} followCursor={false} /></span>}
      launcherIcon={<span aria-hidden="true"><Dots08 size={43} followCursor={false} /></span>}
      renderAvatar={(message) => message.role === "user" ? <FallbackAvatar name="GRIDS Growth" size={24} animated /> : message.author === t("human.name") ? undefined : <span className={styles.botAvatar} aria-hidden="true"><Dots08 size={28} followCursor={false} /></span>}
    >
      <WebsiteHeroPreview />
      {!open && <button type="button" className={styles.launcherHint} onClick={() => setOpen(true)}>{t("launcherHint")}</button>}
    </SupportWidget>
  </div>;
}

export default function PricingSupportDemo({ device = "desktop" }: { device?: ExamplePreviewDevice }) {
  const locale = useLocale();
  return <SupportSession key={locale} device={device} />;
}
