"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei/core/Fbo";
import { BackSide, FrontSide, NoToneMapping, OrthographicCamera, type Group, type Mesh, type MeshPhysicalMaterial, type Texture } from "three";
import { TileGeometry } from "./tile-geometry";
import { BlueGlassMaterial, GlassStudio, readGlassPalette, type GlassPalette } from "./blue-glass-material";
import { getRibbonArrangement, sampleRibbon } from "./tile-arrangement";
import { useRibbonInteraction, type RibbonPlayback } from "./use-ribbon-interaction";
import { WebGLGuard } from "./webgl-guard";
import { webGLAvailability } from "./webgl-availability";
import styles from "./coin-preview.module.css";

extend({ TileGeometry });
type SharedGlass = MeshPhysicalMaterial & { buffer: Texture };
type ScenePresentation = {
  label?: string;
  helpId?: string;
  hint?: string | null;
  onReady?: () => void;
  onUnavailable?: () => void;
};

function TileRibbon({ palette, surface, onReady, ...playback }: RibbonPlayback & {
  palette: GlassPalette;
  surface: RefObject<HTMLDivElement | null>;
  onReady?: () => void;
}) {
  const size = useThree(state => state.size);
  const get = useThree(state => state.get);
  const invalidate = useThree(state => state.invalidate);
  const arrangement = useMemo(() => getRibbonArrangement(size.width / Math.max(1, size.height), size.width < 640), [size.width, size.height]);
  const motion = useRibbonInteraction({ surface, ...playback, period: arrangement.period });
  const group = useRef<Group>(null);
  const warmupFrames = useRef(0);
  const ready = useRef(false);
  const meshes = useRef<(Mesh | null)[]>([]);
  const [geometry, setGeometry] = useState<TileGeometry | null>(null);
  const [material, setMaterial] = useState<SharedGlass | null>(null);
  const onMaterial = useCallback((value: unknown) => setMaterial(value as SharedGlass | null), []);
  const bufferScale = Math.min(1.25, 1024 / Math.max(1, size.width), 1024 / Math.max(1, size.height));
  const bufferWidth = Math.max(1, Math.round(size.width * bufferScale));
  const bufferHeight = Math.max(1, Math.round(size.height * bufferScale));
  const backdrop = useFBO(bufferWidth, bufferHeight);
  // Refraction is already filtered; a second four-sample HDR framebuffer
  // spends substantial GPU memory without improving the outer silhouette.
  const backfaces = useFBO(bufferWidth, bufferHeight);

  useEffect(() => {
    const camera = get().camera;
    if (!(camera instanceof OrthographicCamera)) return;
    camera.left = -arrangement.width / 2;
    camera.right = arrangement.width / 2;
    camera.top = arrangement.height / 2;
    camera.bottom = -arrangement.height / 2;
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, arrangement, invalidate]);

  useFrame(({ gl, scene, camera }) => {
    if (gl.getContext().isContextLost()) return;
    // Finish the studio's initial captures even when reduced motion or pause
    // means there is no continuous animation requesting another frame.
    if (warmupFrames.current++ < 4) invalidate();
    const ribbon = group.current;
    const glass = meshes.current[0]?.material as SharedGlass | undefined;
    if (!ribbon || !glass || !scene.environment) return;
    arrangement.origins.forEach((origin, index) => {
      const mesh = meshes.current[index];
      if (!mesh) return;
      const pose = sampleRibbon(arrangement, origin, motion.phase);
      mesh.position.set(...pose.position);
      mesh.rotation.set(...pose.rotation);
      mesh.scale.setScalar(pose.scale);
      mesh.visible = Math.abs(pose.position[0]) < arrangement.width / 2 + 1.4 * pose.scale;
    });
    // Share the optical passes across the ribbon instead of rendering the
    // entire scene twice per tile. The single-tile study keeps its own passes.
    const target = gl.getRenderTarget();
    const background = scene.background;
    const toneMapping = gl.toneMapping;
    const intensity = glass.envMapIntensity;
    try {
      gl.toneMapping = NoToneMapping;
      scene.background = scene.environment;
      ribbon.visible = false;
      gl.setRenderTarget(backdrop);
      gl.render(scene, camera);
      ribbon.visible = true;
      glass.buffer = backdrop.texture;
      glass.side = BackSide;
      glass.envMapIntensity = intensity;
      gl.setRenderTarget(backfaces);
      gl.render(scene, camera);
    } finally {
      ribbon.visible = true;
      glass.buffer = backfaces.texture;
      glass.side = FrontSide;
      glass.envMapIntensity = intensity;
      scene.background = background;
      gl.toneMapping = toneMapping;
      gl.setRenderTarget(target);
    }
    if (!ready.current && warmupFrames.current > 4) {
      ready.current = true;
      onReady?.();
    }
  });

  return <>
    <mesh visible={false}>
      <tileGeometry ref={setGeometry} />
      <BlueGlassMaterial palette={palette} buffer={backfaces.texture} materialRef={onMaterial} />
    </mesh>
    <group ref={group}>
      {geometry && material && arrangement.origins.map((_, index) => (
        <mesh key={index} ref={mesh => { meshes.current[index] = mesh; }} geometry={geometry} material={material} />
      ))}
    </group>
  </>;
}

function ContextHealth({ onUnavailable }: Pick<ScenePresentation, "onUnavailable">) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = () => {
      webGLAvailability.markUnavailable();
      onUnavailable?.();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onUnavailable]);
  return null;
}

export default function CompositionScene({
  label = "Move the blue and coral glass ribbon",
  helpId = "ribbon-interaction-help",
  hint = "Drag the ribbon",
  onReady,
  onUnavailable,
  ...props
}: RibbonPlayback & ScenePresentation) {
  const [palette] = useState(readGlassPalette);
  const surface = useRef<HTMLDivElement>(null);
  return <div ref={surface} className={styles.interaction} role="group" tabIndex={0}
    aria-label={label} aria-describedby={helpId}
    aria-keyshortcuts="ArrowLeft ArrowRight Home Escape Space">
    <WebGLGuard onUnavailable={onUnavailable}
      fallback={onUnavailable ? null : <div role="status">This preview requires WebGL graphics support.</div>}>
    <Canvas orthographic frameloop="demand" dpr={[1, 1.25]}
      camera={{ position: [0, 0, 20], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.domElement.setAttribute("aria-hidden", "true")}
      fallback={onUnavailable ? null : <div role="status">This preview requires WebGL graphics support.</div>}>
      <color attach="background" args={["#f3f6f7"]} />
      <GlassStudio palette={palette} />
      <hemisphereLight args={[palette.ice, "#59717d", 0.8]} />
      <ContextHealth onUnavailable={onUnavailable} />
      <TileRibbon palette={palette} surface={surface} onReady={onReady} {...props} />
    </Canvas>
    </WebGLGuard>
    {hint && <span className={styles.dragHint} aria-hidden="true">{hint}</span>}
  </div>;
}
