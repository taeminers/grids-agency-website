"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import styles from "./consultation-link.module.css";

type ConsultationLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  label: string;
  hoverLabel?: string;
  icon?: ReactNode;
};

type ButtonContentProps = Pick<ConsultationLinkProps, "label" | "hoverLabel" | "icon">;

function ButtonContent({ label, hoverLabel, icon }: ButtonContentProps) {
  return <>
    <span className={styles.consultationLabel}>
      {hoverLabel ? <span className={styles.labelSwap} aria-hidden="true">
        <span className={styles.defaultLabel}>{label}</span>
        <span className={styles.hoverLabel}>{hoverLabel}</span>
      </span> : label}
    </span>
    {hoverLabel && <span className="sr-only">{label}</span>}
    <span className={styles.consultationTrack} aria-hidden="true">
      <span className={styles.consultationArrow}>{icon ?? <ChevronRight strokeWidth={3.5} size={16} />}</span>
    </span>
  </>;
}

export function ConsultationAction({ label, hoverLabel, icon, className, type = "button", ...props }: Omit<ComponentProps<"button">, "children"> & ButtonContentProps) {
  return <button {...props} type={type} className={[styles.consultation, className].filter(Boolean).join(" ")}>
    <ButtonContent label={label} hoverLabel={hoverLabel} icon={icon} />
  </button>;
}

export default function ConsultationLink({ label, hoverLabel, icon, className, ...props }: ConsultationLinkProps) {
  return (
    <Link {...props} className={[styles.consultation, className].filter(Boolean).join(" ")}>
      <ButtonContent label={label} hoverLabel={hoverLabel} icon={icon} />
    </Link>
  );
}
