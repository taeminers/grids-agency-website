"use client";

import { useEffect, useRef } from "react";
import type { ShaderMount } from "@paper-design/shaders";

/** A small client enhancement; the illustration and its base gradient render on the server. */
export default function IllustrationGradient({ className }: { className: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let shader: ShaderMount | undefined;
    let mounting = false;
    let failed = false;
    let visible = false;
    let cancelled = false;
    let revealFrame = 0;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");

    const updateSpeed = () => shader?.setSpeed(visible && !motion.matches && !failed ? .12 : 0);
    const onContextLost = () => {
      failed = true;
      delete element.dataset.ready;
      updateSpeed();
    };
    const mount = async () => {
      if (shader || mounting || failed || cancelled) return;
      mounting = true;
      try {
        const { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } = await import("@paper-design/shaders");
        if (cancelled || !visible) return;
        const colors = ["#eaf6ff", "#8bcff0", "#d8efff", "#e4dff2", "#f3d7e8"];
        shader = new ShaderMount(element, meshGradientFragmentShader, {
          u_colors: colors.map(getShaderColorFromString),
          u_colorsCount: colors.length,
          u_distortion: .45,
          u_swirl: .12,
          u_grainMixer: 0,
          u_grainOverlay: .035,
          u_fit: 2,
          u_rotation: 0,
          u_scale: 1,
          u_offsetX: 0,
          u_offsetY: 0,
          u_originX: .5,
          u_originY: .5,
          u_worldWidth: 0,
          u_worldHeight: 0,
        }, { alpha: false, antialias: false }, 0, 9000, 1, 900_000);
        shader.canvasElement.addEventListener("webglcontextlost", onContextLost);
        updateSpeed();
        // Reveal after the first paint, keeping the matching CSS gradient beneath it.
        revealFrame = requestAnimationFrame(() => {
          revealFrame = requestAnimationFrame(() => { element.dataset.ready = "true"; });
        });
      } catch {
        failed = true;
        shader?.dispose();
        shader = undefined;
        element.querySelector("canvas")?.remove();
      } finally {
        mounting = false;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) void mount();
      updateSpeed();
    }, { rootMargin: "120px" });
    observer.observe(element);
    motion.addEventListener("change", updateSpeed);

    return () => {
      cancelled = true;
      cancelAnimationFrame(revealFrame);
      observer.disconnect();
      motion.removeEventListener("change", updateSpeed);
      shader?.canvasElement.removeEventListener("webglcontextlost", onContextLost);
      shader?.dispose();
      delete element.dataset.ready;
    };
  }, []);

  return <div ref={ref} className={className} aria-hidden="true" data-illustration-shader />;
}
