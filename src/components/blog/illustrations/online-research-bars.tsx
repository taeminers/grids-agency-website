import "server-only";

import styles from "./online-research-bars.module.css";

const metrics = [
  { label: "검색 서비스", value: 98.7, country: "국내", source: "source-msit", reference: "1" },
  { label: "플레이스·지도", value: 96.8, country: "국내", source: "source-msit", reference: "1" },
  { label: "웹사이트 확인", value: 54, country: "미국", source: "source-brightlocal", reference: "2" },
] as const;

export default function OnlineResearchBars() {
  return <figure className={styles.figure} aria-label="검색·지도 이용률과 후기 이후 웹사이트 확인 응답률">
    <dl className={styles.metrics}>
      {metrics.map(metric => <div className={styles.stat} key={metric.label}>
        <dt className={styles.label}>{metric.label}</dt>
        <dd className={styles.definition}>
          <div className={styles.value}>{metric.value}<span>%</span></div>
          <div className={styles.track} aria-hidden="true"><span style={{ width: `${metric.value}%` }} /></div>
          <div className={styles.source}>
            <span>{metric.country}</span>
            <a href={`#${metric.source}`} aria-label={`${metric.country} 조사 · 참고 자료 ${metric.reference}`}>[{metric.reference}]</a>
          </div>
        </dd>
      </div>)}
    </dl>
    <figcaption className="sr-only">국내 검색·지도 이용 경험과 미국의 긍정적인 후기 이후 웹사이트 확인 응답률입니다. 서로 다른 조사이며 직접 비교하는 수치가 아닙니다.</figcaption>
  </figure>;
}
