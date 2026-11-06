"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useThree, type ThreeElement } from "@react-three/fiber";
import { LinearFilter, PerspectiveCamera, RGBAFormat } from "three";
import { TileGeometry } from "./tile-geometry";
import { GlassStudio, readGlassPalette } from "./blue-glass-material";
import { InteractiveTile, type ViewRequest } from "./interactive-tile";
import type { TileView } from "./rotation-motion";
import styles from "./coin-preview.module.css";

extend({ TileGeometry });

declare module "@react-three/fiber" {
  interface ThreeElements {
    tileGeometry: ThreeElement<typeof TileGeometry>;
  }
}

function ResponsiveCamera() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    // Fit the same subject inside the narrower field of view on either axis.
    // Keep a generous margin so the tile survives narrow viewports.
    const aspect = size.width / Math.max(size.height, 1);
    const verticalHalfFov = (camera.fov * Math.PI) / 360;
    const limitingHalfFov = Math.atan(Math.tan(verticalHalfFov) * Math.min(aspect, 1));
    camera.position.set(0, 0.15, 1.65 / Math.sin(limitingHalfFov));
    camera.lookAt(0, -0.1, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  return null;
}

function StudioShadow({ color }: { color: string }) {
  const data = useMemo(() => {
    const size = 64;
    const pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const radius = Math.hypot((x + 0.5) / size * 2 - 1, (y + 0.5) / size * 2 - 1);
        const alpha = Math.exp(-radius * radius * 5) * Math.max(0, 1 - radius);
        pixels.set([255, 255, 255, Math.round(alpha * 255)], (y * size + x) * 4);
      }
    }
    return pixels;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
      <planeGeometry args={[4, 2.5]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false}>
        <dataTexture attach="map" args={[data, 64, 64, RGBAFormat]}
          minFilter={LinearFilter} magFilter={LinearFilter} needsUpdate />
      </meshBasicMaterial>
    </mesh>
  );
}

export default function CoinScene({ request, onTurn }: {
  request: ViewRequest;
  onTurn: (view?: TileView) => void;
}) {
  const [palette] = useState(readGlassPalette);
  const surface = useRef<HTMLDivElement>(null);

  return (
    <div ref={surface} className={styles.interaction} tabIndex={0} role="group"
      aria-label="Rotate the blue and coral glass tile"
      aria-describedby="tile-interaction-help"
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home Escape">
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.15, 7], fov: 35, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.domElement.setAttribute("aria-hidden", "true")}
      style={{ touchAction: "pan-y" }}
      fallback={<div role="status">This preview requires WebGL graphics support.</div>}
    >
      <color attach="background" args={["#f3f6f7"]} />
      <ResponsiveCamera />
      <GlassStudio palette={palette} />
      <hemisphereLight args={[palette.ice, "#59717d", 0.8]} />

      <InteractiveTile surface={surface} request={request} palette={palette} onTurn={onTurn} />

      <StudioShadow color={palette.blue} />
    </Canvas>
    <span className={styles.dragHint} aria-hidden="true">Drag to turn</span>
    </div>
  );
}
