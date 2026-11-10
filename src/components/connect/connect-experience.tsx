"use client";

import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import ProjectQuestionnaire from "./project-questionnaire";
import styles from "./connect-experience.module.css";
import ConsultationLink, { ConsultationAction } from "@/components/consultation-link";
import buttonStyles from "@/components/consultation-button.module.css";
import InteractiveDroplets from "@/components/originkit/ui/interactive-droplets";
import { trackEvent } from "@/lib/analytics";

const LightRays = dynamic(() => import("@/components/light-rays"), { ssr: false });
const successRayColors = {
  light: { mode: "multi", color1: "#277db8", color2: "#62b0ed" },
  dark: { mode: "multi", color1: "#b6d8f2", color2: "#d8efff" },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function ConnectExperience() {
  const t = useTranslations("Connect");
  const reduced = useReducedMotion();
  const [projectOpen, setProjectOpen] = useState(false);
  const [questionnaireMounted, setQuestionnaireMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const lightMode = resolvedTheme === "light";
  const [showSuccessRays, setShowSuccessRays] = useState(false);
  const [returning, setReturning] = useState(false);
  const restoreFocus = useRef(false);
  const startButton = useRef<HTMLButtonElement>(null);
  const closeProject = () => {
    setProjectOpen(false);
    if (reduced) {
      setQuestionnaireMounted(false);
      restoreFocus.current = false;
      requestAnimationFrame(() => startButton.current?.focus({ preventScroll: true }));
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
    <main className="relative isolate overflow-hidden bg-background pt-28 text-foreground md:pt-[72px]">
      {(showSuccessRays || returning) && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: returning ? 0 : lightMode ? 0.9 : 0.7 }}
          transition={{ duration: reduced ? 0 : returning ? 0.65 : 1.4, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (returning) { setReturning(false); closeProject(); }
          }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(90svh,1000px)] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_35%,transparent_100%)]"
        >
          <LightRays backgroundColor="transparent" intensity={lightMode ? 32 : 18} rays={36} reach={22} animation={{ animate: !reduced, speed: 3 }} raysColor={successRayColors[lightMode ? "light" : "dark"]} style={{ zIndex: 0 }} />
        </motion.div>
      )}
      <section
        aria-labelledby={projectOpen ? "question-title" : "connect-title"}
        className="relative mx-[clamp(20px,4.2vw,72px)] grid min-h-[calc(100svh-112px)] md:min-h-[calc(100svh-72px)]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[clamp(20px,4.2vw,72px)] inset-y-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_62%,#62b0ed12,transparent_85%)]" />

        <div
          className={`${styles.stage} relative z-10 flex min-w-0`}
          data-active={projectOpen}
          inert={!projectOpen}
          aria-hidden={!projectOpen}
          onTransitionEnd={event => {
            if (event.target === event.currentTarget && event.propertyName === "opacity" && !projectOpen) setQuestionnaireMounted(false);
          }}
        >
          {questionnaireMounted && <ProjectQuestionnaire
                onSuccess={() => setShowSuccessRays(true)}
                onClose={() => {
                  restoreFocus.current = true;
                  if (showSuccessRays) { setReturning(true); setShowSuccessRays(false); }
                  else closeProject();
                }}
              />}
        </div>
        <div
          className={`${styles.stage} relative z-10 flex min-w-0 flex-col items-center justify-center px-5 pt-16 pb-24 text-center sm:px-8 md:px-10 md:py-28`}
          data-active={!projectOpen}
          inert={projectOpen}
          aria-hidden={projectOpen}
          onTransitionEnd={event => {
            if (event.target === event.currentTarget && event.propertyName === "opacity" && !projectOpen && restoreFocus.current) {
              restoreFocus.current = false;
              startButton.current?.focus({ preventScroll: true });
            }
          }}
        >
              <motion.div
                {...reveal(0.4)}
                aria-hidden="true"
                className="relative mb-6 flex size-40 shrink-0 items-center justify-center sm:mb-8 sm:size-52 md:size-60"
              >
                <div className="pointer-events-none absolute inset-[18%] rounded-full bg-tertiary/10 blur-3xl" />
                <InteractiveDroplets
                  paused={projectOpen}
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
              <div className="mt-9 grid w-full max-w-xs gap-3 sm:flex sm:w-auto sm:max-w-none sm:justify-center">
                <motion.div {...reveal(0.88)}>
                  <ConsultationAction
                    ref={startButton}
                    className="w-full cursor-pointer sm:min-w-44"
                    label={t("Experience.project")}
                    onClick={() => {
                      trackEvent("cta_click", { cta_location: "connect", cta_text: t("Experience.project") });
                      setQuestionnaireMounted(true);
                      setProjectOpen(true);
                    }}
                  />
                </motion.div>
                <motion.div {...reveal(1)}>
                  <ConsultationLink
                    className="w-full sm:min-w-44"
                    href="https://pf.kakao.com/_FGQrX"
                    target="_blank"
                    rel="noopener noreferrer"
                    label={t("Experience.chat")}
                    icon={<span className={buttonStyles.kakaoLogo} />}
                    onClick={() => trackEvent("cta_click", { cta_location: "connect", cta_text: t("Experience.chat") })}
                  />
                </motion.div>
              </div>
        </div>
      </section>
    </main>
  );
}
