"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { archiveProjects } from "./archive-project-data";
import { ArchiveProjectMedia } from "./archive-project-media";
import { ArchiveProjectSheet } from "./archive-project-sheet";

export function ArchiveGrid({ initialProjectSlug }: { initialProjectSlug?: string }) {
  const t = useTranslations("Archive");
  const locale = useLocale();
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState(initialProjectSlug ?? null);
  const [detailOpen, setDetailOpen] = useState(Boolean(initialProjectSlug));
  const selectedIndex = archiveProjects.findIndex((project) => project.slug === selectedSlug);

  useEffect(() => {
    // Only direct project URLs need a route change when dismissed. Normal card
    // clicks are local dialog state, so the grid and its scroll position persist.
    if (!initialProjectSlug || detailOpen) return;
    const timer = window.setTimeout(() => {
      router.replace(`/${locale}/archive`, { scroll: false });
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200);
    return () => window.clearTimeout(timer);
  }, [initialProjectSlug, detailOpen, locale, router]);

  return (
    <section className="mx-auto max-w-[1920px] px-5 pt-32 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-8 md:px-12 md:pt-40 lg:px-16">
      <header className="mb-10 grid items-start gap-6 md:grid-cols-2 md:gap-12">
        <h1 className="text-4xl leading-tight font-medium tracking-[-0.05em] sm:text-5xl lg:text-6xl">
          {t("Index.title")}
        </h1>
        <div className="max-w-xl space-y-3 text-xs leading-relaxed text-muted-foreground md:justify-self-end">
          <p>{t("Gallery.disclosure.client.description")}</p>
          <p>{t("Gallery.disclosure.internal.description")}</p>
          <p>{t("Gallery.disclosure.nda.description")}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-12">
        {archiveProjects.map((project) => {
          const title = project.title ?? t(`${project.namespace}.projectTitle`);
          return (
            <Link key={project.key} href={`/${locale}/archive/${project.slug}`} data-archive-project={project.slug} onClick={(event) => {
              if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              setSelectedSlug(project.slug);
              setDetailOpen(true);
            }} scroll={false} prefetch={false} className="group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-foreground" aria-label={t("Index.open", { title })}>
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <ArchiveProjectMedia project={project} title={title} active={!detailOpen} className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transform-none" />
                <span aria-hidden="true" className="absolute right-3 bottom-3 flex size-9 items-center justify-center bg-background text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><ArrowUpRight size={18} /></span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg leading-tight font-medium tracking-[-0.03em]">{title}</h2>
                  <p className="mt-1.5 text-xs text-muted-foreground">{t(`${project.namespace}.title`)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {selectedIndex !== -1 && (
        <ArchiveProjectSheet
          key={selectedSlug}
          project={archiveProjects[selectedIndex]}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </section>
  );
}
