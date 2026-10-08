"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Check, Copy, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import ProjectQuestionnaire from "./project-questionnaire";
import { MetalButton } from "@/components/spectrumui/metal-button";
import InteractiveDroplets from "@/components/originkit/ui/interactive-droplets";
import { useScrollReveals } from "@/hooks/use-scroll-reveals";
import { trackEvent } from "@/lib/analytics";

const LightRays = dynamic(() => import("@/components/light-rays"), { ssr: false });
const successRayColors = {
  light: { mode: "multi", color1: "#277db8", color2: "#62b0ed" },
  dark: { mode: "multi", color1: "#b6d8f2", color2: "#d8efff" },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;
const actionStyle = {
  className:
    "h-12 w-full cursor-pointer justify-between gap-6 rounded-none px-5 text-xs sm:min-w-44",
  wrapperClassName: "w-full rounded-none",
} as const;

export default function ConnectExperience() {
  const t = useTranslations("Connect");
  const reduced = useReducedMotion();
  const [projectOpen, setProjectOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const lightMode = resolvedTheme === "light";
  const [showSuccessRays, setShowSuccessRays] = useState(false);
  const [returning, setReturning] = useState(false);
  const page = useRef<HTMLElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 35, damping: 22 });
  const y = useSpring(pointerY, { stiffness: 35, damping: 22 });
  useScrollReveals(page);
  useEffect(
    () => () => {
      if (reset.current) clearTimeout(reset.current);
    },
    [],
  );

  const copyEmail = async () => {
    trackEvent("cta_click", {
      cta_location: "connect",
      cta_text: t("Experience.copy"),
    });
    try {
      await navigator.clipboard.writeText(t("Cards.emailValue"));
      setCopied(true);
      setCopyFailed(false);
      if (reset.current) clearTimeout(reset.current);
      reset.current = setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopyFailed(true);
    }
  };
  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 12, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: {
      duration: reduced ? 0 : 1.1,
      delay: reduced ? 0 : delay,
      ease,
    },
  });

  return (
    <main ref={page} className="relative isolate overflow-hidden bg-background pt-28 text-foreground md:pt-[72px]">
      {(showSuccessRays || returning) && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: returning ? 0 : lightMode ? 0.9 : 0.7 }}
          transition={{ duration: reduced ? 0 : returning ? 0.65 : 1.4, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (returning) { setReturning(false); setProjectOpen(false); }
          }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(90svh,1000px)] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_35%,transparent_100%)]"
        >
          <LightRays backgroundColor="transparent" intensity={lightMode ? 32 : 18} rays={36} reach={22} animation={{ animate: !reduced, speed: 3 }} raysColor={successRayColors[lightMode ? "light" : "dark"]} style={{ zIndex: 0 }} />
        </motion.div>
      )}
      <section
        aria-labelledby={projectOpen ? "question-title" : "connect-title"}
        className="relative mx-[clamp(20px,4.2vw,72px)] flex min-h-[calc(100svh-112px)] flex-col md:min-h-[calc(100svh-72px)]"
        onPointerMove={(event) => {
          if (reduced || event.pointerType !== "mouse") return;
          const box = event.currentTarget.getBoundingClientRect();
          pointerX.set((event.clientX - box.left - box.width / 2) * 0.025);
          pointerY.set((event.clientY - box.top - box.height / 2) * 0.025);
        }}
        onPointerLeave={() => {
          pointerX.set(0);
          pointerY.set(0);
        }}
      >
        <span
          aria-hidden="true"
          data-scroll-reveal="line-y"
          className="pointer-events-none absolute inset-0 z-20 border-x border-foreground/12"
        />
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 2 }}
          className="pointer-events-none absolute -inset-x-[clamp(20px,4.2vw,72px)] inset-y-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
        >
          <motion.div style={{ x, y }} className="absolute inset-0">
            <div
              data-scroll-reveal="fade"
              data-reveal-delay="100"
              className="absolute left-1/2 top-1/2 aspect-square w-[min(88vw,1000px)] -translate-1/2 rounded-full border border-dashed border-foreground/15"
            />
            <div
              data-scroll-reveal="fade"
              data-reveal-delay="180"
              className="absolute left-1/2 top-1/2 aspect-square w-[min(96vw,1090px)] -translate-1/2 rounded-full border border-foreground/[0.035]"
            />
            <motion.div
              animate={
                reduced ? {} : { scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }
              }
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-[10%] top-[46%] h-[70%] bg-[radial-gradient(ellipse_at_32%_65%,#62b0ed40,transparent_48%),radial-gradient(ellipse_at_72%_65%,#8bcff030,transparent_48%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_32%_65%,#a6dcf530,transparent_48%),radial-gradient(ellipse_at_72%_65%,#789ebd28,transparent_48%)]"
            />
            <svg
              viewBox="0 0 1440 600"
              preserveAspectRatio="xMidYMax slice"
              className="absolute inset-x-0 bottom-0 h-[50%] w-full text-foreground/[0.09]"
            >
              {Array.from({ length: 14 }, (_, i) => (
                <motion.path
                  key={i}
                  d={`M -100 ${230 + i * 21} C 190 ${30 + i * 15}, 330 ${530 + i * 5}, 720 ${410 + i * 13} S 1150 ${90 + i * 18}, 1540 ${270 + i * 21}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: reduced ? 0 : 2.8,
                    delay: reduced ? 0 : i * 0.035,
                    ease,
                  }}
                />
              ))}
            </svg>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {projectOpen ? (
            <motion.div
              key="questionnaire"
              className="relative z-10 flex flex-1"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: reduced ? 0 : 0.4 }}
            >
              <ProjectQuestionnaire
                onSuccess={() => setShowSuccessRays(true)}
                onClose={() => {
                  if (showSuccessRays) { setReturning(true); setShowSuccessRays(false); }
                  else setProjectOpen(false);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: reduced ? 0 : 0.4 }}
              onAnimationComplete={() =>
                startButton.current?.focus({ preventScroll: true })
              }
              className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-16 pb-24 text-center sm:px-8 md:px-10 md:py-28"
            >
              <motion.div
                {...reveal(0.4)}
                aria-hidden="true"
                className="relative mb-6 flex size-40 shrink-0 items-center justify-center sm:mb-8 sm:size-52 md:size-60"
              >
                <div className="pointer-events-none absolute inset-[18%] rounded-full bg-tertiary/10 blur-3xl" />
                <InteractiveDroplets
                  style={{ minWidth: 0, minHeight: 0 }}
                  rest={{ x: 50, y: 50, size: 12 }}
                  sizePercent={125}
                  dropSize={7}
                  lag={7}
                  idle={{ speed: 5, spread: 8 }}
                  idleOn={!reduced}
                  shimmer={reduced ? 0 : 12}
                />
              </motion.div>
              <motion.h1
                id="connect-title"
                {...reveal(0.58)}
                className="max-w-3xl text-[clamp(28px,3.4vw,52px)] leading-[1.2] font-medium tracking-[-0.055em] text-balance"
              >
                {t("Experience.title")}
              </motion.h1>
              <div className="mt-9 grid w-full max-w-xs gap-3 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:justify-center">
                <motion.div {...reveal(0.88)}>
                  <MetalButton {...actionStyle} asChild>
                    <button
                      ref={startButton}
                      type="button"
                      onClick={() => {
                        trackEvent("cta_click", {
                          cta_location: "connect",
                          cta_text: t("Experience.project"),
                        });
                        setProjectOpen(true);
                      }}
                    >
                      {t("Experience.project")}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                  </MetalButton>
                </motion.div>
                <motion.div {...reveal(1)}>
                  <MetalButton {...actionStyle} asChild>
                    <a
                      href="https://pf.kakao.com/_FGQrX"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent("cta_click", {
                          cta_location: "connect",
                          cta_text: t("Experience.chat"),
                        })
                      }
                    >
                      {t("Experience.chat")}
                      <MessageCircle size={15} aria-hidden="true" />
                    </a>
                  </MetalButton>
                </motion.div>
                <motion.div {...reveal(1.12)}>
                  <MetalButton {...actionStyle} onClick={copyEmail}>
                    {t(copied ? "Experience.copied" : "Experience.copy")}
                    {copied ? (
                      <Check size={15} aria-hidden="true" />
                    ) : (
                      <Copy size={15} aria-hidden="true" />
                    )}
                  </MetalButton>
                </motion.div>
              </div>
              <div
                role="status"
                aria-live="polite"
                className="mt-4 min-h-6 text-xs text-foreground/60"
              >
                <AnimatePresence initial={false}>
                  {copied && (
                    <motion.p
                      key="copied-email"
                      initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(4px)" }}
                      transition={{ duration: reduced ? 0 : 0.4, ease: "easeInOut" }}
                    >
                      {t("Cards.emailValue")}
                    </motion.p>
                  )}
                </AnimatePresence>
                {copyFailed && (
                  <a
                    href={`mailto:${t("Cards.emailValue")}`}
                    onClick={() =>
                      trackEvent("cta_click", {
                        cta_location: "connect",
                        cta_text: `${t("Experience.copyFallback")} ${t("Cards.emailValue")}`,
                      })
                    }
                    className="underline underline-offset-4"
                  >
                    {t("Experience.copyFallback")} {t("Cards.emailValue")}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
