"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import Grid from "reicon-react/icons/Grid";
import ChartBar from "reicon-react/icons/ChartBar";
import Layers from "reicon-react/icons/Layers";
import Shield from "reicon-react/icons/Shield";
import Database from "reicon-react/icons/Database";
import Users from "reicon-react/icons/Users";
import Settings from "reicon-react/icons/Settings";
import ChevronDown from "reicon-react/icons/ChevronDown";
import ChevronRight from "reicon-react/icons/ChevronRight";
import Check from "reicon-react/icons/Check";
import Bolt from "reicon-react/icons/Bolt";

const metrics = [
  { label: "records", before: "24.8", after: "168.2", unit: "k", change: "+15.2%", color: "bg-[#4c7dff]", bars: [12, 19, 14, 25, 17, 22, 28] },
  { label: "latency", before: "850", after: "612", unit: "ms", change: "−28.0%", color: "bg-[#9961f0]", bars: [10, 16, 22, 17, 25, 14, 19] },
  { label: "synced", before: "99.8", after: "99.9", unit: "%", change: "+0.1%", color: "bg-[#f18346]", bars: [8, 23, 15, 21, 27, 13, 18] },
  { label: "tasks", before: "142", after: "986", unit: "", change: "+12.4%", color: "bg-[#eb646a]", bars: [21, 14, 10, 24, 18, 27, 22] },
] as const;

/** A cropped operations dashboard with a simulated reporting-period interaction. */
export default function CrmDashboardPreview() {
  const t = useTranslations("Possibilities.crm.dashboard");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let sequence: gsap.core.Timeline;
    const context = gsap.context(() => {
      sequence = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8 });
      sequence
        .set("[data-demo-scene]", { y: 0 })
        .set("[data-demo-cursor]", { x: 170, y: 38, autoAlpha: 1 })
        .set("[data-demo-pointer]", { scale: 1 })
        .set("[data-demo-menu], [data-demo-after], [data-demo-option-highlight]", { autoAlpha: 0 })
        .set("[data-demo-before]", { autoAlpha: 1 })
        .to("[data-demo-cursor]", { x: 208, y: 51, duration: 0.8, ease: "power2.inOut" }, 0.7)
        .to("[data-demo-pointer]", { scale: 0.8, duration: 0.12, repeat: 1, yoyo: true }, 1.65)
        .fromTo("[data-demo-menu]", { autoAlpha: 0, y: -4 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 1.8)
        .to("[data-demo-scene]", { y: -12, duration: 0.75, ease: "power2.inOut" }, 2.5)
        .to("[data-demo-cursor]", { x: 206, y: 118, duration: 0.75, ease: "power2.inOut" }, 2.5)
        .to("[data-demo-option-highlight]", { autoAlpha: 1, duration: 0.2 }, 3.1)
        .to("[data-demo-pointer]", { scale: 0.8, duration: 0.12, repeat: 1, yoyo: true }, 3.4)
        .to("[data-demo-menu]", { autoAlpha: 0, duration: 0.2 }, 3.6)
        .to("[data-demo-before]", { autoAlpha: 0, duration: 0.2 }, 3.8)
        .fromTo("[data-demo-after]", { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 3.95)
        .to("[data-demo-cursor]", { autoAlpha: 0, duration: 0.3 }, 4.4)
        .to("[data-demo-scene]", { y: -100, duration: 0.9, ease: "power2.inOut" }, 5.1)
        .to("[data-demo-scene]", { y: 0, duration: 1, ease: "power2.inOut" }, 7.5)
        .to("[data-demo-after]", { autoAlpha: 0, duration: 0.4 }, 9.3)
        .to("[data-demo-before]", { autoAlpha: 1, duration: 0.4 }, 9.3);
    }, element);
    const syncPlayback = () => {
      if (media.matches) sequence.pause(8.6);
      else if (visible && !document.hidden) sequence.play();
      else sequence.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.2 });
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

  const node = (label: string, x: number, y: number, value: string, after: string, Icon: typeof Database) => (
    <div className="absolute w-[128px] rounded-md border border-black/8 dark:border-white/8 bg-[#ffffff] dark:bg-[#1b1b1b] p-1 shadow-[0_3px_10px_#0000000a] dark:shadow-[0_4px_12px_#0003]" style={{ left: x, top: y }}>
      <div className="flex h-5 items-center gap-1.5 px-1 text-[9px] text-[#333333] dark:text-[#d4d4d4]">
        <Icon size={10} className="text-[#707070] dark:text-[#929292]" /><span>{label}</span>
        <span className="ml-auto size-1 rounded-full bg-[#29b18c]" />
      </div>
      <div className="flex items-center justify-between rounded-sm bg-[#ffffff] dark:bg-[#101010] px-1.5 py-1.5 text-[8px] text-[#737373] dark:text-[#858585]">
        <span>{t("processed")}</span><span className="relative font-mono text-[#404040] dark:text-[#c9c9c9]"><span data-demo-before>{value}</span><span data-demo-after className="invisible absolute right-0 opacity-0">{after}</span></span>
      </div>
    </div>
  );

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none relative h-full overflow-hidden rounded-tl-xl border border-[#dedede] dark:border-[#303030] bg-[#f8f8f8] dark:bg-[#0d0d0d] text-[#343434] dark:text-[#d7d7d7] select-none [font-family:var(--font-geist-sans),Arial,sans-serif]">
      <div className="absolute inset-x-0 top-0 z-30 flex h-6 items-center gap-1.5 border-b border-black/5 dark:border-white/5 bg-[#f0f0f0] dark:bg-[#171717] px-3">
        <span className="size-1.5 rounded-full bg-[#ff5f57]" /><span className="size-1.5 rounded-full bg-[#febc2e]" /><span className="size-1.5 rounded-full bg-[#28c840]" />
      </div>
      <aside className="absolute top-6 bottom-0 left-0 z-20 flex w-9 flex-col items-center gap-2 border-r border-black/5 dark:border-white/5 bg-[#ffffff] dark:bg-[#101010] py-2">
        <span className="mb-2 flex size-5 items-center justify-center rounded bg-[#f5f5f5]"><Image src="/logo/grids-black.png" alt="" width={12} height={12} className="size-3 object-contain" /></span>
        {[Layers, Grid, Users, ChartBar, Shield, Database].map((Icon, index) => <span key={index} className={`flex size-6 items-center justify-center rounded ${index === 0 ? "bg-[#e5e5e5] dark:bg-[#252525] text-[#292929] dark:text-[#e8e8e8]" : "text-[#747474]"}`}><Icon size={12} /></span>)}
        <Settings size={12} className="mt-auto text-[#747474]" />
      </aside>
      <div className="absolute top-6 right-0 bottom-0 left-9 overflow-hidden">
        <div data-demo-scene className="relative h-[510px] w-[650px] px-2.5 will-change-transform">
          <header className="flex h-8 items-center gap-2 text-[10px]">
            <span className="text-[#727272]">{t("workspace")}</span><ChevronRight size={10} className="text-[#8a8a8a] dark:text-[#5e5e5e]" /><span>{t("heading")}</span>
            <span className="ml-auto flex items-center gap-1.5 rounded border border-black/8 dark:border-white/8 bg-[#f0f0f0] dark:bg-[#191919] px-2 py-1 text-[8px] text-[#686868] dark:text-[#8e8e8e]"><span className="size-1 rounded-full bg-[#24ae84]" />{t("live")}</span>
          </header>
          <div className="flex h-[38px] items-start pt-0.5">
            <div className="flex h-7 items-center gap-3 rounded-md bg-[#f0f0f0] dark:bg-[#171717] px-2 text-[9px]">
              <span className="flex items-center gap-1 text-[#303030] dark:text-[#e4e4e4]"><Grid size={10} />{t("overview")}</span>
              <span className="flex items-center gap-1 text-[#717171]"><ChartBar size={10} />{t("metrics")}</span>
            </div>
            <div className="absolute top-[36px] left-[144px] flex h-7 w-[128px] items-center justify-between rounded-md border border-black/5 dark:border-white/5 bg-[#ffffff] dark:bg-[#1b1b1b] px-2.5 text-[9px] text-[#484848] dark:text-[#c1c1c1]">
              <span className="relative"><span data-demo-before>{t("lastDay")}</span><span data-demo-after className="invisible absolute top-0 left-0 whitespace-nowrap opacity-0">{t("lastWeek")}</span></span><ChevronDown size={10} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {metrics.map(({label, before, after, unit, change, color, bars}) => <div key={label} className="min-w-0 rounded-lg border border-black/3 dark:border-white/3 bg-[#f0f0f0] dark:bg-[#1a1a1a] p-1">
              <div className="flex h-5 items-center justify-between px-1.5 text-[8px] text-[#505050] dark:text-[#c5c5c5]"><span>{t(label)}</span><span className="text-[#888] dark:text-[#777]">···</span></div>
              <div className="flex h-10 items-center justify-between gap-1 rounded-md bg-[#ffffff] dark:bg-[#0e0e0e] px-1.5">
                <div className="relative whitespace-nowrap font-mono text-[21px] tracking-[-0.06em] text-[#202020] dark:text-[#ededed]"><span className="inline-grid"><span data-demo-before className="[grid-area:1/1]">{before}</span><span data-demo-after className="invisible opacity-0 [grid-area:1/1]">{after}</span></span><span className="ml-1 text-[9px] tracking-normal text-[#747474] dark:text-[#797979]">{unit}</span></div>
                <div className="flex h-7 items-end gap-0.5">{bars.map((height, index) => <span key={index} className={`w-[3px] rounded-[1px] ${color}`} style={{height}} />)}</div>
              </div>
              <div className="flex h-5 items-center justify-between px-1.5 text-[7px]"><span className="text-[#747474] dark:text-[#757575]">{t("comparison")}</span><span className="font-mono text-[#148361] dark:text-[#22a783]">{change}</span></div>
            </div>)}
          </div>
          <div className="mt-2 grid grid-cols-[336px_1fr] items-start gap-2">
            <div>
              <section className="rounded-lg border border-black/4 dark:border-white/4 bg-[#f0f0f0] dark:bg-[#191919] p-1">
                <div className="flex h-7 items-center gap-1.5 px-1.5 text-[9px]"><Layers size={11} className="text-[#7b7b7b] dark:text-[#818181]" />{t("flow")}<span className="ml-auto rounded bg-black/5 dark:bg-white/5 px-1.5 py-1 text-[7px] text-[#626262] dark:text-[#a5a5a5]">{t("details")}</span><span className="ml-1 text-[#888] dark:text-[#777]">···</span></div>
                <div className="relative h-[222px] overflow-hidden rounded-md bg-[#fafafa] dark:bg-[#0c0c0c] [background-image:radial-gradient(#00000012_0.7px,transparent_0.7px)] dark:[background-image:radial-gradient(#ffffff0d_0.7px,transparent_0.7px)] [background-size:7px_7px]">
                  <span className="absolute top-2 left-2 rounded bg-[#eeeeee] dark:bg-[#1c1c1c] px-1.5 py-1 font-mono text-[7px] text-[#737373] dark:text-[#858585]">{t("updated")} · 10:03:24</span>
                  <svg viewBox="0 0 326 222" className="absolute inset-0 h-full w-full" fill="none">
                    <path d="M163 92V106H80V117M163 106H247V117M80 171V188H163M247 171V188H163" className="stroke-[#d2d2d2] dark:stroke-[#383838]" strokeWidth="1" />
                    <path data-demo-after className="invisible stroke-[#65a085] opacity-0 dark:stroke-[#79a995]" d="M163 92V106H80V117M163 106H247V117" strokeWidth="1" />
                    {[{x:163,y:92},{x:80,y:117},{x:247,y:117},{x:163,y:188}].map(({x,y})=><circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="#a0a0a0" />)}
                  </svg>
                  {node(t("gateway"), 99, 39, "24,801", "168,240", Database)}
                  {node(t("customers"), 16, 117, "8,642", "58,210", Users)}
                  {node(t("orders"), 183, 117, "16,159", "110,030", Layers)}
                  <div className="absolute top-[191px] left-[112px] flex items-center gap-1.5 text-[8px] text-[#378568] dark:text-[#6a9d88]"><span className="size-1 rounded-full bg-[#29b18c]" />{t("healthy")}</div>
                </div>
              </section>
              <section className="mt-2 rounded-lg border border-black/4 dark:border-white/4 bg-[#f0f0f0] dark:bg-[#191919] p-1">
                <div className="flex h-7 items-center gap-1.5 px-1.5 text-[9px]"><Shield size={11} className="text-[#7b7b7b] dark:text-[#818181]" />{t("activity")}</div>
                <div className="flex justify-between rounded bg-[#f8f8f8] dark:bg-[#0d0d0d] px-2 py-1.5 text-[7px] text-[#747474]"><span>{t("time")}</span><span>{t("event")}</span><span>{t("status")}</span></div>
                {["customerUpdated", "orderSynced", "reportSent"].map((key,index)=><div key={key} className="flex h-6 items-center justify-between border-b border-black/4 dark:border-white/4 px-2 text-[8px]"><span className="font-mono text-[#707070] dark:text-[#929292]">10:0{3-index}:24</span><span className="text-[#484848] dark:text-[#b6b6b6]">{t(key)}</span><span className="rounded bg-[#e3f3eb] dark:bg-[#17332b] px-1 py-0.5 text-[7px] text-[#198357] dark:text-[#49b790]">{t("complete")}</span></div>)}
              </section>
            </div>
            <section className="rounded-lg border border-black/4 dark:border-white/4 bg-[#f0f0f0] dark:bg-[#191919] p-1">
              <div className="flex h-7 items-center gap-1.5 px-1.5 text-[9px]"><Bolt size={11} className="text-[#7b7b7b] dark:text-[#818181]" />{t("rules")}</div>
              <div className="space-y-3 rounded-md bg-[#f8f8f8] dark:bg-[#0d0d0d] p-2.5">
                <p className="text-[8px] text-[#737373] dark:text-[#858585]">01. {t("sources")}</p>
                <div className="space-y-3 rounded-md bg-[#ffffff] dark:bg-[#1b1b1b] p-2.5 text-[8px]">{["website", "store", "support"].map(key=><div key={key} className="flex items-center justify-between"><span className="text-[#6b6b6b] dark:text-[#9c9c9c]">{t(key)}</span><span className="font-mono text-[#454545] dark:text-[#bfbfbf]">CONNECTED</span></div>)}</div>
                <p className="text-[8px] text-[#737373] dark:text-[#858585]">02. {t("routing")}</p>
                <div className="rounded-md border border-black/5 dark:border-white/5 p-2"><div className="flex items-center gap-2 text-[8px]">{t("rule")} 01 <span className="rounded bg-sky-100 dark:bg-sky-950 px-1.5 py-0.5 text-sky-700 dark:text-sky-200">{t("priority")}</span></div><p className="mt-3 rounded bg-[#ffffff] dark:bg-[#1b1b1b] p-2 font-mono text-[8px] text-[#707070] dark:text-[#929292]">IF [ new_customer ] → CRM</p><div className="mt-3 flex justify-between text-[8px] text-[#707070] dark:text-[#929292]"><span>{t("assigned")}</span><span>{t("sales")}</span></div></div>
              </div>
            </section>
          </div>
          <div data-demo-menu className="invisible absolute top-[70px] left-[144px] z-20 w-[128px] rounded-md border border-[#dedede] dark:border-[#343434] bg-[#ffffff] dark:bg-[#202020] p-1 opacity-0 shadow-[0_8px_24px_#0002] dark:shadow-[0_8px_24px_#0008]">
            <div className="flex h-7 items-center justify-between px-2 text-[9px] text-[#626262] dark:text-[#a5a5a5]">{t("lastDay")}<Check size={10} /></div>
            <div className="relative flex h-7 items-center px-2 text-[9px]"><span data-demo-option-highlight className="invisible absolute inset-0 rounded bg-[#ededed] dark:bg-[#383838] opacity-0" /><span className="relative">{t("lastWeek")}</span></div>
            <div className="flex h-7 items-center px-2 text-[9px] text-[#626262] dark:text-[#a5a5a5]">{t("lastMonth")}</div>
          </div>
          <div data-demo-cursor className="invisible absolute top-0 left-0 z-30 opacity-0">
            <svg data-demo-pointer width="22" height="27" viewBox="0 0 20 24" className="origin-top-left drop-shadow-[0_2px_3px_#0008]"><path d="M2 1.5v17l4.8-4 3.5 7 3.2-1.6-3.5-6.8 6.2-.6L2 1.5Z" fill="white" stroke="#151515" strokeWidth="1.4" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
