"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { motion, useTransform, type MotionValue } from "framer-motion";
import styles from "./home-pricing-opening.module.css";

type OpeningWord = { text: string; emphasized: boolean };
type WordPosition = { startX: number; startY: number; endX: number; endY: number; scaleX: number; scaleY: number };
type OpeningLayout = { source: string; words: WordPosition[]; typography: CSSProperties };

function getWords(raw: string): OpeningWord[] {
  let emphasized = false;
  let text = "";
  const emphasisRanges: Array<[number, number]> = [];
  for (const token of raw.match(/<strong>|<\/strong>|[^<>]+/g) ?? []) {
    if (token === "<strong>") emphasized = true;
    else if (token === "</strong>") emphasized = false;
    else {
      if (emphasized) emphasisRanges.push([text.length, text.length + token.length]);
      text += token;
    }
  }
  return Array.from(text.matchAll(/\S+/g), (match) => ({
    text: match[0],
    emphasized: emphasisRanges.some(([start, end]) => match.index < end && match.index + match[0].length > start),
  }));
}

function MeasurementWords({ words }: { words: OpeningWord[] }) {
  return words.map((word, index) => <span key={index}>
    <span data-opening-measure-word className={`${styles.word} ${word.emphasized ? styles.emphasized : ""}`}>{word.text}</span>
    {index < words.length - 1 ? " " : null}
  </span>);
}

function MovingWord({ word, position, typography, progress }: {
  word: OpeningWord; position: WordPosition; typography: CSSProperties; progress: MotionValue<number>;
}) {
  // Resolve the word widths first, then bring wrapped lines together so
  // mobile text stays legible while it settles into the smaller sentence.
  const x = useTransform(progress, [0, .6], [position.startX, position.endX]);
  const y = useTransform(progress, [.2, 1], [position.startY, position.endY]);
  const scaleX = useTransform(progress, [0, .6], [position.scaleX, 1]);
  const scaleY = useTransform(progress, [0, .6], [position.scaleY, 1]);
  return <motion.span data-opening-word className={styles.movingWord}
    style={{ ...typography, fontWeight: word.emphasized ? 500 : typography.fontWeight, color: word.emphasized ? "var(--foreground)" : "var(--muted-foreground)", x, y, scaleX, scaleY }}>
    {word.text}
  </motion.span>;
}

export default function HomePricingOpening({ progress, settledClassName, stageRef }: {
  progress: MotionValue<number>;
  settledClassName: string;
  stageRef: RefObject<HTMLDivElement | null>;
}) {
  const t = useTranslations("HomePricing");
  const raw = t.raw("lead") as string;
  const words = useMemo(() => getWords(raw), [raw]);
  const rootRef = useRef<HTMLDivElement>(null);
  const settledRef = useRef<HTMLParagraphElement>(null);
  const largeRef = useRef<HTMLParagraphElement>(null);
  const [layout, setLayout] = useState<OpeningLayout | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const settled = settledRef.current;
    const large = largeRef.current;
    const stage = stageRef.current;
    if (!root || !settled || !large || !stage) return;
    let alive = true;
    let frame = 0;

    const measure = () => {
      if (!alive) return;
      const rootBox = root.getBoundingClientRect();
      const largeBox = large.getBoundingClientRect();
      const settledWords = settled.querySelectorAll<HTMLElement>("[data-opening-measure-word]");
      const largeWords = large.querySelectorAll<HTMLElement>("[data-opening-measure-word]");
      if (settledWords.length !== words.length || largeWords.length !== words.length) return;
      const smallStyle = getComputedStyle(settled);
      const largeStyle = getComputedStyle(large);
      const scale = parseFloat(largeStyle.fontSize) / parseFloat(smallStyle.fontSize);
      // Layout offsets exclude the outgoing panel's transform, including when
      // a resize or font load is measured while another scene is visible.
      let layoutLeft = 0;
      let layoutTop = 0;
      let ancestor: HTMLElement | null = root;
      while (ancestor && ancestor !== stage) {
        layoutLeft += ancestor.offsetLeft;
        layoutTop += ancestor.offsetTop;
        ancestor = ancestor.offsetParent as HTMLElement | null;
      }
      const centeredLeft = (stage.clientWidth - largeBox.width) / 2 - layoutLeft;
      const centeredTop = (stage.clientHeight - largeBox.height) / 2 - layoutTop;
      setLayout({
        source: raw,
        typography: {
          fontFamily: smallStyle.fontFamily,
          fontSize: smallStyle.fontSize,
          fontWeight: smallStyle.fontWeight,
          letterSpacing: smallStyle.letterSpacing,
        },
        words: words.map((_, index) => {
          const start = largeWords[index].getBoundingClientRect();
          const end = settledWords[index].getBoundingClientRect();
          return {
            startX: centeredLeft + start.left - largeBox.left,
            startY: centeredTop + start.top - largeBox.top,
            endX: end.left - rootBox.left,
            endY: end.top - rootBox.top,
            scaleX: end.width > 0 ? start.width / end.width : scale,
            scaleY: scale,
          };
        }),
      });
    };
    const schedule = () => {
      if (!alive) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    observer.observe(settled);
    observer.observe(large);
    measure();
    document.fonts.ready.then(schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [stageRef, words, raw]);

  const currentLayout = layout?.source === raw ? layout : null;
  return <div ref={rootRef} data-opening-lead data-opening-ready={Boolean(currentLayout)} className={styles.opening}>
    <p className="sr-only">{t.rich("lead", { strong: (chunks) => <strong>{chunks}</strong> })}</p>
    <p ref={settledRef} className={`${settledClassName} ${styles.measurement}`} aria-hidden="true"><MeasurementWords words={words} /></p>
    <p ref={largeRef} className={`${styles.largeMeasurement} ${styles.measurement}`} aria-hidden="true"><MeasurementWords words={words} /></p>
    <div aria-hidden="true" className={styles.visual}>
      {currentLayout?.words.map((position, index) => <MovingWord key={index} word={words[index]} position={position} typography={currentLayout.typography} progress={progress} />)}
    </div>
  </div>;
}
