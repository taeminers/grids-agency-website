"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import type { MotionValue } from "framer-motion";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei/core/OrthographicCamera";
import { useFBO } from "@react-three/drei/core/Fbo";
import { BackSide, Color, FrontSide, NoToneMapping, type Group, type Mesh, type MeshPhysicalMaterial, type Texture } from "three";
import { TileGeometry } from "./coin-preview/tile-geometry";
import { GlassStudio, readGlassPalette, type GlassPalette } from "./coin-preview/blue-glass-material";
import { InteractiveTile, type ViewRequest } from "./coin-preview/interactive-tile";
import { getRibbonArrangement, sampleRibbon } from "./coin-preview/tile-arrangement";
import styles from "./footer-cube.module.css";

extend({ TileGeometry });
// Use an actual hero tile's optical scale and pose, rather than the older
// single-tile study, whose opposite-facing surface reflects the dark studio.
const heroTile = sampleRibbon(getRibbonArrangement(2.5), .15, 0);
const request: ViewRequest = { view: "perspective", sequence: 0, rotation: heroTile.rotation };
const onTurn = () => {};
type Glass = MeshPhysicalMaterial & { buffer: Texture };

function SceneSetup({ onFailure }: { onFailure: () => void }) {
  const size = useThree(state => state.size);
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  return <OrthographicCamera makeDefault position={[0, 0, 20]} zoom={Math.min(size.width, size.height) * .31 / heroTile.scale} near={.1} far={100} />;
}

function FloatingTile({ surface, palette, onReady, background: backdropColor }: {
  surface: RefObject<HTMLDivElement | null>;
  palette: GlassPalette;
  onReady: () => void;
  background: MotionValue<string>;
}) {
  const mesh = useRef<Mesh>(null);
  const group = useRef<Group>(null);
  const idle = useRef({ visible: false, reduced: false, time: 0 });
  const frames = useRef(0);
  const ready = useRef(false);
  const size = useThree(state => state.size);
  const invalidate = useThree(state => state.invalidate);
  const bufferWidth = Math.max(1, Math.round(size.width * 1.25));
  const bufferHeight = Math.max(1, Math.round(size.height * 1.25));
  const backdrop = useFBO(bufferWidth, bufferHeight);
  const backfaces = useFBO(bufferWidth, bufferHeight);

  // One animated color drives the DOM and the opaque WebGL canvas, including
  // refraction. Repaint even when idle motion is paused or reduced.
  useEffect(() => backdropColor.on("change", () => invalidate()), [backdropColor, invalidate]);

  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { idle.current.reduced = preference.matches; invalidate(); };
    sync();
    const observer = new IntersectionObserver(([entry]) => {
      idle.current.visible = entry.isIntersecting;
      invalidate();
    });
    observer.observe(element);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    // Resume after a keyboard user leaves the object.
    element.addEventListener("blur", sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      element.removeEventListener("blur", sync);
    };
  }, [surface, invalidate]);

  useFrame(({ gl, scene, camera }, delta) => {
    if (gl.getContext().isContextLost()) return;
    if (scene.background instanceof Color) scene.background.set(backdropColor.get());
    const object = group.current;
    const glass = mesh.current?.material as Glass | undefined;
    if (!object || !glass || !scene.environment) { invalidate(); return; }
    const active = idle.current.visible && !idle.current.reduced && !document.hidden;
    const interacting = surface.current?.hasAttribute("data-dragging") || surface.current?.hasAttribute("data-keyboard-focus");
    if (active && !interacting) {
      idle.current.time += Math.min(delta, .04);
      const phase = idle.current.time;
      object.position.y = Math.sin(phase * .7) * .08;
      object.rotation.set(Math.sin(phase * .4) * .04, Math.sin(phase * .45) * .22, Math.sin(phase * .5) * .025);
    }

    // Keep the hero studio for colored reflections, and refract the actual
    // light footer surface. Projecting the HDR studio into this tight crop
    // exposes its black backdrop and light-card shapes inside the glass.
    const target = gl.getRenderTarget();
    const background = scene.background;
    const toneMapping = gl.toneMapping;
    try {
      gl.toneMapping = NoToneMapping;
      object.visible = false;
      gl.setRenderTarget(backdrop);
      gl.render(scene, camera);
      object.visible = true;
      glass.buffer = backdrop.texture;
      glass.side = BackSide;
      gl.setRenderTarget(backfaces);
      gl.render(scene, camera);
    } finally {
      object.visible = true;
      glass.buffer = backfaces.texture;
      glass.side = FrontSide;
      scene.background = background;
      gl.toneMapping = toneMapping;
      gl.setRenderTarget(target);
    }
    frames.current += 1;
    if (!ready.current && frames.current > 4) { ready.current = true; onReady(); }
    if ((active && !interacting) || frames.current < 6) invalidate();
  });

  return <group ref={group} scale={heroTile.scale}>
    <InteractiveTile surface={surface} request={request} palette={palette} onTurn={onTurn}
      objectRef={mesh} buffer={backfaces.texture} />
  </group>;
}

export default function FooterCubeScene({ label, help, onReady, onFailure, background }: {
  label: string;
  help: string;
  onReady: () => void;
  onFailure: () => void;
  background: MotionValue<string>;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const id = useId();
  const [palette] = useState(readGlassPalette);

  return (
    <div ref={surface} className={styles.surface} tabIndex={0} role="group"
      aria-label={label} aria-describedby={id}
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home Escape"
      onPointerDownCapture={event => {
        event.currentTarget.dataset.pointerFocus = "true";
        delete event.currentTarget.dataset.keyboardFocus;
      }}
      onFocus={event => {
        if (!event.currentTarget.hasAttribute("data-pointer-focus")) event.currentTarget.dataset.keyboardFocus = "true";
      }}
      onKeyDownCapture={event => {
        delete event.currentTarget.dataset.pointerFocus;
        event.currentTarget.dataset.keyboardFocus = "true";
      }}
      onBlur={event => {
        delete event.currentTarget.dataset.pointerFocus;
        delete event.currentTarget.dataset.keyboardFocus;
      }}>
      <Canvas orthographic frameloop="demand" dpr={[1, 1.25]}
        camera={{ position: [0, 0, 20], zoom: 90, near: .1, far: 100 }}
        gl={{ alpha: false, antialias: true }}
        onCreated={({ gl }) => { gl.domElement.setAttribute("aria-hidden", "true"); }}
        style={{ touchAction: "pan-y" }}>
        <SceneSetup onFailure={onFailure} />
        <color attach="background" args={["#ffffff"]} />
        <GlassStudio palette={palette} />
        <hemisphereLight args={[palette.ice, "#59717d", .8]} />
        <FloatingTile surface={surface} palette={palette} onReady={onReady} background={background} />
      </Canvas>
      <span id={id} className="sr-only">{help}</span>
    </div>
  );
}
