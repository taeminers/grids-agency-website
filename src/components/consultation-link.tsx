"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import styles from "./consultation-link.module.css";

type ConsultationLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  label: string;
  icon?: ReactNode;
};

export default function ConsultationLink({ label, icon, className, ...props }: ConsultationLinkProps) {
  return (
    <Link {...props} className={[styles.consultation, className].filter(Boolean).join(" ")}>
      <span className={styles.consultationLabel}>{label}</span>
      <span className={styles.consultationTrack} aria-hidden="true">
        <span className={styles.consultationArrow}>{icon ?? <ArrowRight size={16} />}</span>
      </span>
    </Link>
  );
}
