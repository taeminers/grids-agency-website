"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import spinners from "unicode-animations";
import FallbackAvatar from "@/components/fallback-avatar";
import styles from "./ai-chat-preview.module.css";

function GmailDraft({ onInteract }: { onInteract: () => void }) {
  const t = useTranslations("Possibilities.assistant.gmail");
  const [expanded, setExpanded] = useState(false);
  const [sent, setSent] = useState(false);
  const bodyId = useId();

  return (
    <div className={styles.integration} onFocusCapture={onInteract}>
      <p className={styles.prompt}>{t("prompt")}</p>
      <div className={styles.draft}>
        <div className={styles.header}>
          <Image src="/icons/integrations/gmail.svg" alt="" width={20} height={16} />
          <span>Gmail</span>
        </div>
        {sent ? (
          <div className={styles.confirmation} role="status">
            <Check size={18} aria-hidden="true" />
            <div><strong>{t("sent")}</strong><p>{t("sentDetail")}</p></div>
          </div>
        ) : (
          <>
            <dl className={styles.fields}>
              <div><dt>{t("to")}</dt><dd>{t("recipient")}<span>minseo@example.com</span></dd></div>
              <div><dt>{t("subjectLabel")}</dt><dd>{t("subject")}</dd></div>
            </dl>
            <div id={bodyId} hidden={!expanded} className={styles.body}>{t("body")}</div>
            <div className={styles.actions}>
              <button type="button" aria-expanded={expanded} aria-controls={bodyId} onClick={() => { onInteract(); setExpanded(!expanded); }}>
                {t(expanded ? "collapse" : "review")}<ChevronDown size={12} className={expanded ? styles.flipped : undefined} aria-hidden="true" />
              </button>
              {expanded && <button type="button" className={styles.send} onClick={() => { onInteract(); setSent(true); }}><Send size={12} aria-hidden="true" />{t("send")}</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AiChatPreview() {
  const t = useTranslations("Possibilities.assistant");
  const question = t("question");
  const answer = t("answer");
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const spinner = useRef<HTMLSpanElement>(null);
  const answerViewport = useRef<HTMLDivElement>(null);
  const action = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const interacting = useRef(false);
  const manuallyScrolled = useRef(false);
  const touchY = useRef<number | null>(null);
  const [cycle, setCycle] = useState(0);

  const pauseForReview = () => {
    interacting.current = true;
    timeline.current?.pause();
  };

  const stopAutoScroll = () => {
    manuallyScrolled.current = true;
  };

  useEffect(() => {
    const element = root.current;
    const field = input.current;
    const spinnerElement = spinner.current;
    if (!element || !field || !spinnerElement) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bounds = element.getBoundingClientRect();
    let visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    const answerDuration = Math.min(8, Math.max(4, Array.from(answer).length / 65));
    const answerCompleteAt = 5.3 + answerDuration;
    const actionAt = answerCompleteAt + 0.8;
    let sequence: gsap.core.Timeline;
    const context = gsap.context(() => {
      const letters = Array.from(question);
      const typing = { count: 0 };
      const replyTyping = { count: 0 };
      const emailScroll = { progress: 0 };
      let emailScrollStart = 0;
      let emailScrollEnd = 0;
      const replyLetters = Array.from(element.querySelectorAll<HTMLElement>("[data-chat-answer]"));
      let previousCount = 0;
      const updateAnswer = () => {
        const count = Math.floor(replyTyping.count);
        for (let index = Math.min(previousCount, count); index < Math.max(previousCount, count); index++) {
          replyLetters[index].style.opacity = index < count ? "1" : "0";
        }
        previousCount = count;
        const viewport = answerViewport.current;
        if (!viewport || !count || manuallyScrolled.current || interacting.current || media.matches) return;
        // Follow the last visible character, not the full (still hidden) answer's height.
        const bottom = replyLetters[count - 1].getBoundingClientRect().bottom;
        const overflow = bottom + 16 - viewport.getBoundingClientRect().bottom;
        if (overflow > 0) viewport.scrollTop += overflow;
      };
      const loading = { frame: 0 };
      const updateSpinner = () => {
        spinnerElement.textContent = spinners.orbit.frames[Math.floor(loading.frame) % spinners.orbit.frames.length];
      };
      const updateQuestion = () => { field.value = letters.slice(0, Math.floor(typing.count)).join(""); };
      sequence = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6, repeatRefresh: true, onRepeat: () => {
        manuallyScrolled.current = false;
        setCycle(value => value + 1);
      } });
      timeline.current = sequence;
      sequence
        .set(answerViewport.current, { scrollTop: 0 })
        .set(emailScroll, { progress: 0 })
        .set(typing, { count: 0, onUpdate: updateQuestion })
        .set(loading, { frame: 0, onUpdate: updateSpinner })
        .set("[data-chat-loader]", { autoAlpha: 0 })
        .set(field, { opacity: 1 })
        .set("[data-chat-question]", { autoAlpha: 0, y: 6 })
        .set("[data-chat-reply]", { autoAlpha: 0, y: 6, filter: "blur(4px)" })
        .set("[data-chat-answer]", { opacity: 0 })
        .set(replyTyping, { count: 0, onUpdate: updateAnswer })
        .set(action.current, { autoAlpha: 0, y: 8 })
        .set("[data-chat-source], [data-chat-sent]", { autoAlpha: 0 })
        .set("[data-chat-arrow]", { opacity: 1 })
        .set("[data-chat-send]", { opacity: 0.35, scale: 1 })
        .to(typing, { count: letters.length, duration: 1.6, ease: "none", onUpdate: updateQuestion }, 0.5)
        .to("[data-chat-send]", { opacity: 1, duration: 0.2 }, 2.1)
        .to("[data-chat-send]", { scale: 0.9, duration: 0.12, repeat: 1, yoyo: true }, 2.4)
        .to("[data-chat-arrow]", { opacity: 0, duration: 0.15 }, 2.6)
        .to("[data-chat-sent]", { autoAlpha: 1, duration: 0.15 }, 2.6)
        .to("[data-chat-question]", { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 2.8)
        .to("[data-chat-loader]", { autoAlpha: 1, duration: 0.15 }, 2.8)
        .to(loading, { frame: 2000 / spinners.orbit.interval, duration: 2, ease: "none", onUpdate: updateSpinner }, 2.8)
        .set(typing, { count: 0, onUpdate: updateQuestion }, 3.1)
        .to("[data-chat-sent]", { autoAlpha: 0, duration: 0.15 }, 3.1)
        .to("[data-chat-arrow]", { opacity: 1, duration: 0.15 }, 3.1)
        .to("[data-chat-send]", { opacity: 0.35, duration: 0.15 }, 3.1)
        .to("[data-chat-loader]", { autoAlpha: 0, duration: 0.15 }, 4.85)
        .to("[data-chat-reply]", { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, 5.1)
        .to(replyTyping, { count: replyLetters.length, duration: answerDuration, ease: "none", onUpdate: updateAnswer }, 5.3)
        .to("[data-chat-source]", { autoAlpha: 1, duration: 0.3 }, answerCompleteAt + 0.2)
        .to(action.current, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, actionAt)
        .to(emailScroll, {
          progress: 1, duration: 0.9, ease: "power2.inOut",
          onStart: () => {
            const viewport = answerViewport.current;
            if (!viewport) return;
            emailScrollStart = viewport.scrollTop;
            emailScrollEnd = Math.max(0, Math.min(action.current?.offsetTop ?? 0, viewport.scrollHeight - viewport.clientHeight));
          },
          onUpdate: () => {
            const viewport = answerViewport.current;
            if (!viewport || manuallyScrolled.current || interacting.current || media.matches) return;
            viewport.scrollTop = emailScrollStart + (emailScrollEnd - emailScrollStart) * emailScroll.progress;
          },
        }, actionAt)
        .to("[data-chat-question], [data-chat-reply], [data-chat-action]", { autoAlpha: 0, duration: 0.4 }, actionAt + 14);
    }, element);
    const syncPlayback = () => {
      if (interacting.current) sequence.pause();
      else if (media.matches) sequence.pause(actionAt + 0.4);
      else if (visible && !document.hidden && !interacting.current) sequence.play();
      else sequence.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(element);
    media.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      context.revert();
      timeline.current = null;
    };
  }, [question, answer]);

  return (
    <div ref={root} role="group" aria-label={t("gmail.previewLabel")} className="mx-auto flex h-full w-full max-w-md flex-col gap-3 text-foreground">
      <div data-chat-question className="invisible flex max-w-[95%] shrink-0 items-start gap-2 self-end opacity-0">
        <p className="min-w-0 rounded-lg bg-foreground/5 px-3 py-2 text-[11px] leading-relaxed [word-break:keep-all]">{question}</p>
        <FallbackAvatar name="GRIDS Growth" size={24} animated={true} className="mt-1 shrink-0" />
      </div>
      <div ref={answerViewport}
        onWheel={event => { if (event.deltaY < 0 && event.currentTarget.scrollTop > 0) stopAutoScroll(); }}
        onTouchStart={event => { touchY.current = event.touches[0]?.clientY ?? null; }}
        onTouchMove={event => {
          const currentY = event.touches[0]?.clientY;
          if (touchY.current !== null && currentY !== undefined && currentY - touchY.current > 6 && event.currentTarget.scrollTop > 0) stopAutoScroll();
        }}
        onTouchEnd={() => { touchY.current = null; }}
        className={`relative min-h-0 flex-1 overflow-y-auto overscroll-contain ${styles.answerViewport}`}>
        <div data-chat-loader className="invisible absolute top-0 left-1 flex items-center gap-2 text-[10px] text-muted-foreground opacity-0">
          <span ref={spinner} data-chat-orbit className="inline-block w-4 font-mono text-xl leading-6">{spinners.orbit.frames[0]}</span>
          <span>{t("thinking")}</span>
        </div>
        <div data-chat-reply className="invisible flex items-start gap-3 px-1 opacity-0">
          <FallbackAvatar name="GRIDS AI" size={24} appearance="original" animated={false} className="mt-0.5 shrink-0 bg-linear-to-br from-foreground/10 to-foreground/30" />
          <div className="min-w-0">
            <p className="text-[11px] leading-[1.8] whitespace-pre-line [word-break:keep-all]"><span className="sr-only">{answer}</span><span aria-hidden="true">{Array.from(answer).map((letter, index) => <span key={index} data-chat-answer className="opacity-0">{letter}</span>)}</span></p>
            <div data-chat-source className="invisible mt-3 flex items-center gap-1.5 text-[8px] text-muted-foreground opacity-0"><svg width="10" height="11" viewBox="0 0 12 14" className="shrink-0" fill="none" stroke="currentColor" strokeWidth="1"><path d="M2 1h5l3 3v9H2ZM7 1v4h3M4 8h4M4 10h3" /></svg>{t("source")}</div>
          </div>
        </div>
        <div ref={action} data-chat-action className="invisible opacity-0"><GmailDraft key={cycle} onInteract={pauseForReview} /></div>
      </div>
      <div className="mt-auto flex shrink-0 items-center gap-3 rounded-lg border border-foreground/15 bg-foreground/[0.025] py-3 pr-3 pl-4">
        <textarea ref={input} data-chat-input aria-label={t("placeholder")} readOnly tabIndex={-1} rows={2} defaultValue="" placeholder={t("placeholder")} className="block h-9 min-w-0 flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 text-[11px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground [word-break:keep-all]" />
        <div data-chat-send className="relative flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background opacity-35">
          <svg data-chat-arrow width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
          <svg data-chat-sent width="14" height="14" viewBox="0 0 16 16" className="invisible absolute opacity-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8 3 3 6-6" /></svg>
        </div>
      </div>
    </div>
  );
}
