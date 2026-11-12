"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { EnvelopeSimple, Receipt, Truck } from "@phosphor-icons/react";
import { AIChat, type AIChatData } from "@/components/ai-chat";
import FallbackAvatar from "@/components/fallback-avatar";
import Dots08 from "@/components/shadcn-space/dots/dots-08";
import type { ComposerContextItem } from "@/components/ui/agent-composer";
import PricingAutomationScenario, { scenarioIds, type ScenarioId, type ChatScenario } from "./pricing-automation-scenario";
import styles from "./pricing-automation-demo.module.css";

import type { ExamplePreviewDevice } from "./pricing-example-viewport";

const topics = scenarioIds;
type Topic = ScenarioId;
type Turn = { id: string; role: "user" | "assistant"; text: string; at: string; streaming?: boolean; topic?: Topic; completedSteps?: number; complete?: boolean };
type DemoConversation = { id: string; title: string; updatedAt: string; turns: Turn[] };

function ChatSession({ device }: { device: ExamplePreviewDevice }) {
  const t = useTranslations("Pricing.examples.chat");
  const scenarios = t.raw("topics") as Record<Topic, ChatScenario>;
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const [conversations, setConversations] = useState<DemoConversation[]>(() => {
    const at = new Date().toISOString();
    return [{ id: "welcome", title: t("ui.newChat"), updatedAt: at, turns: [] }, ...topics.map<DemoConversation>((topic) => ({
      id: topic,
      title: t(`topics.${topic}.title`),
      updatedAt: at,
      turns: [],
    }))];
  });
  const [activeId, setActiveId] = useState<string>("welcome");
  const active = conversations.find((conversation) => conversation.id === activeId)!;

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setStreamingId(null);
    setConversations((current) => current.map((conversation) => ({
      ...conversation,
      turns: conversation.turns.map((turn) => turn.streaming ? { ...turn, streaming: false } : turn),
    })));
  };

  const playResponse = (conversationId: string, answerId: string, answer: string, topic?: Topic) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setStreamingId(answerId);
    const characters = Array.from(answer);
    const stepCount = topic ? scenarios[topic].steps.length : 0;
    const startsAt = performance.now() + 220;
    let count = 0;
    let previousStep = -1;
    timer.current = setInterval(() => {
      const elapsed = performance.now() - startsAt;
      if (elapsed < 0) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const completedSteps = reduced ? stepCount : Math.min(Math.floor(elapsed / 800), stepCount);
      const nextCount = reduced ? characters.length : completedSteps === stepCount ? Math.min(count + 2, characters.length) : 0;
      if (nextCount === count && completedSteps === previousStep) return;
      count = nextCount;
      previousStep = completedSteps;
      const done = completedSteps === stepCount && count === characters.length;
      const revealed = characters.slice(0, count).join("");
      setConversations((current) => current.map((conversation) => conversation.id !== conversationId ? conversation : {
        ...conversation,
        turns: conversation.turns.map((turn) => turn.id === answerId ? { ...turn, text: revealed, streaming: !done, completedSteps, complete: done } : turn),
      }));
      if (done) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setStreamingId(null);
      }
    }, 32);
  };

  const selectConversation = (id: string) => {
    stop();
    setActiveId(id);
    const topic = topics.find((topic) => topic === id);
    if (!topic) return;
    const at = new Date().toISOString();
    const answer = scenarios[topic].answer;
    const turnId = ++sequence.current;
    const answerId = `assistant-${turnId}`;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setConversations((current) => current.map((conversation) => conversation.id !== id ? conversation : {
      ...conversation,
      updatedAt: at,
      turns: [
        { id: `user-${turnId}`, role: "user", text: scenarios[topic].question, at },
        { id: answerId, role: "assistant", text: reduced ? answer : "", at, streaming: !reduced, topic, completedSteps: reduced ? scenarios[topic].steps.length : 0, complete: reduced },
      ],
    }));
    playResponse(id, answerId, answer, topic);
  };

  const send = (text: string, attachments: ComposerContextItem[] = [], sampleTopic?: Topic) => {
    const trimmed = text.trim();
    if (!trimmed || timer.current) return;
    const at = new Date().toISOString();
    const id = ++sequence.current;
    const answer = sampleTopic ? scenarios[sampleTopic].answer : t("fallback");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prompt = attachments.length ? `${trimmed}\n\n${t("ui.attachedFiles")}: ${attachments.map((file) => file.name).join(", ")}` : trimmed;
    const turns: Turn[] = [
      { id: `user-${id}`, role: "user", text: prompt, at },
      { id: `assistant-${id}`, role: "assistant", text: reduced ? answer : "", at, streaming: !reduced, topic: sampleTopic, completedSteps: reduced && sampleTopic ? scenarios[sampleTopic].steps.length : 0, complete: reduced },
    ];
    setConversations((current) => current.map((conversation) => conversation.id !== activeId ? conversation : {
      ...conversation,
      title: conversation.turns.length ? conversation.title : trimmed.slice(0, 40),
      updatedAt: at,
      turns: [...conversation.turns, ...turns],
    }));
    playResponse(activeId, `assistant-${id}`, answer, sampleTopic);
  };

  const newChat = () => {
    stop();
    const id = `new-${++sequence.current}`;
    setConversations((current) => [{ id, title: t("ui.newChat"), updatedAt: new Date().toISOString(), turns: [] }, ...current]);
    setActiveId(id);
  };

  const data: AIChatData = {
    title: active.title,
    model: t("agent"),
    user: { name: t("user") },
    conversations: conversations.map(({ id, title, updatedAt }) => ({ id, title, updatedAt })),
    activeId,
    messages: active.turns.map(({ text, ...turn }) => {
      const reply = <p className={styles.message}>{turn.streaming ? Array.from(text).map((letter, index) => <span key={index} className={styles.letter}>{letter}</span>) : text}</p>;
      return { ...turn, content: turn.topic ? <PricingAutomationScenario key={turn.id} scenario={scenarios[turn.topic]} completedSteps={turn.completedSteps ?? 0} streaming={!!turn.streaming} complete={!!turn.complete}>{reply}</PricingAutomationScenario> : reply };
    }),
    context: { limit: 8192, segments: [{ id: "conversation", label: t("ui.conversation"), tokens: active.turns.reduce((sum, turn) => sum + Math.ceil(Array.from(turn.text).reduce((n, character) => n + (character.charCodeAt(0) > 127 ? 0.7 : 0.25), 0)), 0) }] },
    starters: topics.map((topic, index) => ({
      id: topic,
      title: t(`topics.${topic}.title`),
      hint: t(`topics.${topic}.hint`),
      prompt: t(`topics.${topic}.question`),
      icon: [Receipt, EnvelopeSimple, Truck][index],
    })),
    followUps: topics.map((topic) => ({ id: topic, title: t(`topics.${topic}.title`), prompt: t(`topics.${topic}.question`) })),
  };

  return (
    <div className={styles.demo} data-pricing-automation data-device={device}>
      <AIChat data={data} onSend={send} onNewChat={newChat}
        onSelectPrompt={(prompt) => send(prompt, [], topics.find((topic) => t(`topics.${topic}.question`) === prompt))}
        status={streamingId ? "streaming" : "idle"} onStop={stop}
        onSelectConversation={({ id }) => selectConversation(id)}
        userAvatar={<FallbackAvatar name="GRIDS Growth" size={28} animated />}
        renderAvatar={(message) => message.role === "user"
          ? <FallbackAvatar name="GRIDS Growth" size={28} animated />
          : <span aria-hidden="true" className={styles.assistantAvatar}><Dots08 size={36} followCursor={false} /></span>}
      />
    </div>
  );
}

export default function PricingAutomationDemo({ device = "desktop" }: { device?: ExamplePreviewDevice }) {
  const locale = useLocale();
  return <ChatSession key={locale} device={device} />;
}
