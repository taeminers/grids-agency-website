"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import styles from "./consultation-link.module.css";

type ConsultationLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  label: string;
  hoverLabel?: string;
  icon?: ReactNode;
};

export default function ConsultationLink({ label, hoverLabel, icon, className, ...props }: ConsultationLinkProps) {
  return (
    <Link {...props} className={[styles.consultation, className].filter(Boolean).join(" ")}>
      <span className={styles.consultationLabel}>
        {hoverLabel ? <span className={styles.labelSwap} aria-hidden="true">
          <span className={styles.defaultLabel}>{label}</span>
          <span className={styles.hoverLabel}>{hoverLabel}</span>
        </span> : label}
      </span>
      {hoverLabel && <span className="sr-only">{label}</span>}
      <span className={styles.consultationTrack} aria-hidden="true">
        <span className={styles.consultationArrow}>{icon ?? <ArrowRight size={16} />}</span>
      </span>
    </Link>
  );
}
