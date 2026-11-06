"use client";

import { useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei/core/Environment";
import { Lightformer } from "@react-three/drei/core/Lightformer";
import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { Color, LinearFilter, RGBAFormat, SRGBColorSpace, type Texture } from "three";

const GRADIENT_SIZE = 128;

export type GlassPalette = { blue: string; sky: string; ice: string };

export function readGlassPalette(): GlassPalette {
  const css = getComputedStyle(document.documentElement);
  return {
    blue: css.getPropertyValue("--brand-blue").trim() || "#277db8",
    sky: css.getPropertyValue("--brand-sky").trim() || "#8bcff0",
    ice: css.getPropertyValue("--brand-ice").trim() || "#d8efff",
  };
}

export function BlueGlassMaterial({ palette, resolution = 512, samples = 6, buffer, materialRef }: {
  palette: GlassPalette;
  resolution?: number;
  samples?: number;
  buffer?: Texture;
  materialRef?: (material: unknown) => void;
}) {
  const gradientData = useMemo(() => {
    const sky = new Color(palette.sky);
    const ice = new Color(palette.ice);
    const deeperBlue = new Color(palette.blue).lerp(sky, 0.7);
    const tint = new Color();
    const pixel = new Color();
    const data = new Uint8Array(GRADIENT_SIZE * GRADIENT_SIZE * 4);
    for (let y = 0; y < GRADIENT_SIZE; y++) {
      for (let x = 0; x < GRADIENT_SIZE; x++) {
        // One broad diagonal blend, attached to the glass as it turns.
        const t = (x * 0.35 + y * 0.65) / (GRADIENT_SIZE - 1);
        if (t < 0.55) tint.copy(deeperBlue).lerp(sky, t / 0.55);
        else tint.copy(sky).lerp(ice, (t - 0.55) / 0.45);
        pixel.copy(tint).convertLinearToSRGB();
        data.set([Math.round(pixel.r * 255), Math.round(pixel.g * 255), Math.round(pixel.b * 255), 255],
          (y * GRADIENT_SIZE + x) * 4);
      }
    }
    return data;
  }, [palette.blue, palette.sky, palette.ice]);
  const [studio, setStudio] = useState<Texture | null>(null);
  useFrame(({ scene }) => {
    // The local studio is captured after mount. Use it for refraction too,
    // while keeping the page's visible background quiet and neutral.
    if (!buffer && scene.environment && scene.environment !== studio) setStudio(scene.environment);
  });
  // A uniformly polished shell; the gradient changes only its tint.

  return (
    <MeshTransmissionMaterial
      key="smooth-gradient-glass-v5"
      ref={materialRef}
      buffer={buffer}
      background={studio ?? undefined}
      backside={!buffer}
      backsideThickness={0.6}
      resolution={buffer ? 16 : resolution}
      samples={samples}
      chromaticAberration={0.06}
      anisotropicBlur={0.02}
      distortion={0}
      temporalDistortion={0}
      // Keep a blue body even on the white page, while full transmission and
      // gentle absorption preserve the clear glass depth.
      color="white"
      metalness={0}
      roughness={0.06}
      transmission={1}
      thickness={0.6}
      ior={1.8}
      attenuationColor={palette.sky}
      attenuationDistance={3.5}
      clearcoat={0.18}
      clearcoatRoughness={0.07}
      envMapIntensity={0.85}
      iridescence={1}
      iridescenceIOR={2.25}
      iridescenceThicknessRange={[380, 380]}
      dispersion={0.16}
    >
      <dataTexture
        attach="map"
        args={[gradientData, GRADIENT_SIZE, GRADIENT_SIZE, RGBAFormat]}
        colorSpace={SRGBColorSpace}
        minFilter={LinearFilter}
        magFilter={LinearFilter}
        needsUpdate
      />
    </MeshTransmissionMaterial>
  );
}

export function GlassStudio({ palette }: { palette: GlassPalette }) {
  // Local light cards create the reflection environment; no downloaded HDRI.
  // Capture on the first frame, after the light cards finish mounting, then
  // let the demand-driven canvas rest between view changes.
  return (
    <Environment key="blue-orange-violet-studio-v1" resolution={512} frames={2}>
      <color attach="background" args={["#06182c"]} />
      <Lightformer position={[-4, 0.5, 3]} scale={[1.4, 8, 1]} color={palette.blue} intensity={1.8} />
      <Lightformer position={[-3, 2, 4]} scale={[0.25, 8, 1]} color={palette.ice} intensity={1.2} />
      {/* Broad alternating accents overlap in the optical reflections and
          continue around the front, back, and edges without painted bands. */}
      <Lightformer position={[-3.5, 0.4, 2.7]} scale={[0.9, 6, 1]} color="#ffa876" intensity={1.4} />
      <Lightformer position={[3.5, -0.4, 2.7]} scale={[1.2, 6, 1]} color="#b299ef" intensity={1.5} />
      <Lightformer position={[3.5, 0.4, -2.7]} scale={[0.9, 6, 1]} color="#ffa876" intensity={1.4} />
      <Lightformer position={[-3.5, -0.4, -2.7]} scale={[1.2, 6, 1]} color="#b299ef" intensity={1.5} />
      <Lightformer position={[0.35, 0, 5]} scale={[1, 5, 1]} color="#ffa876" intensity={0.9} />
      <Lightformer position={[-0.35, 0, -5]} scale={[1.2, 5, 1]} color="#b299ef" intensity={1} />
      <Lightformer position={[0, 4.5, 0]} scale={[3, 0.8, 1]} color="#b299ef" intensity={1.2} />
      <Lightformer position={[0, -4.5, 0]} scale={[3, 0.8, 1]} color="#ffa876" intensity={1.2} />
      <Lightformer position={[-4, -1, 2]} scale={[0.8, 7, 1]} color="#36dbea" intensity={2.5} />
      <Lightformer position={[-2, 2, 4]} scale={[1.2, 5, 1]} color={palette.blue} intensity={2} />
      <Lightformer position={[4, 1, 2]} scale={[2, 7, 1]} color={palette.sky} intensity={1.8} />
      <Lightformer position={[0, 5, -1]} scale={[6, 2, 1]} color={palette.ice} intensity={1.5} />
      <Lightformer position={[-3, 0, -4]} scale={[0.7, 6, 1]} color={palette.sky} intensity={1.2} />
      <Lightformer position={[1, -2, -4]} scale={[4, 3, 1]} color="#135dcc" intensity={2} />
      <Lightformer position={[0, 1, 5]} rotation={[0, 0, -Math.PI / 4]} scale={[0.18, 5, 1]} color={palette.ice} intensity={1} />
    </Environment>
  );
}
