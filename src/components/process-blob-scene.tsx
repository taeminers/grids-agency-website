"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BufferAttribute, Color, SphereGeometry, type Mesh } from "three";
import type { MotionValue } from "framer-motion";
import { WebGLGuard } from "./coin-preview/webgl-guard";

type BlobProps = {
  progress: MotionValue<number>;
  onReady: () => void;
  onUnavailable: () => void;
};

/** Smooth, asymmetric lobes with color embedded in the surface, rather than glare. */
function makeBlobGeometry() {
  const geometry = new SphereGeometry(1, 64, 48);
  const positions = geometry.getAttribute("position");
  const colors = new Float32Array(positions.count * 3);
  const sky = new Color("#8bcff0");
  const violet = new Color("#c7b5e9");
  const peach = new Color("#edbea6");
  const color = new Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const angle = Math.atan2(z, x);
    const radius = 1 + 0.17 * Math.sin(angle * 3 + y * 2) * (1 - y * y)
      + 0.09 * Math.cos(y * 5 + x * 2);
    positions.setXYZ(i, x * radius, y * radius * 1.04, z * radius * 0.9);
    color.copy(sky).lerp(violet, Math.max(0, x * 0.65 + z * 0.25))
      .lerp(peach, Math.max(0, -x * 0.55 - y * 0.45 - 0.2));
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function Blob({ progress, onReady }: Pick<BlobProps, "progress" | "onReady">) {
  const mesh = useRef<Mesh>(null);
  const ready = useRef(false);
  const invalidate = useThree(state => state.invalidate);
  const viewport = useThree(state => state.viewport);

  useEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const geometry = makeBlobGeometry();
    target.geometry = geometry;
    invalidate();
    return () => { geometry.dispose(); };
  }, [invalidate]);

  useEffect(() => progress.on("change", () => invalidate()), [progress, invalidate]);

  useFrame(({ gl }) => {
    if (!mesh.current || gl.getContext().isContextLost()) return;
    const p = Math.min(1, Math.max(0, progress.get()));
    const growth = Math.min(1, p / 0.72);
    const eased = growth * growth * (3 - 2 * growth);
    const scale = Math.min(viewport.width * 0.36, viewport.height * 0.43) * (0.32 + 0.68 * eased);
    mesh.current.scale.set(scale * (1 + 0.08 * Math.sin(p * Math.PI)), scale, scale);
    mesh.current.rotation.set(0.12 + p * 0.24, -0.5 + p * 1.1, -0.12 + p * 0.15);
    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  });

  return (
    <mesh ref={mesh}>
      <meshPhysicalMaterial vertexColors roughness={0.46} metalness={0.05}
        clearcoat={0.15} clearcoatRoughness={0.5} specularIntensity={0.3} />
    </mesh>
  );
}

function ContextGuard({ onUnavailable }: Pick<BlobProps, "onUnavailable">) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, [gl, onUnavailable]);
  return null;
}

export default function ProcessBlobScene(props: BlobProps) {
  return (
    <WebGLGuard onUnavailable={props.onUnavailable}>
      <Canvas frameloop="demand" dpr={[1, 1.25]} camera={{ position: [0, 0, 7], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
        <ambientLight intensity={1} />
        <hemisphereLight args={["#edf7ff", "#8b9aad", 1.5]} />
        <directionalLight position={[-3, 5, 5]} color="#ffffff" intensity={2.4} />
        <directionalLight position={[4, -1, 2]} color="#ead5ff" intensity={0.8} />
        <Blob progress={props.progress} onReady={props.onReady} />
        <ContextGuard onUnavailable={props.onUnavailable} />
      </Canvas>
    </WebGLGuard>
  );
}
