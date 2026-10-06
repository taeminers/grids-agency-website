"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "reicon-react/icons/ArrowUpRight";
import { MetalButton } from "@/components/spectrumui/metal-button";

export function ArchiveOutlink({
  href,
  external,
  label,
}: {
  href: string;
  external: boolean;
  label: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [effectReady, setEffectReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    // MetalFx measures and observes its host when it mounts. The sheet starts
    // outside the clipped viewport, and its foreground also needs a layout
    // pass to fit. Mount the shader once the opening animation has settled.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(async () => {
        const sheet = host.current?.closest('[role="dialog"]');
        const animations = sheet?.getAnimations?.() ?? [];
        await Promise.allSettled(
          animations
            .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
            .map((animation) => animation.finished),
        );
        if (!cancelled) setEffectReady(true);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={host} className="inline-flex overflow-visible">
      <MetalButton
        asChild
        effectEnabled={effectReady}
        className="group/link gap-6 rounded-none text-xs"
        wrapperClassName="overflow-visible rounded-none"
      >
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {label}
          <ArrowUpRight
            size={15}
            aria-hidden="true"
            className="transition-transform duration-300 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transform-none"
          />
        </a>
      </MetalButton>
    </div>
  );
}
