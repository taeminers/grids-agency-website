"use client";

import { createContext, useCallback, useContext, useRef, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion, useInView, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { ArrowDown } from "reicon-react/icons/ArrowDown";
import { MetalButton } from "@/components/spectrumui/metal-button";
import { trackEvent } from "@/lib/analytics";
import { GrowthArrow, StoryLogo } from "./home-pricing-story-art";
import { WordsStagger } from "@/components/words-stagger";
import { BlurReveal } from "@/components/blur-reveal";
import { HighlightedText } from "@/components/highlighted-text";
import { GradientWaveText } from "@/components/gradient-wave-text";
import { ShimmerText } from "@/components/shimmer-text";
import HomePricingOpening from "./home-pricing-opening";
import HomePricingCables from "./home-pricing-cables";
import styles from "./home-pricing-story.module.css";

const staticQuery = "(prefers-reduced-motion: reduce), (max-height: 540px)";
function subscribeToStaticMode(callback: () => void) {
  const query = window.matchMedia(staticQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const readStaticMode = () => window.matchMedia(staticQuery).matches;
const serverStaticMode = () => false;
const stages = 3;
type CopyKey = "lead" | "headline" | "reflection" | "context" | "outcome" | "expertise" | "invitation";

function Copy({ name }: { name: CopyKey }) {
  const t = useTranslations("HomePricing");
  return t.rich(name, { strong: (chunks) => <strong>{chunks}</strong> });
}

const LineActive = createContext(false);

function splitStoryCopy(raw: string) {
  let emphasized = false;
  const lines: Array<{ text: string; highlights: boolean[] }> = [];
  for (const line of raw.split("\n")) {
    let text = "";
    const ranges: Array<[number, number]> = [];
    for (const token of line.match(/<strong>|<\/strong>|[^<>]+/g) ?? []) {
      if (token === "<strong>") emphasized = true;
      else if (token === "</strong>") emphasized = false;
      else {
        if (emphasized) ranges.push([text.length, text.length + token.length]);
        text += token;
      }
    }
    const highlights = Array.from(text.matchAll(/\S+/g), (match) =>
      ranges.some(([start, end]) => match.index < end && match.index + match[0].length > start));
    lines.push({ text, highlights });
  }
  return lines;
}

function AnimatedCopy({ name, variant = "words" }: { name: CopyKey; variant?: "words" | "blur" }) {
  const t = useTranslations("HomePricing");
  const active = useContext(LineActive);
  const raw = t.raw(name) as string;
  const plain = raw.replace(/<\/?strong>/g, "");
  const lines = splitStoryCopy(raw);
  return <>
    <span className="sr-only">{plain}</span>
    <span aria-hidden="true">
      {lines.map((line, index) => <span key={index} className={styles.copyLine}>
        {variant === "blur" ? <BlurReveal as="span" active={active} speedReveal={1.8} speedSegment={.65} delay={index * .16}
          className={`${styles.blurLine} ${line.highlights.some(Boolean) ? styles.emphasis : ""}`}>
          {line.text}
        </BlurReveal> : <WordsStagger autoStart={active} inView={name === "lead"} once={false} stagger={.055} speed={.65} delay={index * .16}
          className={styles.words} wordClassName={(_, word) => line.highlights[word] ? styles.emphasis : ""}>
          {line.text}
        </WordsStagger>}
      </span>)}
    </span>
  </>;
}

const waveColors = ["var(--story-accent)", "color-mix(in srgb, var(--story-accent) 70%, var(--foreground))", "var(--foreground)", "var(--story-accent)"];

function SceneCopy({ name, treatment = "plain" }: { name: CopyKey; treatment?: "plain" | "highlight" | "wave" }) {
  const t = useTranslations("HomePricing");
  const active = useContext(LineActive);
  return <motion.span className={styles.sceneCopy} data-text-treatment={treatment}
    initial={{ opacity: 0, y: 14 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 14 }}
    transition={{ duration: .6, ease: [.22, 1, .36, 1] }}>
    {t.rich(name, { strong: (chunks) => treatment === "highlight"
      ? <HighlightedText active={active} from="left" delay={.28} className={styles.highlightSweep}>{chunks}</HighlightedText>
      : treatment === "wave"
        ? <GradientWaveText key={active ? "playing" : "waiting"} as="span" align="left" paused={!active} speed={1.6} delay={.35} repeat={false} customColors={waveColors} bandCount={4} bandGap={12} bottomOffset={0} className={styles.wave}>{chunks}</GradientWaveText>
        : <strong className={styles.emphasis}>{chunks}</strong> })}
  </motion.span>;
}

function Reflection({ animated = false }: { animated?: boolean }) {
  const active = useContext(LineActive);
  const visible = !animated || active;
  return <p className={styles.reflection}>
    <span className={styles.underlinedReflection}>
      {animated ? <AnimatedCopy name="reflection" variant="blur" /> : <Copy name="reflection" />}
      <svg className={styles.reflectionUnderline} viewBox="0 0 400 12" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <motion.path d="M 2 6 C 110 10 265 2 398 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : false}
          animate={{ pathLength: visible ? 1 : 0 }}
          transition={{ duration: animated && visible ? .8 : 0, delay: animated && visible ? .55 : 0, ease: [.22, 1, .36, 1] }} />
      </svg>
    </span>
  </p>;
}

function PricingLink({ onFocus }: { onFocus?: () => void }) {
  const t = useTranslations("HomePricing");
  const locale = useLocale();
  return (
    <MetalButton asChild className="group min-h-14 gap-10 rounded-none px-6 text-base font-semibold tracking-tight" wrapperClassName="rounded-none">
      <Link href={`/${locale}/pricing`} onFocus={onFocus}
        onClick={() => trackEvent("cta_click", { cta_location: "home_pricing", cta_text: t("cta") })}>
        {t("cta")}<ArrowRight size={20} aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
      </Link>
    </MetalButton>
  );
}

function StoryPanel({ progress, index, children, className = "" }: { progress: MotionValue<number>; index: number; children: ReactNode; className?: string }) {
  const start = index / stages;
  const end = (index + 1) / stages;
  // The outgoing scene clears before the next arrives, keeping type crisp.
  const points = [start - .018, start + .012, end - .042, end - .018];
  const opacity = useTransform(progress, points, [index === 0 ? 1 : 0, 1, 1, index === stages - 1 ? 1 : 0]);
  const y = useTransform(progress, points, [index === 0 ? 0 : 32, 0, 0, index === stages - 1 ? 0 : -32]);
  const pointerEvents = useTransform(progress, (value) => index === stages - 1 && value >= .84 ? "auto" : "none");
  return <motion.div data-story-panel={index} className={`${styles.panel} ${className}`} style={{ opacity, y, pointerEvents }}>
    <div className={styles.content}>{children}</div>
  </motion.div>;
}

function StoryLine({ progress, scene, step, children, className }: {
  progress: MotionValue<number>; scene: number; step: number; children: ReactNode; className?: string;
}) {
  const threshold = scene / stages + (step === 0 ? -.018 : step * .035);
  const subscribe = useCallback((callback: () => void) => progress.on("change", callback), [progress]);
  const read = useCallback(() => progress.get() >= threshold, [progress, threshold]);
  const active = useSyncExternalStore(subscribe, read, serverStaticMode);
  return <LineActive.Provider value={active}>
    <div data-story-line={step} className={className} style={{ opacity: active ? 1 : 0, pointerEvents: active && scene === stages - 1 && step === 2 ? "auto" : "none" }}>{children}</div>
  </LineActive.Provider>;
}

function ScrollCue({ inline = false }: { inline?: boolean }) {
  const t = useTranslations("HomePricing");
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return <div ref={ref} data-story-scroll-cue data-active={visible && !inline}
    className={`${styles.scrollCue} ${inline ? styles.inlineCue : ""}`}>
    <ShimmerText paused={!visible || inline} duration={2.8} delay={1.2} className={styles.scrollCueText}>
      {t("continueScrolling")}
    </ShimmerText>
    <ArrowDown size={18} aria-hidden="true" className={styles.scrollCueArrow} />
  </div>;
}

function AnimatedPricingStory() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  const { scrollYProgress: exitProgress } = useScroll({ target: root, offset: ["end end", "end start"] });
  // The opening gets its own half-viewport of scroll; scene reading holds stay intact.
  const openingProgress = useTransform(scrollYProgress, [0, .025, .125], [0, 0, 1]);
  const storyProgress = useTransform(scrollYProgress, [0, .125, 1], [0, 0, 1]);
  const artProgress = useSpring(storyProgress, { stiffness: 110, damping: 28, mass: .3 });
  // After the last reading hold, let the next section rise into the same
  // background while the hero type and cables leave at different speeds.
  const exitY = useTransform(exitProgress, [0, 1], [0, -120]);
  const exitOpacity = useTransform(exitProgress, [0, .55], [1, 0]);
  const exitBlur = useTransform(exitProgress, [.05, .55], ["blur(0px)", "blur(8px)"]);
  const cablesExitY = useTransform(exitProgress, [0, 1], [0, -240]);
  const cablesExitOpacity = useTransform(exitProgress, [0, .75], [1, 0]);
  const revealFinalOnFocus = () => {
    const section = root.current;
    if (!section) return;
    const range = section.offsetHeight - window.innerHeight;
    const top = window.scrollY + section.getBoundingClientRect().top;
    if (scrollYProgress.get() < .9 || exitProgress.get() > 0) window.scrollTo({ top: top + Math.max(0, range) * .95, behavior: "instant" });
  };
  return <section ref={root} aria-labelledby="home-pricing-heading" data-pricing-story="animated" className={`${styles.story} relative h-[500svh]`}>
    <div ref={stage} className={styles.stage}>
      <motion.div className={styles.cablesExit} style={{ y: cablesExitY, opacity: cablesExitOpacity }}>
        <HomePricingCables progress={storyProgress} />
      </motion.div>
      <StoryPanel progress={storyProgress} index={0}>
        <StoryLine progress={storyProgress} scene={0} step={0}>
          <HomePricingOpening progress={openingProgress} stageRef={stage} settledClassName={styles.lead} />
        </StoryLine>
        <StoryLine progress={storyProgress} scene={0} step={1}>
          <h2 id="home-pricing-heading" className={styles.headline}><AnimatedCopy name="headline" variant="blur" /></h2>
        </StoryLine>
        <StoryLine progress={storyProgress} scene={0} step={2}>
          <Reflection animated />
        </StoryLine>
      </StoryPanel>
      <StoryPanel progress={storyProgress} index={1}>
        <GrowthArrow progress={artProgress} />
        <StoryLine progress={storyProgress} scene={1} step={0}>
          <p className={styles.lead}><SceneCopy name="context" /></p>
        </StoryLine>
        <StoryLine progress={storyProgress} scene={1} step={1}>
          <p className={styles.headline}><SceneCopy name="outcome" treatment="highlight" /></p>
        </StoryLine>
      </StoryPanel>
      <StoryPanel progress={storyProgress} index={2} className={styles.finalPanel}>
        <motion.div data-story-exit className={styles.finalLayout} style={{ y: exitY, opacity: exitOpacity, filter: exitBlur }}>
          <StoryLine progress={storyProgress} scene={2} step={0}>
            <p className={`${styles.headline} ${styles.finalHeadline}`}><SceneCopy name="expertise" treatment="wave" /></p>
          </StoryLine>
          <div className={styles.finalDetails}>
            <div className={styles.team}>
              <StoryLogo progress={artProgress} />
              <StoryLine progress={storyProgress} scene={2} step={1}>
                <p className={styles.invitation}><SceneCopy name="invitation" /></p>
              </StoryLine>
            </div>
            <StoryLine progress={storyProgress} scene={2} step={2} className={styles.finalCta}>
              <PricingLink onFocus={revealFinalOnFocus} />
            </StoryLine>
          </div>
        </motion.div>
      </StoryPanel>
      <ScrollCue />
    </div>
  </section>;
}

function StaticPricingStory() {
  return <section aria-labelledby="home-pricing-heading" data-pricing-story="static" className={`${styles.story} ${styles.static}`}>
    <div className={styles.staticScene}>
      <p className={styles.lead}><Copy name="lead" /></p>
      <h2 id="home-pricing-heading" className={styles.headline}><Copy name="headline" /></h2>
      <Reflection />
      <ScrollCue inline />
    </div>
    <div className={styles.staticScene}>
      <GrowthArrow />
      <p className={styles.lead}><Copy name="context" /></p>
      <p className={styles.headline}><Copy name="outcome" /></p>
      <ScrollCue inline />
    </div>
    <div className={`${styles.staticScene} ${styles.finalLayout}`}>
      <p className={`${styles.headline} ${styles.finalHeadline}`}><Copy name="expertise" /></p>
      <div className={styles.finalDetails}>
        <div className={styles.team}>
          <StoryLogo />
          <p className={styles.invitation}><Copy name="invitation" /></p>
        </div>
        <div className={styles.finalCta}><PricingLink /></div>
      </div>
      <ScrollCue inline />
    </div>
  </section>;
}

export default function HomePricingSection() {
  const staticMode = useSyncExternalStore(subscribeToStaticMode, readStaticMode, serverStaticMode);
  return staticMode ? <StaticPricingStory /> : <AnimatedPricingStory />;
}
