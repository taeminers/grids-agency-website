"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Fit the complete foreground into the sheet, including on short screens. */
export function ArchivePanelContent({
  fit,
  children,
}: {
  fit: boolean;
  children: React.ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!fit || !viewport.current || !content.current) return;
    const available = viewport.current;
    const inner = content.current;
    const resize = new ResizeObserver(() => {
      // Transforms do not affect scrollHeight, so this measures the natural
      // layout and does not repeatedly shrink already-scaled content.
      const next = Math.min(1, available.clientHeight / Math.max(1, inner.scrollHeight));
      setScale(next);
    });
    resize.observe(available);
    resize.observe(inner);
    return () => resize.disconnect();
  }, [fit]);

  return (
    <div ref={viewport} className={fit ? "h-full min-h-0 overflow-visible" : "flex flex-1 flex-col"}>
      <div
        ref={content}
        className={`flex min-h-full flex-col ${fit ? "px-5 py-4 sm:px-8 sm:py-5" : "flex-1 md:px-9 md:pt-8 md:pb-6 lg:px-12 lg:pt-10"}`}
        style={fit && scale < 1 ? { transform: `scale(${scale})`, transformOrigin: "top center" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
