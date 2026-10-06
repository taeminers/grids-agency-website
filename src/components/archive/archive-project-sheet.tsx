"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import type { ArchiveProject } from "./archive-project-data";
import { ArchiveProjectPanel } from "./archive-project-panel";

export function ArchiveProjectSheet({
  project,
  open,
  onOpenChange,
}: {
  project: ArchiveProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations(`Archive.${project.namespace}`);
  const closeButton = useRef<HTMLButtonElement>(null);
  const title = project.title ?? t("projectTitle");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200 motion-reduce:animate-none" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            closeButton.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.querySelector<HTMLElement>(`[data-archive-project="${project.slug}"]`)?.focus({ preventScroll: true });
          }}
          className="fixed inset-x-0 bottom-0 z-[70] mx-auto flex h-[calc(100dvh-20px)] max-w-[1800px] flex-col overflow-hidden rounded-t-2xl border border-b-0 border-white/15 bg-[#141614] text-[#f5f3ec] shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:duration-500 data-[state=open]:ease-out data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:duration-200 motion-reduce:animate-none md:inset-x-5 md:h-[calc(100dvh-40px)] md:rounded-t-3xl"
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div className="relative flex h-9 shrink-0 items-center justify-end border-b border-white/10 px-2 sm:px-3">
            <span aria-hidden="true" className="absolute left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/25" />
            <Dialog.Close ref={closeButton} aria-label={t("close")} className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <X size={16} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-clip pb-[env(safe-area-inset-bottom)]">
            <ArchiveProjectPanel fitToSheet active={open} project={project} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
