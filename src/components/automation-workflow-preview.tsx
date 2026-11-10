"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { useTranslations } from "next-intl";
import FallbackAvatar from "./fallback-avatar";

const branches = [
  { key: "naver", x: 30, y: 18, path: "M144 132H134Q123 132 123 121V65Q123 54 112 54H102", icon: "naver.svg" },
  { key: "gmail", x: 258, y: 18, path: "M216 132H226Q237 132 237 121V65Q237 54 248 54H258", icon: "gmail.svg" },
  { key: "drive", x: 30, y: 174, path: "M144 132H134Q123 132 123 143V199Q123 210 112 210H102", icon: "google-drive.svg" },
  { key: "kakao", x: 258, y: 174, path: "M216 132H226Q237 132 237 143V199Q237 210 248 210H258", icon: "kakao.svg" },
] as const;

export default function AutomationWorkflowPreview() {
  const id = useId();
  const t = useTranslations("Possibilities.automation.flow");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bounds = element.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
    let visible = bounds.height > 0 && visibleHeight / bounds.height >= 0.5;
    let sequence: gsap.core.Timeline;
    const context = gsap.context(() => {
      sequence = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });
      sequence
        .set("[data-flow-mask]", { attr: { "stroke-dashoffset": 100 } })
        .set("[data-flow-node]", { autoAlpha: 0.65, filter: "grayscale(1) blur(1.25px)" })
        .set("[data-flow-connections]", { opacity: 1 })
        .to("[data-flow-mask]", { attr: { "stroke-dashoffset": 0 }, duration: 2.4, ease: "power1.inOut" }, 1.2)
        .to("[data-flow-node]", { autoAlpha: 1, filter: "grayscale(0) blur(0px)", duration: 2.4, ease: "power1.inOut" }, 1.2)
        .to("[data-flow-connections]", { opacity: 0, duration: 0.7 }, 7)
        .to("[data-flow-node]", { autoAlpha: 0.65, filter: "grayscale(1) blur(1.25px)", duration: 0.7 }, 7);
      sequence.timeScale((sequence.duration() + sequence.repeatDelay()) / 2);
      // Extend only the completed-frame hold by one real-time second.
      sequence.shiftChildren(sequence.timeScale(), false, 7);
      sequence.pause(0);
    }, element);

    const syncPlayback = () => {
      if (media.matches) sequence.pause(6);
      else if (visible && !document.hidden) sequence.play();
      else sequence.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      syncPlayback();
    }, { threshold: 0.5 });
    observer.observe(element);
    media.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      context.revert();
    };
  }, []);

  return (
    <div ref={root} data-workflow-preview role="img" aria-label={t("previewLabel")} className="flex h-full items-center justify-center text-foreground">
      <svg aria-hidden="true" viewBox="0 0 360 264" className="h-full max-h-[280px] w-full max-w-[440px] overflow-visible">
        <defs>
          {branches.map(({ path }, index) => (
            <mask key={index} id={`${id}-branch-${index}`} maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="264">
              <path data-flow-mask={index} d={path} pathLength="100" fill="none" stroke="white" strokeWidth="6" strokeDasharray="100" strokeDashoffset="100" />
            </mask>
          ))}
        </defs>
        <g data-flow-connections>
          {branches.map(({ path }, index) => <path key={index} d={path} mask={`url(#${id}-branch-${index})`} fill="none" stroke="currentColor" className="text-foreground/35" strokeWidth="1.5" strokeDasharray="1 5" strokeLinecap="round" />)}
        </g>
        {branches.map(({ key, x, y, icon }, index) => (
          <g key={key} data-flow-node={index} opacity="0.65" className="opacity-65 [filter:grayscale(1)_blur(1.25px)]">
            <rect x={x} y={y} width="72" height="72" className="fill-background stroke-foreground/15" strokeWidth="1" />
            <image href={`/icons/integrations/${icon}`} x={x + 20} y={y + 20} width="32" height="32" />
          </g>
        ))}
        <rect x="144" y="96" width="72" height="72" className="fill-background stroke-foreground/15" strokeWidth="1" />
        <foreignObject x="160" y="112" width="40" height="40">
          <FallbackAvatar name="GRIDS Growth" size={40} animated={true} className="pointer-events-auto block" />
        </foreignObject>
      </svg>
    </div>
  );
}
