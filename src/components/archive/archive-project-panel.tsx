"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { ArrowUpRight } from "reicon-react/icons/ArrowUpRight";

import { MetalButton } from "@/components/spectrumui/metal-button";
import type { ArchiveProject } from "./archive-project-data";

export function ArchiveProjectPanel({
  active,
  project,
  index,
}: {
  active: boolean;
  project: ArchiveProject;
  index: number;
}) {
  const t = useTranslations(`Archive.${project.namespace}`);
  const locale = useLocale();
  const gallery = project.gallery;
  const href = project.external ? project.href : `/${locale}${project.href}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    left: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  return (
    <div className="@container/project relative isolate flex min-h-full flex-col bg-[#141614] text-[#f5f3ec] md:bg-[#080908] md:px-9 md:pt-8 md:pb-16 lg:px-12 lg:pt-10">
      <video
        data-archive-panel={index}
        src={project.video}
        poster={project.poster ?? undefined}
        aria-hidden="true"
        className={`pointer-events-none block w-full shrink-0 bg-[#080908] object-contain md:absolute md:inset-0 md:-z-20 md:aspect-auto md:h-full ${project.key === "admin" ? "aspect-auto h-auto md:object-contain md:object-top" : "aspect-video md:object-cover"}`}
        muted
        loop
        playsInline
        preload="none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-[linear-gradient(180deg,#08090866_0%,#08090815_25%,#08090855_46%,#080908ed_72%,#080908_100%)] md:block"
      />

      <header className="flex items-start justify-between gap-6 px-6 pt-6 sm:px-9 sm:pt-8 md:px-0 md:pt-0">
        <h2 className="text-[clamp(26px,3.6cqw,42px)] leading-none font-medium tracking-[-0.045em]">
          {t("title")}
        </h2>
        <span
          aria-hidden="true"
          className="pt-1 font-mono text-[10px] tracking-[0.12em] text-white/70 sm:text-xs"
        >
          [{String(index).padStart(2, "0")} / 04]
        </span>
      </header>

      <div
        aria-hidden="true"
        className="hidden min-h-[clamp(180px,28svh,340px)] flex-1 md:block"
      />

      <div className="mt-6 grid items-start gap-10 px-6 pb-6 sm:px-9 md:mt-0 md:px-0 md:pb-0 @min-[620px]/project:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.4fr)] @min-[620px]/project:gap-10 @min-[900px]/project:gap-16">
        <div>
          <p className="mb-3 font-mono text-[9px] tracking-[0.16em] text-white/55">
            {t("projectLabel")}
          </p>
          <h3 className="text-[clamp(38px,5.2cqw,64px)] leading-none font-medium tracking-[-0.06em]">
            {t("projectTitle")}
          </h3>
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] text-white/80">
            {project.tags.map((tag) => (
              <span key={tag} className="border border-white/25 px-2.5 py-1.5">
                {t(`tags.${tag}`)}
              </span>
            ))}
          </div>
          <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-xs leading-[1.6]">
            <dt className="text-white/50">{t("industryLabel")}</dt>
            <dd>{t("industry")}</dd>
            <dt className="text-white/50">{t("scopeLabel")}</dt>
            <dd>{t("scope")}</dd>
          </dl>
          <MetalButton
            asChild
            className="group/link gap-6 rounded-none text-xs"
            wrapperClassName="mt-7 w-fit rounded-none"
          >
            <a
              href={href}
              target={project.external ? "_blank" : undefined}
              rel={project.external ? "noopener noreferrer" : undefined}
            >
              {t("visit")}
              <ArrowUpRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transform-none"
              />
            </a>
          </MetalButton>
        </div>

        <div className="min-w-0">
          {gallery.length > 0 && (
          <Dialog.Root
            open={active && selected !== null}
            onOpenChange={(open) => {
              if (!open) setSelected(null);
            }}
          >
            <div
              role="group"
              aria-label={t("galleryLabel")}
              onPointerDown={(event) => {
                suppressClick.current = false;
                // Touch keeps native horizontal swiping and vertical page scrolling.
                if (event.pointerType !== "mouse" || event.button !== 0) return;
                drag.current = {
                  pointerId: event.pointerId,
                  x: event.clientX,
                  left: event.currentTarget.scrollLeft,
                  moved: false,
                };
              }}
              onPointerMove={(event) => {
                const current = drag.current;
                if (!current || current.pointerId !== event.pointerId) return;
                const distance = event.clientX - current.x;
                if (!current.moved && Math.abs(distance) < 6) return;
                if (!current.moved) {
                  current.moved = true;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  event.currentTarget.dataset.dragging = "true";
                }
                suppressClick.current = true;
                event.currentTarget.scrollLeft = current.left - distance;
              }}
              onPointerUp={(event) => {
                drag.current = null;
                delete event.currentTarget.dataset.dragging;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              onPointerCancel={(event) => {
                drag.current = null;
                delete event.currentTarget.dataset.dragging;
              }}
              onPointerLeave={() => {
                if (!drag.current?.moved) drag.current = null;
              }}
              onClickCapture={(event) => {
                if (suppressClick.current && event.detail !== 0) {
                  event.preventDefault();
                  event.stopPropagation();
                  suppressClick.current = false;
                }
              }}
              className="flex cursor-grab snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2 select-none [scrollbar-width:none] data-[dragging=true]:cursor-grabbing data-[dragging=true]:snap-none [&::-webkit-scrollbar]:hidden"
            >
              {gallery.map((image, index) => (
                <Dialog.Trigger asChild key={image.key}>
                  <button
                    type="button"
                    onClick={(event) => {
                      triggerRef.current = event.currentTarget;
                      setSelected(index);
                    }}
                    aria-label={t("enlarge", {
                      image: t(`images.${image.key}`),
                    })}
                    className="group/image relative aspect-[1.55] min-w-28 flex-1 shrink-0 basis-[36%] snap-start cursor-zoom-in overflow-hidden border border-white/25 bg-black/30 outline-none transition-colors hover:border-white/70 focus-visible:border-white focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white @min-[480px]/project:basis-0"
                  >
                    <Image
                      src={image.src}
                      alt={t(`images.${image.key}`)}
                      fill
                      draggable={false}
                      sizes="(max-width: 767px) 160px, 240px"
                      className="object-cover transition-transform duration-500 group-hover/image:scale-105 motion-reduce:transform-none"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute right-1.5 bottom-1.5 flex size-5 items-center justify-center bg-black/50 text-xs text-white backdrop-blur-sm"
                    >
                      +
                    </span>
                  </button>
                </Dialog.Trigger>
              ))}
            </div>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm" />
              <Dialog.Content
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  if (active)
                    triggerRef.current?.focus({ preventScroll: true });
                }}
                className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-32px)] max-w-5xl -translate-x-1/2 -translate-y-1/2 border border-white/15 bg-[#101110] p-3 text-white shadow-2xl outline-none sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <Dialog.Title className="text-sm font-medium">
                    {t("projectTitle")} — {t("galleryLabel")}
                  </Dialog.Title>
                  <Dialog.Close className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center border border-white/20 px-3 text-xs transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    {t("close")}
                  </Dialog.Close>
                </div>
                {selected !== null && (
                  <div className="relative aspect-video max-h-[70svh]">
                    <Image
                      src={gallery[selected].src}
                      alt={t(`images.${gallery[selected].key}`)}
                      fill
                      sizes="(max-width: 1024px) 95vw, 1024px"
                      className="object-contain"
                    />
                  </div>
                )}
                <Dialog.Description className="mt-3 text-xs leading-relaxed text-white/60">
                  {selected !== null
                    ? t(`images.${gallery[selected].key}`)
                    : t("galleryLabel")}
                </Dialog.Description>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          )}

          <h4 className={`${gallery.length > 0 ? "mt-6 " : ""}text-lg leading-[1.5] font-medium tracking-[-0.03em] [word-break:keep-all] sm:text-xl`}>
            {t("heading")}
          </h4>
          <p className="mt-3 max-w-[42em] text-sm leading-[1.85] text-white/70 [word-break:keep-all]">
            {t("description")}
          </p>
        </div>
      </div>
    </div>
  );
}
