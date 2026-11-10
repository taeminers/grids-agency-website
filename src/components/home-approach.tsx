"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import BrandLogo from "./brand-logo";
import ApproachCostReply from "./approach-cost-reply";
import ApproachCostPreview from "./approach-cost-preview";
import ApproachSpeedPreview from "./approach-speed-preview";
import ApproachQualityPreview from "./approach-quality-preview";
import styles from "./home-approach.module.css";

const topics = ["cost", "speed", "quality"] as const;

export default function HomeApproach() {
  const t = useTranslations("HomeApproach");
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const topic = topics[selected];

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let next = selected;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (selected + 1) % topics.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (selected + topics.length - 1) % topics.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = topics.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <section id="our-approach" className={styles.section} aria-label={t("label")}>
      <div className={styles.layout}>
        <div className={styles.tabs} role="tablist" aria-label={t("label")} aria-orientation="vertical">
          {topics.map((item, index) => (
            <button key={item} ref={node => { tabs.current[index] = node; }}
              type="button" role="tab" id={`approach-tab-${item}`}
              aria-selected={selected === index} aria-controls={`approach-panel-${item}`}
              tabIndex={selected === index ? 0 : -1} className={styles.tab}
              onClick={() => setSelected(index)} onKeyDown={onTabKeyDown}>
              {t(`${item}.tab`)}
            </button>
          ))}
        </div>

        {topics.map((item, index) => (
          <div key={item} id={`approach-panel-${item}`} role="tabpanel"
            aria-labelledby={`approach-tab-${item}`} hidden={selected !== index}
            className={styles.panel}>
            {selected === index && <>
              <header className={styles.header}>
                <h2>{t(`${topic}.title`)}<span>{t(`${topic}.subtitle`)}</span></h2>
              </header>
              {item === "cost" ? <ApproachCostReply /> : <aside className={styles.note}>
                <div className={styles.brand}><BrandLogo className={styles.logo} /><span>GRIDS</span></div>
                <p>{t(`${topic}.description`)}</p>
                <span className={styles.noteCaption}>{t(`${topic}.principle`)}</span>
              </aside>}
              {item !== "quality" ? (
                <div className={`${styles.visual} ${styles.previewVisual} ${item === "speed" ? styles.speedVisual : styles.costVisual}`}>
                  {item === "cost" ? <ApproachCostPreview /> : <ApproachSpeedPreview />}
                </div>
              ) : <div className={`${styles.visual} ${styles.qualityVisual}`}><ApproachQualityPreview /></div>}
            </>}
          </div>
        ))}
      </div>
    </section>
  );
}
