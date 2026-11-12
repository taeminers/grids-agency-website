"use client";

import { Export, List, SidebarSimple, X } from "@phosphor-icons/react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IconButton } from "@/components/ui/action-button";
import { AgentComposer, type ComposerContextItem } from "@/components/ui/agent-composer";
import { Avatar } from "@/components/ui/agent-avatar";
import { KeyCombo } from "@/components/ui/key-hint";
import { ChatThread, type ThreadMessage } from "@/components/ui/chat-thread";
import {
  ContextWindowMeter,
  type ContextSegment,
} from "@/components/ui/context-window-meter";
import { ConversationList, type Conversation } from "@/components/ui/conversation-list";
import {
  PromptSuggestions,
  type PromptSuggestion,
} from "@/components/ui/prompt-suggestions";
import { Tooltip } from "@/components/ui/tooltip-hint";
import { EASE_OUT, instant as instantTransition, spring } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type AIChatData = {
  conversations: Conversation[];
  activeId?: string;
  /** Title of the open chat, shown in the header. */
  title: string;
  model: string;
  /** Thread turns; `content` can hold any component (tool calls, sources, feedback). */
  messages: ThreadMessage[];
  /** Follow-up chips under the last answer. */
  followUps?: PromptSuggestion[];
  /** Starter cards for an empty chat. */
  starters: PromptSuggestion[];
  context?: { limit: number; segments: ContextSegment[] };
  user: { name: string; avatar?: string };
};

export type AIChatProps = {
  data: AIChatData;
  status?: "idle" | "streaming";
  onSend?: (text: string, attachments: ComposerContextItem[]) => void;
  userAvatar?: React.ReactNode;
  renderAvatar?: (message: ThreadMessage) => React.ReactNode;
  onSelectPrompt?: (prompt: string) => void;
  onStop?: () => void;
  onNewChat?: () => void;
  onSelectConversation?: (conversation: Conversation) => void;
  onShare?: () => void;
  /** Whether the history sidebar is shown at wide widths. Toggle with the button or Cmd/Ctrl + backslash. */
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  allowAttachments?: boolean;
  className?: string;
};

/**
 * A full chat screen. Lays out against its own width (container queries), so it
 * works full screen, in a split view or inside a preview frame: from 56rem the
 * history is a sidebar, below it opens as an in-place drawer. The conversation is
 * one vertical scroll and the composer stays pinned over its bottom edge.
 */
export function AIChat({
  data,
  status = "idle",
  onSend,
  onSelectPrompt,
  userAvatar,
  renderAvatar,
  onStop,
  onNewChat,
  onSelectConversation,
  onShare,
  sidebarOpen: sidebarOpenProp,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  allowAttachments = true,
  className,
}: AIChatProps) {
  const t = useTranslations("Pricing.examples.chat.ui");
  const { conversations, activeId, title, model, messages, followUps, starters } = data;
  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  const [sidebarOwn, setSidebarOwn] = useState(defaultSidebarOpen);
  const sidebarOpen = sidebarOpenProp ?? sidebarOwn;
  // Keyboard toggles (shortcut or Enter/Space) and reduced motion skip the animation.
  const [sidebarInstant, setSidebarInstant] = useState(false);
  const reduce = useReducedMotion();
  const historyId = useId();
  const historyTrigger = useRef<HTMLButtonElement>(null);
  const toggleSidebar = (fromKeyboard: boolean) => {
    setSidebarInstant(fromKeyboard || !!reduce);
    const next = !sidebarOpen;
    setSidebarOwn(next);
    onSidebarOpenChange?.(next);
  };
  const empty = messages.length === 0;
  const dock = useRef<HTMLDivElement>(null);
  const [inset, setInset] = useState(140);

  // The thread keeps this much room free under its last message for the composer.
  useEffect(() => {
    const el = dock.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setInset(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const send = (text: string, attachments: ComposerContextItem[] = []) => {
    if (!text.trim()) return;
    onSend?.(text.trim(), attachments);
    setDraft("");
  };

  const sidebarToggle = (align: "start" | "end") => (
    <Tooltip
      side="bottom"
      align={align}
      content={
        <span className="flex items-center gap-2">
          {t(sidebarOpen ? "hideSidebar" : "showSidebar")}
          <KeyCombo keys={"mod+\\"} />
        </span>
      }
    >
      <IconButton
        icon={SidebarSimple}
        label={t(sidebarOpen ? "hideSidebar" : "showSidebar")}
        aria-expanded={sidebarOpen}
        aria-controls={historyId}
        aria-keyshortcuts={"Meta+\\ Control+\\"}
        onClick={(event) => toggleSidebar(event.detail === 0)}
        className="hidden @4xl/chat:inline-flex"
      />
    </Tooltip>
  );

  // In the open sidebar the hide toggle sits in its own header; the drawer copy has none.
  const history = (withToggle: boolean) => (
    <ConversationList
      headerAction={withToggle ? sidebarToggle("end") : undefined}
      data={conversations}
      activeId={activeId}
      onNew={() => {
        setHistoryOpen(false);
        setDraft("");
        onNewChat?.();
      }}
      onSelect={(conversation) => {
        setHistoryOpen(false);
        onSelectConversation?.(conversation);
      }}
      className="max-w-none"
    />
  );

  return (
    <MotionConfig reducedMotion="user">
      <div
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "\\") {
            event.preventDefault();
            toggleSidebar(true);
          }
        }}
        className={cn(
          "@container/chat relative flex h-full w-full overflow-hidden bg-background text-foreground",
          className,
        )}
      >
        <motion.aside
          id={historyId}
          aria-label={t("history")}
          aria-hidden={!sidebarOpen || undefined}
          inert={!sidebarOpen}
          initial={false}
          animate={{ width: sidebarOpen ? 288 : 0 }}
          transition={sidebarInstant ? instantTransition : spring}
          className="hidden shrink-0 overflow-hidden @4xl/chat:block"
        >
          <motion.div
            initial={false}
            animate={{ x: sidebarOpen ? 0 : -24, opacity: sidebarOpen ? 1 : 0 }}
            transition={sidebarInstant ? instantTransition : spring}
            className="h-full w-72 overflow-y-auto p-3 pr-0"
          >
            {history(true)}
          </motion.div>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 px-3 @md/chat:px-5">
            <IconButton
              ref={historyTrigger}
              icon={List}
              iconWeight="bold"
              label={t("openHistory")}
              onClick={() => setHistoryOpen(true)}
              className="@4xl/chat:hidden"
            />
            {!sidebarOpen && sidebarToggle("start")}
            <h2 className="min-w-0 truncate text-[0.9375rem] font-medium">
              {empty ? t("newChat") : title}
            </h2>
            <div className="ml-auto flex items-center gap-1.5">
              {!empty && onShare && (
                <IconButton icon={Export} label={t("share")} onClick={onShare} />
              )}
              {userAvatar ?? <Avatar name={data.user.name} src={data.user.avatar} size="sm" />}
            </div>
          </header>

          {/* One scroll for the conversation; the composer is pinned over its bottom. */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {empty ? (
              <div className="h-full overflow-y-auto overscroll-contain">
                <div
                  className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-3 pt-6 @md/chat:px-5"
                  style={{ paddingBottom: inset + 24 }}
                >
                  <PromptSuggestions
                    data={starters}
                    variant="cards"
                    heading={t("starterHeading")}
                    onSelect={(_, prompt) => onSelectPrompt ? onSelectPrompt(prompt) : send(prompt)}
                    className="mx-auto max-w-2xl"
                  />
                </div>
              </div>
            ) : (
              <div className="absolute inset-x-0 top-0" style={{ bottom: inset }}>
              <ChatThread
                key={activeId}
                bare
                renderAvatar={renderAvatar}
                data={{ messages }}
                agentName={model}
                userName={data.user.name}
                contentClassName="mx-auto w-full max-w-3xl @md/chat:px-5"
                footer={
                  followUps &&
                  followUps.length > 0 &&
                  status === "idle" && (
                    <PromptSuggestions
                      data={followUps}
                      variant="chips"
                      onSelect={(_, prompt) => onSelectPrompt ? onSelectPrompt(prompt) : send(prompt)}
                      className="mt-3 max-w-none pl-9"
                    />
                  )
                }
              />
              </div>
            )}

            <div
              ref={dock}
              className="absolute inset-x-0 bottom-0 bg-background before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-background before:to-transparent"
            >
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-3 pt-1 pb-3 @md/chat:px-5 @md/chat:pb-5">
                <AgentComposer
                  key={activeId}
                  value={draft}
                  onValueChange={setDraft}
                  showModes={false}
                  status={status}
                  onSubmit={(message) => send(message.text, message.context)}
                  queueWhileStreaming={false}
                  onStop={onStop}
                  placeholder={t(empty ? "placeholder" : "replyPlaceholder")}
                  allowAttachments={allowAttachments}
                  className="max-w-none"
                />
                {data.context && (
                  <div className="px-1">
                    <ContextWindowMeter
                      variant="bar"
                      data={{ ...data.context, model }}
                      warnAt={0.8}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <HistoryDrawer open={historyOpen} onClose={closeHistory} returnFocus={historyTrigger}>
          {history(false)}
        </HistoryDrawer>
      </div>
    </MotionConfig>
  );
}

/**
 * History as a drawer that stays inside the screen (not a page-level portal), so
 * it behaves the same full screen and inside a scaled preview.
 */
function HistoryDrawer({
  open,
  onClose,
  children,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  returnFocus?: React.RefObject<HTMLElement | null>;
}) {
  const t = useTranslations("Pricing.examples.chat.ui");
  const panel = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previousFocus = returnFocus?.current ?? document.activeElement;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open, onClose, returnFocus]);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-20 @4xl/chat:hidden">
          <motion.button
            type="button"
            aria-label={t("closeHistory")}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={t("history")}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { x: "-105%" }}
            animate={{
              x: 0,
              opacity: 1,
              transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
            }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { x: "-105%", transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }
            }
            className="absolute inset-y-2 left-2 flex w-[min(20rem,calc(100%-3rem))] flex-col overflow-y-auto rounded-[var(--site-card-radius)] bg-background p-1.5 outline-none"
          >
            <div className="flex justify-end px-1.5 pt-1.5">
              <IconButton icon={X} iconWeight="bold" label={t("close")} onClick={onClose} />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
