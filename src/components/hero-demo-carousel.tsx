"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import LiquidGlassCarousel from "@/components/originkit/ui/liquid-glass-carousel";
import { demoProjects } from "@/components/archive/demo-project-data";
import { ArchiveProjectMedia } from "@/components/archive/archive-project-media";

// DOM slides retain their live iframes; OriginKit controls their panel motion.
const items = demoProjects.map(() => ({ image: "" }));

export default function HeroDemoCarousel() {
  const t = useTranslations("Hero.showcase");
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(motion.matches);
    sync();
    resize.observe(host);
    motion.addEventListener("change", sync);
    return () => { resize.disconnect(); motion.removeEventListener("change", sync); };
  }, []);

  const cardWidth = Math.min(560, Math.max(240, width * (width < 640 ? 0.82 : 0.38)));

  return (
    <div
      ref={root}
      role="region"
      tabIndex={0}
      aria-roledescription={t("carousel")}
      aria-label={`${t("title")}. ${t("pauseHint")}`}
      onKeyDown={(event) => {
        if (event.code === "Space") {
          event.preventDefault();
          setPaused((value) => !value);
        }
      }}
      data-hero-reveal="grid"
      className="relative h-[clamp(230px,30vw,400px)] overflow-hidden group-data-[hero-pending=true]/hero:opacity-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary"
    >
      {width > 0 && (
        <LiquidGlassCarousel
          items={items}
          cardWidth={cardWidth}
          cardHeight={cardWidth / 1.6}
          gap={width < 640 ? 16 : 28}
          background="transparent"
          motion={{ autoplay: paused || reducedMotion ? 0 : 36, snap: false, glide: 6 }}
          entry={{ enabled: !reducedMotion, enterFrom: "alternate", transition: { duration: 0.6, delay: 0 } }}
          interaction={{ wheel: false, drag: !reducedMotion, clickToFocus: false }}
          renderItem={(index) => {
            const project = demoProjects[index];
            return <ArchiveProjectMedia project={project} title={project.title ?? project.key} showFallbackLabel={false} keepPreviewMounted className="absolute inset-0" />;
          }}
        />
      )}
    </div>
  );
}
