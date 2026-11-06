"use client";

import { Fragment, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import StudioIntroduction from "./studio-introduction";
import styles from "./scroll-statement.module.css";

// Leave a dedicated drawing phase and a short completed hold before releasing sticky.
const TEXT_FILL_END = 0.64;

function FilledWord({ word, progress, start, end }: {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const clipPath = useTransform(progress, [start, end], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);

  return (
    <span className={styles.word}>
      {word}
      <motion.span className={styles.fill} style={{ clipPath }}>{word}</motion.span>
    </span>
  );
}

export default function ScrollStatement({ text, locale }: { text: string; locale: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const words = text.trim().split(/\s+/u);
  const separators = text.trim().match(/\s+/gu) ?? [];
  const lengths = words.map((word) => Array.from(word).length);
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.dataset.enhanced = "true";
    return () => { delete section.dataset.enhanced; };
  }, []);

  return (
    <section id="home-statement" lang={locale}
      aria-labelledby="home-statement-heading" className={styles.section}>
      <div ref={sectionRef} className={styles.readingTrack}>
      <div className={styles.stage}>
        <h2 id="home-statement-heading" className={styles.statement} aria-label={text}>
          <span aria-hidden="true">
            {words.map((word, index) => {
              const before = lengths.slice(0, index).reduce((sum, length) => sum + length, 0);
              return (
                <Fragment key={`${index}-${word}`}>
                  {index > 0 && (separators[index - 1]?.includes("\n") ? <br /> : " ")}
                  <FilledWord word={word} progress={scrollYProgress}
                    start={before / total * TEXT_FILL_END} end={(before + lengths[index]) / total * TEXT_FILL_END} />
                </Fragment>
              );
            })}
          </span>
        </h2>
        <StudioIntroduction progress={scrollYProgress} revealAt={TEXT_FILL_END} />
      </div>
      </div>
    </section>
  );
}
