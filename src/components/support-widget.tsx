// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { CaretDown, ChatCircleDots, PaperPlaneRight, X } from "@phosphor-icons/react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { IconButton } from "@/components/ui/action-button";
import { Avatar } from "@/components/ui/agent-avatar";
import { ChatThread, type ThreadMessage } from "@/components/ui/chat-thread";
import { Spinner, Thinking } from "@/components/ui/loader";
import {
  PromptSuggestions,
  type PromptSuggestion,
} from "@/components/ui/prompt-suggestions";
import { ResponseFeedback } from "@/components/ui/response-feedback";
import { TextField } from "@/components/ui/text-field";
import { EASE_OUT } from "@/lib/motion-tokens";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type SupportPerson = { name: string; avatar?: string; role?: string };

export type SupportWidgetData = {
  /** The bot that answers first. */
  bot: SupportPerson;
  /** The person who takes over after a handoff. */
  human?: SupportPerson;
  /** The visitor, shown on their own messages. */
  visitor: { name: string };
  /** Turns; set `author` to the human's name for messages written by a person. */
  messages: ThreadMessage[];
  /** Quick replies under the last bot message. */
  quickReplies?: PromptSuggestion[];
  /**
   * `typing` shows the bot composing, `waiting` the queue for a person, `human`
   * switches the header to the person who joined.
   */
  mode?: "bot" | "typing" | "waiting" | "human";
  /** Queue hint while waiting, e.g. "~2 min". */
  wait?: string;
  /** Ask for a rating at the end of the conversation. */
  askRating?: boolean;
  /** Count on the launcher while the panel is closed. */
  unread?: number;
};

export type SupportWidgetProps = {
  data: SupportWidgetData;
  /** The host page the widget sits on. */
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Close ends the conversation; minimising just hides the panel. */
  onClose?: () => void;
  onSend?: (text: string) => void;
  onQuickReply?: (prompt: string) => void;
  busy?: boolean;
  botAvatar?: React.ReactNode;
  launcherIcon?: React.ReactNode;
  renderAvatar?: (message: ThreadMessage) => React.ReactNode;
  onRate?: (feedback: {
    rating: number | "up" | "down";
    reasons: string[];
    note: string;
  }) => void;
  className?: string;
};

const pop = { type: "spring", duration: 0.35, bounce: 0 } as const;

/**
 * A support chat embedded on a site: a launcher in the corner opens a panel that
 * grows out of it. From 28rem wide the panel floats over the page; below that it
 * fills the screen. The thread is the panel's one scroll and the composer stays
 * pinned at its bottom.
 */
export function SupportWidget({
  data,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onClose,
  onSend,
  onQuickReply,
  botAvatar,
  busy: busyProp,
  launcherIcon,
  renderAvatar,
  onRate,
  className,
}: SupportWidgetProps) {
  const t = useTranslations("Pricing.examples.support.ui");
  const { bot, human, visitor, messages, quickReplies, mode = "bot" } = data;
  const [own, setOwn] = useState(defaultOpen);
  const open = openProp ?? own;
  const [draft, setDraft] = useState("");
  const panelId = useId();
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [compact, setCompact] = useState(false);
  const busy = busyProp ?? (mode === "typing" || mode === "waiting");

  const setOpen = (next: boolean) => {
    setOwn(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 448));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const launcherElement = launcher.current;
    const active = document.activeElement;
    const previousFocus = opener.current ?? (active instanceof HTMLElement && active !== document.body && active !== document.documentElement ? active : launcherElement);
    input.current?.focus({ preventScroll: true });
    return () => {
      const target = previousFocus instanceof HTMLElement && previousFocus.isConnected ? previousFocus : launcherElement;
      target?.focus({ preventScroll: true });
      opener.current = null;
    };
  }, [open]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    onSend?.(text.trim());
    setDraft("");
  };

  const speaker = mode === "human" && human ? human : bot;

  const footer = (
    <div className="flex flex-col gap-3 pt-1">
      {mode === "typing" && !messages.some((message) => message.streaming) && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Thinking size="sm" />
          <span className="sr-only">{t("typing", { name: bot.name })}</span>
        </div>
      )}
      {mode === "waiting" && (
        <div
          role="status"
          className="mx-auto flex items-center gap-2 rounded-full bg-foreground/[0.05] px-3 py-1.5 text-[0.8125rem] text-muted-foreground"
        >
          <Spinner size="sm" label={t("waiting")} />
          {t("waiting")}{data.wait ? ` · ${data.wait}` : ""}
        </div>
      )}
      {mode === "bot" && quickReplies && quickReplies.length > 0 && (
        <PromptSuggestions
          data={quickReplies}
          variant="chips"
          onSelect={(_, prompt) => onQuickReply ? onQuickReply(prompt) : send(prompt)}
          className="max-w-none"
        />
      )}
      {data.askRating && (
        <ResponseFeedback variant="detailed" onSubmit={onRate} className="max-w-none" />
      )}
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={root}
        className={cn(
          "@container/support relative h-full w-full overflow-hidden bg-background text-foreground",
          className,
        )}
      >
        <div className="h-full overflow-y-auto">{children}</div>

        <AnimatePresence>
          {open && (
            <motion.section
              key="panel"
              ref={panel}
              data-support-panel
              id={panelId}
              role="dialog"
              aria-label={t("chatWith", { name: speaker.name })}
              aria-modal={compact || undefined}
              onKeyDown={(event) => {
                if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); }
                if (!compact || event.key !== "Tab") return;
                const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => element.getClientRects().length > 0);
                const first = controls[0], last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: pop }}
              exit={{
                opacity: 0,
                scale: 0.94,
                transition: { duration: 0.15, ease: EASE_OUT },
              }}
              style={{ transformOrigin: "bottom right" }}
              className={cn(
                "absolute inset-2 z-20 flex flex-col overflow-hidden rounded-[var(--site-card-radius)] border border-foreground/10 bg-surface-inset",
                "@md/support:inset-auto @md/support:right-5 @md/support:bottom-24 @md/support:h-[min(36rem,calc(100%-7.5rem))] @md/support:w-[23.5rem]",
                "shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]",
              )}
            >
              <header className="flex shrink-0 items-center gap-2 border-b border-foreground/[0.07] p-3">
                {speaker === bot && botAvatar ? botAvatar : <Avatar
                  name={speaker.name}
                  src={speaker.avatar}
                  kind={speaker === bot ? "agent" : "person"}
                  size="md"
                />}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[0.9375rem] font-medium">
                    {speaker.name}
                  </h2>
                  <p className="truncate text-[0.8125rem] text-muted-foreground">
                    {speaker === bot
                      ? mode === "typing" ? t("writing") : (bot.role ?? t("instant"))
                      : (speaker.role ?? t("supportTeam"))}
                  </p>
                </div>
                <IconButton
                  icon={CaretDown}
                  iconWeight="bold"
                  label={t("minimize")}
                  onClick={() => setOpen(false)}
                />
                <IconButton
                  icon={X}
                  iconWeight="bold"
                  label={t("endChat")}
                  onClick={() => {
                    setOpen(false);
                    setDraft("");
                    onClose?.();
                  }}
                />
              </header>

              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-inset">
                <div className="min-h-0 flex-1">
                <ChatThread
                  bare
                  density="dense"
                  data={{ messages }}
                  agentName={bot.name}
                  userName={visitor.name}
                  contentClassName="px-3"
                  renderAvatar={(message) =>
                    renderAvatar?.(message) ?? (message.role === "user" ? undefined : message.author &&
                      message.author === human?.name ? (
                      <Avatar
                        name={human.name}
                        src={human.avatar}
                        size="sm"
                        kind="person"
                      />
                    ) : (
                      <Avatar name={bot.name} src={bot.avatar} size="sm" kind="agent" />
                    ))
                  }
                  footer={footer}
                />
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    send(draft);
                  }}
                  className="flex shrink-0 items-center gap-2 border-t border-foreground/[0.06] bg-surface-inset p-3"
                >
                  <TextField
                    ref={input}
                    aria-label={t("message")}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={
                      mode === "waiting"
                        ? t("waitingPlaceholder")
                        : t("placeholder")
                    }
                    className="min-w-0 flex-1"
                  />
                  <IconButton
                    type="submit"
                    icon={PaperPlaneRight}
                    label={t("send")}
                    variant="quiet"
                    className="rounded-[5px] bg-foreground text-background hover:bg-foreground/90"
                    size="md"
                    disabled={!draft.trim() || busy}
                  />
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.button
          ref={launcher}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={t(open ? "hideChat" : "openChat")}
          onClick={() => {
            if (!open) opener.current = launcher.current;
            setOpen(!open);
          }}
          className={cn(
            "absolute right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full bg-foreground text-background",
            "shadow-[0_12px_30px_-12px_rgba(0,0,0,0.5)] transition-[scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95]",
            open && "@max-md/support:hidden",
          )}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={open ? "close" : "chat"}
              initial={{ opacity: 0, scale: 0.9, rotate: open ? -45 : 45 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: { duration: 0.2, ease: EASE_OUT },
              }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
              className="flex"
            >
              {open ? (
                <CaretDown weight="bold" className="size-6" aria-hidden="true" />
              ) : (
                launcherIcon ?? <ChatCircleDots weight="fill" className="size-7" aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
          {!open && !!data.unread && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-negative px-1.5 text-[0.6875rem] font-semibold text-white tabular-nums">
              {data.unread}
              <span className="sr-only"> {t("unread")}</span>
            </span>
          )}
        </motion.button>
      </div>
    </MotionConfig>
  );
}
