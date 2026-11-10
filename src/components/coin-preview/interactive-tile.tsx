"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Mesh, Texture } from "three";
import { BlueGlassMaterial, type GlassPalette } from "./blue-glass-material";
import { RotationMotion, VIEW_ROTATIONS, type Rotation, type TileView } from "./rotation-motion";

export type ViewRequest = { view: TileView; sequence: number; rotation?: Rotation };

export function InteractiveTile({ surface, request, palette, onTurn, objectRef, buffer }: {
  surface: RefObject<HTMLDivElement | null>;
  request: ViewRequest;
  palette: GlassPalette;
  onTurn: (view?: TileView) => void;
  objectRef?: RefObject<Mesh | null>;
  buffer?: Texture;
}) {
  const localMesh = useRef<Mesh>(null);
  const mesh = objectRef ?? localMesh;
  const [motion] = useState(() => new RotationMotion(request.rotation ?? VIEW_ROTATIONS[request.view]));
  const invalidate = useThree(state => state.invalidate);
  const reduced = useRef(false);
  const lastFrame = useRef(0);
  const cancelGesture = useRef<(() => void) | null>(null);

  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = preference.matches;
    let pointer: { id: number; x: number; y: number; touch: boolean; moved: boolean } | null = null;

    const wake = () => { lastFrame.current = performance.now(); invalidate(); };
    const clearPointer = () => {
      const id = pointer?.id;
      pointer = null;
      delete element.dataset.dragging;
      if (id !== undefined && element.hasPointerCapture(id)) element.releasePointerCapture(id);
    };
    const cancel = () => { clearPointer(); motion.stop(); wake(); };
    cancelGesture.current = () => { if (pointer) cancel(); };
    const changePreference = () => { reduced.current = preference.matches; cancel(); };
    const visibility = () => { if (document.hidden) cancel(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) cancel(); });
    observer.observe(element);

    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || pointer) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, touch: event.pointerType === "touch", moved: false };
      element.setPointerCapture(event.pointerId);
      element.focus({ preventScroll: true });
      element.dataset.dragging = "true";
      motion.grab(event.clientX, event.clientY, event.timeStamp);
      wake();
    };
    const move = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (!pointer.moved) {
        // Keep vertical touch movement available to the page immediately.
        if (pointer.touch && Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) { cancel(); return; }
        if (Math.hypot(dx, pointer.touch ? 0 : dy) < (pointer.touch ? 6 : 3)) return;
        pointer.moved = true;
        onTurn();
      }
      const samples = event.getCoalescedEvents?.() ?? [];
      for (const sample of samples.length ? samples : [event]) {
        motion.drag(sample.clientX, sample.clientY, sample.timeStamp, !pointer.touch);
      }
      wake();
    };
    const up = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (pointer.moved) motion.release(event.timeStamp, reduced.current);
      else motion.stop();
      clearPointer();
      wake();
    };
    const interrupted = (event: PointerEvent) => {
      if (pointer?.id === event.pointerId) cancel();
    };
    const key = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "Escape"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Escape") { cancel(); return; }
      clearPointer();
      onTurn(event.key === "Home" ? "perspective" : undefined);
      if (event.key === "Home") motion.goTo(request.rotation ?? VIEW_ROTATIONS.perspective, reduced.current);
      else {
        const step = event.shiftKey ? 0.1 : Math.PI / 12;
        motion.nudge(event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0,
          event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0, reduced.current);
      }
      wake();
    };

    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", interrupted);
    element.addEventListener("lostpointercapture", interrupted);
    element.addEventListener("keydown", key);
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", changePreference);
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", interrupted);
      element.removeEventListener("lostpointercapture", interrupted);
      element.removeEventListener("keydown", key);
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", changePreference);
      observer.disconnect();
      clearPointer();
      motion.stop();
      cancelGesture.current = null;
    };
  }, [surface, motion, invalidate, onTurn, request.rotation]);

  useEffect(() => {
    cancelGesture.current?.();
    motion.goTo(request.rotation ?? VIEW_ROTATIONS[request.view], reduced.current);
    lastFrame.current = performance.now();
    invalidate();
  }, [request, motion, invalidate]);

  useFrame(() => {
    const now = performance.now();
    const active = motion.advance(Math.min(0.05, Math.max(0, (now - lastFrame.current) / 1000)));
    lastFrame.current = now;
    mesh.current?.rotation.set(...motion.rotation);
    if (active) invalidate();
  }, -1); // Update the pose before any external refraction passes.

  return (
    <mesh ref={mesh}>
      <tileGeometry />
      <BlueGlassMaterial palette={palette} buffer={buffer} />
    </mesh>
  );
}
