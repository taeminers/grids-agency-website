"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import styles from "./home-process.module.css";

const ProcessBlob = dynamic(() => import("./process-blob-scene"), { ssr: false });
const teams = ["planning", "design", "development"] as const;

class BlobBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function TeamLabel({ name, cost, placeholder, index, progress }: {
  name: string; cost: string; placeholder: string; index: number; progress: MotionValue<number>;
}) {
  const start = 0.16 + index * 0.2;
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  const y = useTransform(progress, [start, start + 0.14], [32, 0]);
  return (
    <li className={styles.teamSlot} data-team={index}>
      <motion.div className={styles.teamLabel} style={{ opacity, y }}>
        <p className={styles.costLabel}>{cost}</p>
        <p className={styles.cost}><span aria-hidden="true">₩ —</span><span className="sr-only">{placeholder}</span></p>
        <h3>{name}</h3>
        <span className={styles.stem} aria-hidden="true" />
      </motion.div>
    </li>
  );
}

export default function HomeProcess() {
  const t = useTranslations("HomeProcess");
  const sectionRef = useRef<HTMLElement>(null);
  const near = useInView(sectionRef, { margin: "400px 0px", once: true });
  const reduced = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const fallbackScale = useTransform(scrollYProgress, [0, 0.72], [0.36, 1]);
  const durationOpacity = useTransform(scrollYProgress, [0.72, 0.88], [0, 1]);
  const durationY = useTransform(scrollYProgress, [0.72, 0.88], [20, 0]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.dataset.enhanced = "true";
    return () => { delete section.dataset.enhanced; };
  }, []);

  return (
    <section ref={sectionRef} id="our-process" className={styles.section} aria-labelledby="process-heading">
      <div className={styles.stage}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id="process-heading">{t("heading")}<br /><span>{t("headingSecondary")}</span></h2>
        </header>

        <div className={styles.arena}>
          <div className={styles.shadow} aria-hidden="true" />
          <div className={styles.fallbackWrap} data-ready={ready} aria-hidden="true">
            <motion.div className={styles.fallbackBlob} style={{ scale: fallbackScale }} />
          </div>
          {near && !failed && !reduced && (
            <div className={styles.canvas} aria-hidden="true">
              <BlobBoundary onUnavailable={onUnavailable}>
                <ProcessBlob progress={scrollYProgress} onReady={onReady} onUnavailable={onUnavailable} />
              </BlobBoundary>
            </div>
          )}
          <ol className={styles.teams}>
            {teams.map((team, index) => (
              <TeamLabel key={team} name={t(`teams.${team}.name`)} cost={t(`teams.${team}.cost`)}
                placeholder={t("costPlaceholder")} index={index} progress={scrollYProgress} />
            ))}
          </ol>
        </div>

        <footer className={styles.footer}>
          <p className={styles.context}>{t("context")}</p>
          <motion.div className={styles.duration} style={{ opacity: durationOpacity, y: durationY }}>
            <p>{t("durationLabel")}</p>
            <strong>{t("duration")}</strong>
            <span>{t("durationNote")}</span>
          </motion.div>
        </footer>
        <div className={styles.progressTrack} aria-hidden="true">
          <motion.div style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
