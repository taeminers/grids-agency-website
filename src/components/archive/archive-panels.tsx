"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { cn } from "@/lib/utils";
import { ArchiveAbout } from "./archive-about";
import { ArchiveProjectPanel } from "./archive-project-panel";
import { archiveProjects as categories } from "./archive-project-data";

const panelCount = categories.length + 1;
const number = (index: number) => String(index).padStart(2, "0");

export function ArchivePanels() {
  const t = useTranslations("Archive.Gallery");
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);
  const track = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const pendingFocus = useRef(false);
  const syncPlayback = useRef<(() => void) | null>(null);

  useEffect(() => {
    activeRef.current = active;
    syncPlayback.current?.();
    if (pendingFocus.current) {
      panels.current[active]
        ?.querySelector<HTMLElement>("[data-panel-content]")
        ?.focus({ preventScroll: true });
      pendingFocus.current = false;
    }
  }, [active]);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const videos = [...element.querySelectorAll("video")];
    let visible = true;
    let disposed = false;
    const sync = () => {
      videos.forEach((video) => {
        const index = Number(video.dataset.archivePanel);
        if (
          index === activeRef.current &&
          visible &&
          !document.hidden &&
          !reduced.matches
        ) {
          void video
            .play()
            .then(() => {
              // A pending play must not revive a panel the visitor has closed.
              if (disposed) return;
              if (
                index !== activeRef.current ||
                document.hidden ||
                !visible ||
                reduced.matches
              )
                video.pause();
            })
            .catch(() => {
              /* The still image remains when autoplay is unavailable. */
            });
        } else video.pause();
      });
    };
    syncPlayback.current = sync;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibility.observe(element);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      disposed = true;
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      videos.forEach((video) => video.pause());
      syncPlayback.current = null;
    };
  }, []);

  const select = (index: number, focusPanel = false) => {
    pendingFocus.current = focusPanel;
    setActive(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (
      !event.target.closest("[data-archive-select]") &&
      !event.target.hasAttribute("data-panel-content")
    )
      return;
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        if (window.matchMedia("(min-width: 768px)").matches) return;
      case "ArrowRight":
        next = (active + 1) % panelCount;
        break;
      case "ArrowUp":
        if (window.matchMedia("(min-width: 768px)").matches) return;
      case "ArrowLeft":
        next = (active - 1 + panelCount) % panelCount;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = panelCount - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next, true);
  };

  return (
    <section
      aria-label={t("label")}
      onKeyDown={onKeyDown}
      className="@container/archive relative flex flex-col border-t border-foreground/15 bg-background text-foreground md:h-[calc(100svh-72px)] md:min-h-[560px]"
    >
      <h1 className="sr-only">{t("label")}</h1>
      <div
        ref={track}
        className="relative flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden md:[--archive-strip:clamp(52px,5.25vw,84px)] md:[--archive-open:calc(100cqw-4*var(--archive-strip))]"
      >
        {Array.from({ length: panelCount }, (_, index) => {
          const category = index === 0 ? null : categories[index - 1];
          const opened = active === index;
          const title = category
            ? t(`categories.${category.key}.title`)
            : t("index");
          return (
            <article
              key={category?.key ?? "index"}
              ref={(element) => {
                panels.current[index] = element;
              }}
              data-active={opened}
              className={cn(
                "group/panel relative grid min-h-20 w-full min-w-0 shrink-0 overflow-hidden border-b border-foreground/20 bg-[#eeeae3] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-[#181a18] md:block md:h-full md:min-h-0 md:w-auto md:basis-(--archive-strip) md:grow-0 md:border-r md:border-b-0 md:last:border-r-0 md:transition-[flex-grow] md:duration-1000 md:data-[active=true]:grow motion-reduce:transition-none",
                opened ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden md:h-full">
                <div
                  id={`archive-panel-${index}`}
                  data-panel-content
                  tabIndex={-1}
                  role="region"
                  aria-label={title}
                  aria-hidden={!opened}
                  inert={!opened}
                  className={cn(
                    "relative w-full outline-none transition-[opacity,visibility] duration-400 md:h-full md:w-(--archive-open) md:overflow-y-auto md:overscroll-y-contain motion-reduce:transition-none",
                    opened
                      ? "visible opacity-100 delay-150 md:delay-200 motion-reduce:delay-0"
                      : "invisible opacity-0 delay-0",
                  )}
                >
                  {category ? (
                    <ArchiveProjectPanel active={opened} project={category} />
                  ) : (
                    <ArchiveAbout
                      active={opened}
                      onExplore={() => select(1, true)}
                    />
                  )}
                </div>
              </div>
              <button
                type="button"
                data-archive-select
                aria-expanded={opened}
                aria-controls={`archive-panel-${index}`}
                aria-label={t("open", { title })}
                onClick={() => select(index, true)}
                className={cn(
                  "group/strip absolute inset-0 flex cursor-pointer items-center justify-between gap-5 overflow-hidden px-6 py-5 md:flex-col md:px-0 md:py-7 transition-[background-color,opacity,visibility] duration-400 hover:bg-foreground/[0.045] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-tertiary motion-reduce:transition-none",
                  opened
                    ? "pointer-events-none invisible opacity-0"
                    : "visible opacity-100 delay-300 motion-reduce:delay-0",
                )}
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] text-foreground/55"
                >
                  [{number(index)}]
                </span>
                <span
                  aria-hidden="true"
                  className="flex-1 text-left text-lg leading-none font-medium tracking-[-0.045em] whitespace-nowrap md:flex-none md:rotate-180 md:text-[clamp(22px,2.4vw,38px)] md:[writing-mode:vertical-rl] md:[text-orientation:sideways]"
                >
                  {title}
                </span>
                <ArrowRight
                  size={22}
                  aria-hidden="true"
                  className="shrink-0 rotate-90 transition-transform duration-300 group-hover/strip:rotate-45 md:mb-16 md:rotate-0 md:group-hover/strip:-rotate-45 motion-reduce:transition-none"
                />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
