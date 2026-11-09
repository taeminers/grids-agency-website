"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useReducedMotionPreference } from "@/components/coin-preview/use-reduced-motion";
import BrandLogo from "@/components/brand-logo";
import styles from "./archive-disclosure.module.css";

export function ArchiveDisclosure() {
  const t = useTranslations("Archive.Index");
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduced = useReducedMotionPreference();

  return (
    <div className={styles.stack} data-open={open} onPointerDown={event => event.stopPropagation()}>
    <div className={styles.notification} data-open={open}>
      <span className={styles.icon} aria-hidden="true"><BrandLogo className={styles.brandMark} /></span>
      <div className={styles.content}>
      <button type="button" className={styles.trigger} aria-expanded={open}
        aria-controls={`${id}-message`} onClick={() => setOpen(value => !value)}>
        <span className={styles.heading}>
          <span className={styles.title}>{t("disclosureNotice")}</span>
          <span className={styles.preview}>{t("disclosurePreview")}</span>
        </span>
        <span className={styles.chevron} aria-hidden="true"><ChevronDown size={17} strokeWidth={1.7} /></span>
      </button>
      <motion.div id={`${id}-message`} className={styles.message} initial={false}
        inert={!open} aria-hidden={!open}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : {
          height: { type: "spring", bounce: 0, duration: .45 },
          opacity: { duration: .2 },
        }}>
        <div className={styles.messageInner}>
          <p className={styles.description}>{t("disclosureDescription")}</p>
        </div>
      </motion.div>
      </div>
    </div>
    </div>
  );
}
