"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

export function ArchiveEntry({ onExplore }: { onExplore: () => void }) {
  const t = useTranslations("Archive.Entry");

  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center py-6 sm:py-10">
      <div className="max-w-3xl">
        <p className="mb-6 font-mono text-[9px] tracking-[0.14em] sm:text-xs">GRIDS / ARCHIVE</p>
        <h1 data-grid-avoid className="text-[clamp(26px,9cqw,84px)] leading-[1.12] font-[450] tracking-[-0.065em] [word-break:keep-all]">
          {t.rich("title", { newline: () => <br /> })}
        </h1>
        <p data-grid-avoid className="mt-6 max-w-md text-xs leading-[1.85] [word-break:keep-all] sm:mt-8 sm:text-base">
          {t("subtitle")}
        </p>
        <button
          type="button"
          onClick={onExplore}
          className="group relative mt-8 inline-flex min-h-11 cursor-pointer items-center gap-3 px-3 py-3 text-left text-[11px] leading-5 font-medium transition-colors hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary motion-reduce:transition-none sm:gap-7 sm:px-5 sm:text-xs"
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute top-0 left-0 size-3 border-t border-l border-current" />
            <span className="absolute top-0 right-0 size-3 border-t border-r border-current" />
            <span className="absolute bottom-0 left-0 size-3 border-b border-l border-current" />
            <span className="absolute right-0 bottom-0 size-3 border-r border-b border-current" />
          </span>
          {t("explore")}
          <ChevronRight strokeWidth={3.5} size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
