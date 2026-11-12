"use client";

import { useTranslations } from "next-intl";
import { Braces, Cloud, Globe2 } from "lucide-react";
import styles from "./pricing-notes.module.css";

const notes = ["scope", "costs", "translation"] as const;

function ScopeVisual() {
  return (
    <div className={styles.scopeArt} aria-hidden="true">
      <div className={styles.lockShadow} />
      <div className={styles.padlock}>
        <div className={styles.lockShackle} />
        <div className={styles.lockBody}>
          <span className={styles.lockKeyhole} />
          <span className={styles.lockPinLeft} />
          <span className={styles.lockPinRight} />
        </div>
      </div>
    </div>
  );
}

function CostsVisual() {
  const t = useTranslations("Pricing.packages.notes.costs");
  return (
    <div className={styles.costsArt} aria-hidden="true">
      {([{ label: "domain", icon: Globe2 }, { label: "hosting", icon: Cloud }, { label: "api", icon: Braces }] as const).map(({ label, icon: Icon }) => (
        <div key={label} className={styles.serviceBill}>
          <span className={styles.billIcon}><Icon size={19} strokeWidth={1.5} /></span>
          <span>{t(`visual.${label}`)}</span>
          <span className={styles.billDots}><i /><i /><i /></span>
        </div>
      ))}
    </div>
  );
}

function ContentVisual() {
  return (
    <div className={styles.contentArt} aria-hidden="true">
      <div className={styles.documentBack}>
        <span className={styles.documentPin} />
        <span className={styles.glyph}>가</span>
        <span className={styles.documentLines}><i /><i /></span>
      </div>
      <div className={styles.documentFront}>
        <span className={styles.documentPin} />
        <span className={styles.glyph}>A</span>
        <span className={styles.documentLines}><i /><i /></span>
      </div>
    </div>
  );
}

export default function PricingNotes() {
  const t = useTranslations("Pricing.packages.notes");
  return (
    <div className={styles.notes}>
      {notes.map((id) => (
        <article key={id} className={styles.card} data-note={id}>
          <p className={styles.message}>
            {t.rich(`${id}.message`, { highlight: (text) => <strong>{text}</strong> })}
          </p>
          <div className={styles.artwork}>
            {id === "scope" ? <ScopeVisual /> : id === "costs" ? <CostsVisual /> : <ContentVisual />}
          </div>
        </article>
      ))}
    </div>
  );
}
