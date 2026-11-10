"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RibbonMotion } from "./ribbon-motion";

export type RibbonPlayback = {
  paused: boolean;
  reduced: boolean;
  resetRequest: number;
  onPauseChange: (paused: boolean) => void;
};

export function useRibbonInteraction({ surface, paused, reduced, resetRequest, period, onPauseChange }: RibbonPlayback & {
  surface: RefObject<HTMLDivElement | null>;
  period: number;
}) {
  const [motion] = useState(() => new RibbonMotion());
  const invalidate = useThree(state => state.invalidate);
  const lastFrame = useRef(0);
  const playback = useRef({ paused, reduced, inView: false, visible: true });
  const periodRef = useRef(period);
  const cancelPointer = useRef<(() => void) | null>(null);

  useEffect(() => { periodRef.current = period; }, [period]);
  useEffect(() => {
    playback.current.paused = paused;
    playback.current.reduced = reduced;
    cancelPointer.current?.();
    motion.stop();
    lastFrame.current = performance.now();
    invalidate();
  }, [paused, reduced, motion, invalidate]);

  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    let pointer: { id: number; x: number; y: number; touch: boolean; moved: boolean } | null = null;
    const wake = () => { lastFrame.current = performance.now(); invalidate(); };
    const clear = () => {
      const id = pointer?.id;
      pointer = null;
      delete element.dataset.dragging;
      if (id !== undefined && element.hasPointerCapture(id)) element.releasePointerCapture(id);
    };
    const cancel = () => { clear(); motion.stop(); };
    cancelPointer.current = cancel;
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || pointer) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, touch: event.pointerType === "touch", moved: false };
      element.setPointerCapture(event.pointerId);
      element.focus({ preventScroll: true });
      element.dataset.dragging = "true";
      motion.grab(event.clientX, element.clientWidth, event.timeStamp);
      wake();
    };
    const move = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = Math.abs(event.clientX - pointer.x);
      const dy = Math.abs(event.clientY - pointer.y);
      if (!pointer.moved) {
        if (pointer.touch && dy > 6 && dy > dx) { cancel(); wake(); return; }
        if (dx < (pointer.touch ? 6 : 3)) return;
        pointer.moved = true;
      }
      const samples = event.getCoalescedEvents?.() ?? [];
      for (const sample of samples.length ? samples : [event]) motion.drag(sample.clientX, sample.timeStamp);
      wake();
    };
    const up = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (pointer.moved) motion.release(event.timeStamp, playback.current.reduced);
      else motion.stop();
      clear(); wake();
    };
    const cancelled = () => { if (pointer) { cancel(); wake(); } };
    const key = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "Escape", " "].includes(event.key)) return;
      if (event.key === " " && playback.current.reduced) return;
      event.preventDefault(); clear();
      if (event.key === " " || event.key === "Escape") {
        motion.stop(); onPauseChange(event.key === "Escape" || !playback.current.paused);
      } else if (event.key === "Home") motion.reset(periodRef.current, playback.current.reduced);
      else motion.nudge((event.key === "ArrowLeft" ? -1 : 1) * (event.shiftKey ? 0.025 : 0.09), playback.current.reduced);
      wake();
    };
    const blur = () => { playback.current.visible = false; cancel(); };
    const focus = () => { playback.current.visible = !document.hidden; wake(); };
    const visibility = () => { if (document.hidden) blur(); else focus(); };
    const observer = new IntersectionObserver(([entry]) => {
      playback.current.inView = entry.isIntersecting && entry.intersectionRatio > 0.05;
      if (playback.current.inView) wake(); else cancel();
    }, { threshold: [0, 0.05] });
    observer.observe(element);
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", cancelled);
    element.addEventListener("lostpointercapture", cancelled);
    element.addEventListener("keydown", key);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect(); cancel(); cancelPointer.current = null;
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", cancelled);
      element.removeEventListener("lostpointercapture", cancelled);
      element.removeEventListener("keydown", key);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [surface, motion, invalidate, onPauseChange]);

  useEffect(() => {
    cancelPointer.current?.();
    motion.reset(periodRef.current, playback.current.reduced);
    lastFrame.current = performance.now();
    invalidate();
  }, [resetRequest, motion, invalidate]);

  useFrame(() => {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0, (now - lastFrame.current) / 1000));
    lastFrame.current = now;
    const state = playback.current;
    if (!state.visible || !state.inView) return;
    if (motion.advance(dt, !state.paused && !state.reduced)) invalidate();
  });
  return motion;
}
