"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./website-comparison.module.css";

const versions = ["불편한 홈페이지", "잘 정리된 홈페이지"] as const;

export default function WebsiteComparison({ poor, improved }: { poor: ReactNode; improved: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") next = 1 - selected;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return <div className={styles.comparison} data-website-comparison>
    <div className={styles.tabs} role="tablist" aria-label="홈페이지 구성 비교">
      {versions.map((label, index) => <button key={label} type="button" role="tab"
        id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={selected === index}
        tabIndex={selected === index ? 0 : -1} ref={node => { tabs.current[index] = node; }}
        onClick={() => setSelected(index)} onKeyDown={onKeyDown}>
        {label}
      </button>)}
    </div>
    <div className={styles.browserBar} aria-hidden="true">
      <span className={styles.browserDots}><i /><i /><i /></span>
      <span>ondam.example</span>
      <span className={styles.browserEnd} />
    </div>
    {[poor, improved].map((content, index) => <div key={index} role="tabpanel"
      id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} tabIndex={0}
      hidden={selected !== index} className={styles.panel}>
      {content}
    </div>)}
    <p className={styles.caption}>같은 업체와 사진으로 구성한 가상 웹사이트 예시입니다.</p>
  </div>;
}
