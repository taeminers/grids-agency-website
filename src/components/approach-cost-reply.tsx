"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useTranslations } from "next-intl";
import FallbackAvatar from "./fallback-avatar";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import { StreamingMessage } from "./ui/streaming-message";
import styles from "./home-approach.module.css";

export default function ApproachCostReply() {
  const t = useTranslations("HomeApproach.cost.reply");
  const root = useRef<HTMLElement>(null);
  const visible = useInView(root, { once: true, amount: 0.35 });
  const reduce = useReducedMotionPreference();
  const [wordCount, setWordCount] = useState(0);
  const fullText = [
    t("intro"),
    `**${t("reuseTitle")}**\n${t("reuseBody")}`,
    `**${t("customTitle")}**\n${t("customBody")}`,
    t("closing"),
  ].join("\n\n");
  const words = fullText.match(/\S+\s*|\s+/g) ?? [];
  useEffect(() => {
    if (!visible || reduce) return;
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setWordCount(count);
      if (count >= words.length) clearInterval(timer);
    }, 70);
    return () => clearInterval(timer);
  }, [visible, reduce, fullText, words.length]);
  const done = reduce || wordCount >= words.length;

  return (
    <aside ref={root} className={styles.replyCard} aria-label={t("name")}>
      <div className={styles.replyHeader}>
        <FallbackAvatar name="GRIDS Growth" size={32} animated={true} className={styles.replyAvatar} />
        <div><span className={styles.replyName}>{t("name")}</span><span className={styles.replyRole}>{visible && !done ? t("responding") : t("role")}</span></div>
      </div>
      <div className={styles.replyBody}>
        {/* Reserve the final reply height so streaming never shifts the section. */}
        <div className={styles.replyMeasure} aria-hidden="true">
          <p>{t("intro")}</p>
          <p><strong>{t("reuseTitle")}</strong><br />{t("reuseBody")}</p>
          <p><strong>{t("customTitle")}</strong><br />{t("customBody")}</p>
          <p>{t("closing")}</p>
          <div className={styles.replyActionSpace} />
        </div>
        {(visible || reduce) && <StreamingMessage
          className={styles.replyMessage}
          model={t("name")}
          showHeader={false}
          data={{ content: reduce ? fullText : words.slice(0, wordCount).join(""), status: done ? "done" : "streaming" }}
          labels={{
            messageFrom: (model) => t("messageFrom", { model }),
            responding: t("responding"), complete: t("complete"), failed: t("failed"),
            copy: t("copy"), copied: t("copied"),
          }}
        />}
      </div>
    </aside>
  );
}
