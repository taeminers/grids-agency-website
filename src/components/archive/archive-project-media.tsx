"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ArchiveProject } from "./archive-project-data";

/** Only nearby previews run; scrolling through the archive never loads 50 sites at once. */
export function ArchiveProjectMedia({
  project,
  title,
  active = true,
  showFallbackLabel = true,
  previewViewport = "desktop",
  keepPreviewMounted = false,
  className = "",
}: {
  project: ArchiveProject;
  title: string;
  active?: boolean;
  showFallbackLabel?: boolean;
  /** Cards use a scaled desktop preview; sheets use their actual viewport. */
  previewViewport?: "desktop" | "responsive";
  /** A virtualized carousel controls the lifetime and preloading of its frames. */
  keepPreviewMounted?: boolean;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [nearby, setNearby] = useState(false);
  const [{ scale, frameWidth, frameHeight }, setFrame] = useState({ scale: 0, frameWidth: 1464, frameHeight: 1000 });
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => {
      if (previewViewport === "responsive") {
        // Give the embedded site the real sheet dimensions so its media
        // queries and viewport-height sections respond to the user's device.
        setFrame({
          scale: entry.contentRect.width > 0 && entry.contentRect.height > 0 ? 1 : 0,
          frameWidth: entry.contentRect.width,
          frameHeight: entry.contentRect.height,
        });
        return;
      }
      const scale = entry.contentRect.width / 1440;
      setFrame({
        scale,
        frameWidth: 1464,
        frameHeight: scale > 0 ? Math.max(1000, entry.contentRect.height / scale + 24) : 1000,
      });
    });
    const visibility = new IntersectionObserver(([entry]) => {
      setNearby(entry.isIntersecting);
    }, { rootMargin: "120px" });
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motion.matches);
    syncMotion();
    motion.addEventListener("change", syncMotion);
    resize.observe(element);
    visibility.observe(element);
    return () => {
      resize.disconnect();
      visibility.disconnect();
      motion.removeEventListener("change", syncMotion);
    };
  }, [previewViewport]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let disposed = false;
    const sync = () => {
      if (active && nearby && !reducedMotion && !document.hidden) {
        void element.play().then(() => {
          if (disposed || document.hidden) element.pause();
        }).catch(() => { /* Keep the poster if autoplay is unavailable. */ });
      } else element.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      element.pause();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, nearby, reducedMotion]);

  return (
    <div ref={container} aria-hidden="true" className={`pointer-events-none overflow-hidden bg-[#e8e5df] ${className}`}>
      {project.poster ? (
        <Image src={project.poster} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw" className="object-cover" />
      ) : showFallbackLabel ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-[#222]">
          <span className="font-mono text-[10px] tracking-[0.16em]">GRIDS / {project.key.toUpperCase()}</span>
          <span className="text-3xl font-medium tracking-[-0.05em]">{title}</span>
        </div>
      ) : null}
      {project.video && (
        <video ref={video} src={nearby && active ? project.video : undefined} poster={project.poster ?? undefined} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover object-top" />
      )}
      {project.preview && (nearby || keepPreviewMounted) && active && scale > 0 && (
        <div inert className="absolute inset-0 overflow-hidden">
          <iframe
            title={`${title} homepage preview`}
            src={project.preview}
            tabIndex={-1}
            loading={keepPreviewMounted ? "eager" : "lazy"}
            scrolling="no"
            sandbox={reducedMotion ? "allow-same-origin" : "allow-scripts allow-same-origin"}
            referrerPolicy="no-referrer"
            className="absolute top-0 left-0 origin-top-left border-0 bg-white"
            // Only desktop thumbnails overscan the scrollbar gutter. Sheets
            // must retain their exact width, including near responsive breakpoints.
            style={{ width: frameWidth, height: frameHeight, transform: previewViewport === "desktop" ? `scale(${scale})` : undefined }}
          />
        </div>
      )}
    </div>
  );
}
