"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { BatteryFull, ChartNoAxesColumnIncreasing, Check, ChevronRight, CircleCheck, House, Signal, UserRound, Wifi } from "lucide-react";
import gsap from "gsap";
import styles from "./mobile-app-preview.module.css";

function MorrowMark() {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M12 35a20 20 0 0 1 40 0Z" fill="currentColor" />
    <path d="M9 43h46M19 51h26" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M32 4v5M10 15l4 4M54 15l-4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}

function OrbitArt() {
  const id = useId();
  return <svg viewBox="0 0 260 200" fill="none" className={styles.orbitArt} aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-pearl`} cx=".3" cy=".22" r=".8"><stop stopColor="#fff" /><stop offset=".45" stopColor="#d2efff" /><stop offset=".78" stopColor="#77b9e4" /><stop offset="1" stopColor="#3979b4" /></radialGradient>
      <linearGradient id={`${id}-ribbon`} x1="40" y1="40" x2="220" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#fbfeff" /><stop offset=".35" stopColor="#a9daff" /><stop offset=".7" stopColor="#4d8cc5" /><stop offset="1" stopColor="#d4f0ff" /></linearGradient>
      <filter id={`${id}-shadow`}><feGaussianBlur stdDeviation="7" /></filter>
    </defs>
    <ellipse cx="130" cy="170" rx="65" ry="9" fill="#5485b2" opacity=".18" filter={`url(#${id}-shadow)`} />
    <g data-orbit-sculpture>
      <ellipse cx="130" cy="97" rx="100" ry="36" transform="rotate(-28 130 97)" stroke={`url(#${id}-ribbon)`} strokeWidth="8" />
      <circle cx="130" cy="95" r="44" fill={`url(#${id}-pearl)`} />
      <path d="M42 135c20 25 92 7 145-29 29-20 43-40 35-52" stroke={`url(#${id}-ribbon)`} strokeWidth="8" strokeLinecap="round" />
      <path d="M43 132c20 23 90 7 143-29" stroke="#f7fcff" strokeOpacity=".85" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="194" cy="47" r="13" fill={`url(#${id}-pearl)`} />
      <circle cx="62" cy="111" r="6" fill="#f8fcff" />
    </g>
    <circle cx="62" cy="42" r="2" fill="#6397bf" /><circle cx="214" cy="141" r="3" fill="#9cc7e8" />
  </svg>;
}

function GardenArt() {
  const id = useId();
  return <svg viewBox="0 0 240 240" fill="none" className={styles.gardenArt} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-leaf`} x1="65" y1="45" x2="167" y2="155" gradientUnits="userSpaceOnUse"><stop stopColor="#f0fcff" /><stop offset=".4" stopColor="#b8dff6" /><stop offset=".75" stopColor="#5f9ed1" /><stop offset="1" stopColor="#397bae" /></linearGradient>
      <linearGradient id={`${id}-base`} x1="60" y1="175" x2="178" y2="214" gradientUnits="userSpaceOnUse"><stop stopColor="#d3ecfb" /><stop offset=".5" stopColor="#79b4dc" /><stop offset="1" stopColor="#b7d9ed" /></linearGradient>
      <filter id={`${id}-shadow`}><feGaussianBlur stdDeviation="6" /></filter>
    </defs>
    <ellipse cx="120" cy="216" rx="68" ry="9" fill="#366b99" opacity=".15" filter={`url(#${id}-shadow)`} />
    <path d="M52 184v13c0 25 136 25 136 0v-13" fill={`url(#${id}-base)`} />
    <ellipse cx="120" cy="184" rx="68" ry="23" fill="#e8f6ff" stroke="#fff" strokeOpacity=".8" />
    <ellipse cx="120" cy="182" rx="43" ry="13" fill="#cee7f7" />
    <g data-garden-growth>
      <path d="M121 183c2-37-3-73 14-105" stroke="#6099c4" strokeWidth="4" strokeLinecap="round" />
      <path d="M122 145C83 144 61 119 68 82c40 1 64 21 54 63Z" fill={`url(#${id}-leaf)`} stroke="#e5f7ff" strokeWidth="1.5" />
      <path d="M126 116c-4-42 15-69 49-76 13 41-6 71-49 76Z" fill={`url(#${id}-leaf)`} stroke="#edfaff" strokeWidth="1.5" />
      <path d="M77 95c17 17 29 28 45 50m4-29c18-23 30-42 42-65" stroke="#f4fbff" strokeOpacity=".6" strokeWidth="1.5" />
    </g>
    <path d="M54 54v10m-5-5h10M188 122v8m-4-4h8" stroke="#7daed2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}

function HabitArt({ kind }: { kind: "water" | "focus" | "walk" }) {
  const id = useId();
  const palette = { water: ["#9ee7de", "#369e9b"], focus: ["#d1bcf2", "#8870be"], walk: ["#ffc49e", "#de835e"] }[kind];
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs><linearGradient id={`${id}-fill`} x1="10" y1="7" x2="36" y2="41" gradientUnits="userSpaceOnUse"><stop stopColor={palette[0]} /><stop offset="1" stopColor={palette[1]} /></linearGradient></defs>
    {kind === "water" ? <>
      <path d="M13 10h22l-3 29c-4 3-12 3-16 0Z" fill="#fff" fillOpacity=".75" stroke="#83b9b7" strokeWidth="1.3" />
      <path d="M15 23c6 4 12-4 18 0l-1.8 15c-4 2.5-10.4 2.5-14.4 0Z" fill={`url(#${id}-fill)`} />
      <ellipse cx="24" cy="10" rx="11" ry="2.5" fill="#effffa" stroke="#83b9b7" strokeWidth="1.2" />
      <path d="m19 16 1.3 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      <path d="M36 3c0 0-3 3.7-3 5a3 3 0 0 0 6 0c0-1.3-3-5-3-5Z" fill="#59b4ae" />
    </> : kind === "focus" ? <>
      <ellipse cx="24" cy="38" rx="17" ry="4" fill="#957dbb" opacity=".15" />
      <path d="M8 33c0-7 31-11 33-2 2 10-33 12-33 2Z" fill={`url(#${id}-fill)`} />
      <path d="M13 23c0-7 23-10 24-2 1 9-24 10-24 2Z" fill="#b59bd7" />
      <path d="M18 12c0-6 14-7 15-1 1 8-15 9-15 1Z" fill="#dcc9ed" />
      <path d="M12 31c6-3 14-4 21-3M17 21c4-2 9-3 14-2M21 10l6-1" stroke="#f8efff" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
      <path d="M8 12v6m-3-3h6" stroke="#a88ac6" strokeWidth="1.5" strokeLinecap="round" />
    </> : <>
      <path d="m12 14 9 4 6 10 12 4c4 1 5 6 1 7H9c-4-4-1-14 3-25Z" fill={`url(#${id}-fill)`} />
      <path d="M10 14c0 4 4 9 8 7l3-3-9-4Z" fill="#fce9d8" />
      <path d="M8 35c11 3 22 1 34 1v3c-4 4-27 4-34 0Z" fill="#fff4e7" stroke="#c78362" strokeWidth="1" />
      <path d="m23 23-5 2m8 2-5 2m8 2-5 2" stroke="#fff5e9" strokeWidth="2" strokeLinecap="round" />
      <path d="M31 12h9M34 17h6" stroke="#dc9c75" strokeWidth="1.5" strokeLinecap="round" />
    </>}
  </svg>;
}

function ProgressBloom() {
  return <svg viewBox="0 0 72 72" fill="none" aria-hidden="true">
    <circle cx="36" cy="36" r="30" stroke="#bddbd0" strokeWidth="3" />
    <circle cx="36" cy="36" r="30" stroke="#568d7c" strokeWidth="3" strokeDasharray="54 189" strokeLinecap="round" transform="rotate(-90 36 36)" />
    {[0,60,120,180,240,300].map(angle => <ellipse key={angle} cx="36" cy="26" rx="6" ry="10" fill="#edb79b" transform={`rotate(${angle} 36 36)`} />)}
    <circle cx="36" cy="36" r="7" fill="#fff3cf" />
  </svg>;
}

function Week({ days, completed = 2 }: { days: string[]; completed?: number }) {
  return <div className={styles.week}>{days.map((day, index) => <span key={index} data-lit={index < completed}><small>{day}</small><CircleCheck strokeWidth={1.6} /></span>)}</div>;
}

export default function MobileAppPreview() {
  const t = useTranslations("HomeOfferings.build.mobile");
  const root = useRef<HTMLDivElement>(null);
  const days = t("days").split(" ");

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const context = gsap.context(() => {
      const sequence = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.5 });
      sequence
        .set('[data-app-scene]', { autoAlpha: 0 })
        .set('[data-app-scene="splash"]', { autoAlpha: 1 })
        .set('[data-app-logo]', { scale: .92, opacity: 0 })
        .set('[data-garden-growth]', { scaleY: .65, svgOrigin: '120 183' })
        .set('[data-task-check]', { scale: .5, opacity: 0 })
        .set('[data-task-done]', { opacity: .5 })
        .to('[data-app-logo]', { scale: 1, opacity: 1, duration: .9, ease: 'power2.out' }, .15)
        .to('[data-app-scene="splash"]', { autoAlpha: 0, duration: .6, ease: 'sine.inOut' }, 2.2)
        .to('[data-app-scene="streak"]', { autoAlpha: 1, duration: .6, ease: 'sine.inOut' }, 2.2)
        .fromTo('[data-orbit-sculpture]', { rotation: -12, svgOrigin: '130 97' }, { rotation: 8, duration: 3.6, ease: 'power1.inOut' }, 2.3)
        .to('[data-continue="streak"]', { scale: .96, duration: .14, yoyo: true, repeat: 1 }, 6.3)
        .to('[data-app-scene="streak"]', { autoAlpha: 0, duration: .6, ease: 'sine.inOut' }, 6.7)
        .to('[data-app-scene="garden"]', { autoAlpha: 1, duration: .6, ease: 'sine.inOut' }, 6.7)
        .to('[data-garden-growth]', { scaleY: 1, duration: 2.2, ease: 'power2.out' }, 7.3)
        .to('[data-continue="garden"]', { scale: .96, duration: .14, yoyo: true, repeat: 1 }, 11)
        .to('[data-app-scene="garden"]', { autoAlpha: 0, duration: .6, ease: 'sine.inOut' }, 11.4)
        .to('[data-app-scene="home"]', { autoAlpha: 1, duration: .6, ease: 'sine.inOut' }, 11.4)
        .to('[data-task-check]', { scale: 1, opacity: 1, duration: .4, ease: 'power2.out' }, 14)
        .to('[data-task-done]', { opacity: 1, duration: .4 }, 14)
        .to('[data-app-scene="home"]', { autoAlpha: 0, duration: .5 }, 20.5);
      const sync = () => {
        if (media.matches) sequence.pause(16);
        else if (visible && !document.hidden) sequence.play();
        else sequence.pause();
      };
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      observer.observe(element);
      media.addEventListener('change', sync);
      document.addEventListener('visibilitychange', sync);
      sync();
      return () => { observer.disconnect(); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
    }, element);
    return () => context.revert();
  }, []);

  return (
    <div ref={root} className={styles.stage} role="img" aria-label={t("label")}>
      <div className={styles.phone} aria-hidden="true">
        <span className={styles.sideButton} />
        <div className={styles.screen}>
          <div className={styles.statusBar}><span>9:41</span><span className={styles.island}><i /></span><span className={styles.statusIcons}><Signal /><Wifi /><BatteryFull /></span></div>
          <div className={`${styles.scene} ${styles.splash}`} data-app-scene="splash">
            <div data-app-logo className={styles.splashLogo}><MorrowMark /><strong>morrow</strong></div>
          </div>
          <div className={styles.scene} data-app-scene="streak">
            <span className={styles.skip}>{t("skip")}</span>
            <div className={styles.art}><OrbitArt /></div>
            <div className={styles.onboardingBottom}>
              <p className={styles.onboardingDescription}>{t("streakDescription")}</p>
              <div className={styles.dots} aria-hidden="true"><i data-active /><i /><i /></div>
              <span className={styles.continue} data-continue="streak">{t("continue")}</span>
            </div>
          </div>
          <div className={styles.scene} data-app-scene="garden">
            <span className={styles.skip}>{t("skip")}</span>
            <div className={`${styles.art} ${styles.garden}`}><GardenArt /></div>
            <div className={styles.onboardingBottom}>
              <p className={styles.onboardingDescription}>{t("gardenDescription")}</p>
              <div className={styles.dots} aria-hidden="true"><i /><i data-active /><i /></div>
              <span className={styles.continue} data-continue="garden">{t("start")}</span>
            </div>
          </div>
          <div className={`${styles.scene} ${styles.home}`} data-app-scene="home">
            <header className={styles.homeHeader}><span className={styles.wordmark}><MorrowMark />morrow</span></header>
            <div className={styles.greeting}><span>{t("greeting")}</span><h4>{t("homeTitle")}</h4></div>
            <div className={styles.streakCard}><div className={styles.streakTop}><div><span>{t("currentStreak")}</span><p>2<small>{t("dayUnit")}</small></p></div><ProgressBloom /></div><Week days={days} /></div>
            <div className={styles.taskHeading}><span>{t("today")}</span><span>{t("taskCount")}</span></div>
            <div className={styles.tasks}>
              <div className={styles.task} data-habit="water"><span className={styles.taskIcon}><HabitArt kind="water" /></span><div><strong>{t("water")}</strong><span>{t("waterDetail")}</span></div><span className={styles.checkCircle} data-task-done><Check data-task-check /></span></div>
              <div className={styles.task} data-habit="focus"><span className={styles.taskIcon}><HabitArt kind="focus" /></span><div><strong>{t("focus")}</strong><span>{t("focusDetail")}</span></div><span className={styles.emptyCheck} /></div>
              <div className={styles.task} data-habit="walk"><span className={styles.taskIcon}><HabitArt kind="walk" /></span><div><strong>{t("walk")}</strong><span>{t("walkDetail")}</span></div><span className={styles.emptyCheck} /></div>
            </div>
            <div className={styles.reward}><span>{t("reward")}</span><ChevronRight /></div>
            <div className={styles.bottomNav}><span data-active><House /><span className="sr-only">{t("navHome")}</span></span><span><ChartNoAxesColumnIncreasing /><span className="sr-only">{t("navProgress")}</span></span><span><UserRound /><span className="sr-only">{t("navYou")}</span></span></div>
          </div>
          <span className={styles.homeIndicator} />
        </div>
      </div>
    </div>
  );
}
