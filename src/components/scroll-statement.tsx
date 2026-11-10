"use client";

import { Fragment, useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import StudioIntroduction from "./studio-introduction";
import styles from "./scroll-statement.module.css";

// Leave a dedicated drawing phase and a short completed hold before releasing sticky.
const TEXT_FILL_END = 0.64;

function ExpertBadge({ progress, start, end, index, children }: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  index: number;
  children: ReactNode;
}) {
  const span = end - start;
  const reveal = useTransform(progress, [start + span * index * 0.16, start + span * (index * 0.16 + 0.52)], [0, 1]);
  const eased = useTransform(reveal, value => value * value * (3 - 2 * value));
  const y = useTransform(eased, [0, 1], [10, 0]);
  const scale = useTransform(eased, [0, 1], [0.88, 1]);

  return (
    <motion.span className={styles.organization} style={{ opacity: eased, y, scale }}>
      {children}
    </motion.span>
  );
}

function ExpertLogos({ progress, start, end }: {
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const timing = { progress, start, end };
  return (
    <span className={styles.expertLogos} aria-hidden="true">
      <ExpertBadge {...timing} index={0}>
        <span className={styles.snuMark}>
          <Image src="/images/organizations/snu.png" alt="" width={542} height={240} />
        </span>
      </ExpertBadge>
      <ExpertBadge {...timing} index={1}><Image src="/images/organizations/samsung.svg" alt="" width={30} height={30} /></ExpertBadge>
      <ExpertBadge {...timing} index={2}><Image src="/images/organizations/lg.svg" alt="" width={24} height={24} /></ExpertBadge>
    </span>
  );
}

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
  const expertIndex = words.findIndex(word => word.startsWith("GRIDS"));

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
              if (expertIndex >= 0 && index === expertIndex + 1) return null;
              const before = lengths.slice(0, index).reduce((sum, length) => sum + length, 0);
              const start = before / total * TEXT_FILL_END;
              const end = (before + lengths[index]) / total * TEXT_FILL_END;
              const phraseEnd = (before + lengths[index] + (lengths[index + 1] ?? 0)) / total * TEXT_FILL_END;
              return (
                <Fragment key={`${index}-${word}`}>
                  {index > 0 && (separators[index - 1]?.includes("\n") ? <br /> : " ")}
                  {index === expertIndex ? (
                    <span className={styles.expertPhrase}>
                      <span className={styles.expertWord}>
                        <ExpertLogos progress={scrollYProgress} start={start} end={phraseEnd} />
                        <FilledWord word={word} progress={scrollYProgress} start={start} end={end} />
                        {words[index + 1] && <> <FilledWord word={words[index + 1]} progress={scrollYProgress} start={end} end={phraseEnd} /></>}
                      </span>
                    </span>
                  ) : <FilledWord word={word} progress={scrollYProgress} start={start} end={end} />}
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
