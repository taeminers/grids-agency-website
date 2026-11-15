"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import Dots08 from "./shadcn-space/dots/dots-08";
import styles from "./home-approach.module.css";

const replyFields = ["firstTitle", "firstBody", "secondTitle", "secondBody", "closing"] as const;

function renderReply(blocks: string[], streaming = false) {
  return blocks.map((block, index) => {
    const Tag = index % 2 === 0 ? "strong" : "span";
    return <Tag key={index} className={styles.replyBlock}>{Array.from(block).map((letter, letterIndex) => (
      <span key={letterIndex} data-reply-letter={streaming || undefined} className={streaming ? styles.replyLetter : undefined}>{letter}</span>
    ))}</Tag>;
  });
}

export default function ApproachReply({ topic }: { topic: "cost" | "speed" | "quality" }) {
  const t = useTranslations(`HomeApproach.${topic}.reply`);
  const all = useTranslations("HomeApproach");
  const root = useRef<HTMLElement>(null);
  const replies = (["cost", "speed", "quality"] as const).map(item => ({
    topic: item,
    blocks: replyFields.map(field => all(`${item}.reply.${field}`)),
  }));
  const blocks = replies.find(reply => reply.topic === topic)!.blocks;
  const fullText = blocks.join("\n\n");

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let sequence: gsap.core.Timeline;
    const context = gsap.context(() => {
      const letters = Array.from(element.querySelectorAll<HTMLElement>("[data-reply-letter]"));
      const typing = { count: 0 };
      let previousCount = 0;
      const updateText = () => {
        const count = Math.floor(typing.count);
        for (let index = Math.min(previousCount, count); index < Math.max(previousCount, count); index++) {
          letters[index].style.opacity = index < count ? "1" : "0";
        }
        previousCount = count;
      };
      // Match the chatbot example: reveal characters in place, without reflow.
      gsap.set(letters, { opacity: 0 });
      sequence = gsap.timeline({ paused: true })
        .fromTo("[data-reply-text]", { opacity: 0, y: 6, filter: "blur(4px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, 0)
        .to(typing, {
          count: letters.length,
          duration: Math.min(8, Math.max(4, letters.length / 65)),
          ease: "none",
          onUpdate: updateText,
        }, 0.2);
    }, element);
    const syncPlayback = () => {
      if (media.matches) sequence.progress(1).pause();
      else if (visible && !document.hidden) sequence.play();
      else sequence.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      syncPlayback();
    }, { threshold: [0, 0.35] });
    observer.observe(element);
    media.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      context.revert();
    };
  }, [fullText]);

  return (
    <aside ref={root} className={styles.replyCard} aria-label={t("name")}>
      <div className={styles.replyHeader}>
        <span className={styles.replyAvatar} aria-hidden="true"><Dots08 size={44} /></span>
        <div><span className={styles.replyName}>{t("name")}</span><span className={styles.replyRole}>{t("role")}</span></div>
      </div>
      <div className={styles.replyBody}>
        {/* Reserve the tallest localized reply at this width, including enlarged text. */}
        {replies.map(reply => <p key={reply.topic} aria-hidden="true" className={styles.replySizer}>{renderReply(reply.blocks)}</p>)}
        <p data-reply-text className={styles.replyText}>
          <span className="sr-only">{fullText}</span>
          <span aria-hidden="true">{renderReply(blocks, true)}</span>
        </p>
      </div>
    </aside>
  );
}
