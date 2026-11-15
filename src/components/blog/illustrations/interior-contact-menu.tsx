"use client";

import Image from "next/image";
import { Check, Instagram } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./website-comparison.module.css";

const channels = ["네이버", "카카오톡", "블로그", "인스타그램"] as const;

export default function InteriorContactMenu() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstOption = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstOption.current?.focus({ preventScroll: true });
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <div ref={root} className={styles.contactWidget}>
    <AnimatePresence>
      {open && <motion.div key="channels" id={id} role="group" aria-labelledby={`${id}-title`}
        className={styles.contactPopover}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: .97 }}
        transition={reduceMotion ? { duration: .1 } : { type: "spring", bounce: 0, duration: .3 }}>
        <p id={`${id}-title`}>편한 채널로 문의하세요</p>
        {channels.map((channel, index) => <button key={channel} type="button"
          ref={index === 0 ? firstOption : undefined} aria-pressed={selected === channel}
          onClick={() => setSelected(channel)}>
          <span className={styles.contactChannelIcon} aria-hidden="true">
            {index < 2 ? <Image src={`/icons/integrations/${index === 0 ? "naver" : "kakao"}.svg`} alt="" width={16} height={16} />
              : index === 2 ? <span className={styles.contactBlogIcon}>blog</span>
                : <Instagram size={17} strokeWidth={1.8} />}
          </span>
          <span>{channel}</span>
          {selected === channel && <Check className={styles.contactCheck} size={13} strokeWidth={2.5} aria-hidden="true" />}
        </button>)}
      </motion.div>}
    </AnimatePresence>
    <button ref={trigger} type="button" className={styles.contactTrigger} aria-expanded={open}
      aria-controls={open ? id : undefined} aria-label={open ? "문의 채널 닫기" : "문의 채널 열기"}
      onClick={() => setOpen(value => !value)}>
      <span>{open ? "닫기" : "문의하기"}</span>
    </button>
  </div>;
}
