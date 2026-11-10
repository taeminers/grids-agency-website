import type { Rotation } from "./rotation-motion";

type Placement = {
  id: string;
  u: number;
  v: number;
  height: number;
  depth: number;
  rotation: Rotation;
};

// Screen-relative anchors keep the headline space intact as the canvas changes.
// Height is a fraction of the visible scene; depth controls the overlaps.
const desktop: Placement[] = [
  { id: "left-outer", u: -0.035, v: 0.32, height: 0.43, depth: -0.8, rotation: [0.2, -0.6, -0.5] },
  { id: "left-rear", u: 0.055, v: 0.37, height: 0.39, depth: -0.4, rotation: [-0.18, 0.8, -0.4] },
  { id: "left-face", u: 0.15, v: 0.45, height: 0.36, depth: 0.6, rotation: [0.15, -0.5, -0.48] },
  { id: "left-turn", u: 0.255, v: 0.69, height: 0.31, depth: 0.2, rotation: [-0.15, 0.83, -0.38] },
  { id: "left-low", u: 0.375, v: 0.77, height: 0.27, depth: 0, rotation: [0.12, 1.27, -0.13] },
  { id: "center", u: 0.5, v: 0.81, height: 0.25, depth: 0.2, rotation: [0.18, -1.18, 0.16] },
  { id: "right-low", u: 0.625, v: 0.76, height: 0.28, depth: 0.4, rotation: [-0.12, -0.76, 0.4] },
  { id: "right-turn", u: 0.745, v: 0.74, height: 0.32, depth: 0.2, rotation: [0.2, 0.8, 0.5] },
  { id: "right-face", u: 0.85, v: 0.44, height: 0.38, depth: 0.8, rotation: [0.12, -0.52, 0.45] },
  { id: "right-rear", u: 0.945, v: 0.35, height: 0.41, depth: -0.2, rotation: [-0.1, 0.7, 0.35] },
  { id: "right-outer", u: 1.035, v: 0.29, height: 0.44, depth: 0.5, rotation: [0.18, -0.4, 0.55] },
];

const tablet: Placement[] = [
  { ...desktop[0], u: -0.04, v: 0.42, height: 0.37 },
  { ...desktop[2], u: 0.08, v: 0.58, height: 0.33 },
  { ...desktop[3], u: 0.22, v: 0.67, height: 0.29 },
  { ...desktop[4], u: 0.36, v: 0.8, height: 0.24 },
  { ...desktop[5], u: 0.5, v: 0.83, height: 0.23 },
  { ...desktop[6], u: 0.64, v: 0.78, height: 0.26 },
  { ...desktop[7], u: 0.78, v: 0.63, height: 0.3 },
  { ...desktop[8], u: 0.92, v: 0.57, height: 0.33 },
  { ...desktop[10], u: 1.04, v: 0.36, height: 0.38 },
];

// Three spacious anchors on phones: an entering tile, a center tile, and an
// exiting tile. Offscreen loop instances retain this wider cadence as they move.
const mobile: Placement[] = [
  { ...desktop[2], u: -0.02, v: 0.64, height: 0.26 },
  { ...desktop[5], u: 0.5, v: 0.79, height: 0.23 },
  { ...desktop[8], u: 1.02, v: 0.63, height: 0.27 },
];

export function getTileArrangement(aspect: number, mobileViewport = false) {
  const safeAspect = Math.max(0.3, aspect);
  const height = 8;
  const width = height * safeAspect;
  const layout = mobileViewport || safeAspect < 1.1 ? mobile : safeAspect < 1.85 ? tablet : desktop;
  return {
    width,
    height,
    tiles: layout.map(tile => ({
      id: tile.id,
      position: [(tile.u - 0.5) * width, (0.5 - tile.v) * height, tile.depth] as [number, number, number],
      rotation: tile.rotation,
      scale: tile.height * height / 1.9,
    })),
  };
}

export function getRibbonArrangement(aspect: number, mobileViewport = false) {
  const arrangement = getTileArrangement(aspect, mobileViewport);
  const anchors = mobileViewport || aspect < 1.1 ? mobile : aspect < 1.85 ? tablet : desktop;
  const first = anchors[0];
  const last = anchors.at(-1)!;
  const spacing = (last.u - first.u) / (anchors.length - 1);
  const start = first.u - spacing * 2.5;
  const end = last.u + spacing * 2.5;
  return {
    ...arrangement,
    start,
    end,
    period: end - start,
    points: [{ ...first, u: start }, ...anchors, { ...last, u: end }],
    origins: [first.u - spacing * 2, first.u - spacing, ...anchors.map(tile => tile.u), last.u + spacing, last.u + spacing * 2],
  };
}

export type RibbonArrangement = ReturnType<typeof getRibbonArrangement>;

export function sampleRibbon(arrangement: RibbonArrangement, origin: number, phase: number) {
  const { points, start, period, width, height } = arrangement;
  const wrapped = ((origin + phase - start) % period + period) % period;
  const u = start + (period - wrapped < 1e-10 ? 0 : wrapped);
  let index = 0;
  while (index < points.length - 2 && points[index + 1].u < u) index++;
  const a = points[index];
  const b = points[index + 1];
  const before = points[Math.max(0, index - 1)];
  const after = points[Math.min(points.length - 1, index + 2)];
  const span = b.u - a.u;
  const t = (u - a.u) / span;
  // Nonuniform cubic Hermite interpolation: the ribbon keeps its tangent
  // through each approved anchor instead of stopping at each position.
  const blend = (read: (point: Placement) => number) => {
    const av = read(a);
    const bv = read(b);
    const ma = index === 0 ? 0 : (bv - read(before)) / (b.u - before.u) * span;
    const mb = index + 1 === points.length - 1 ? 0 : (read(after) - av) / (after.u - a.u) * span;
    return (2 * t ** 3 - 3 * t ** 2 + 1) * av + (t ** 3 - 2 * t ** 2 + t) * ma
      + (-2 * t ** 3 + 3 * t ** 2) * bv + (t ** 3 - t ** 2) * mb;
  };
  // Each tile keeps its own subtle tilt instead of turning through every
  // anchor's alternating angles. The path adds one gentle, diagonal sweep.
  const variation = (axis: number) => {
    const value = Math.sin(origin * 127.1 + axis * 311.7) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
  };
  const across = -Math.sin(Math.max(-1, Math.min(1, (u - 0.5) * 2)) * Math.PI / 2);
  const tiltScale = width / height < 1.85 ? 0.65 : 1;
  // Mirror only the exiting cubes' Y angle. Ease into the turn across the
  // right-hand side, leaving their diagonal lean and the left side intact.
  const exitProgress = Math.max(0, Math.min(1, (u - 0.55) / 0.35));
  const exitTurn = exitProgress * exitProgress * (3 - 2 * exitProgress);
  const yaw = across * 0.65 + variation(1) * 0.35 * (1 - Math.abs(across) * 0.6);
  const outerYaw = yaw * (1 - 2 * exitTurn);
  // Show both the face and thickness through the middle, blending smoothly
  // into the existing entry and exit poses on either side.
  const centerDistance = Math.abs(u - 0.5);
  const centerProgress = Math.max(0, Math.min(1, (0.3 - centerDistance) / 0.22));
  const centerTurn = centerProgress * centerProgress * (3 - 2 * centerProgress);
  const centerYaw = 65 * Math.PI / 180;
  return {
    position: [(u - 0.5) * width, (0.5 - blend(point => point.v)) * height, blend(point => point.depth)] as [number, number, number],
    rotation: [
      (0.1 + variation(0) * 0.1) * tiltScale,
      outerYaw + (centerYaw - outerYaw) * centerTurn,
      (across * 0.4 + variation(2) * 0.1) * tiltScale,
    ] as Rotation,
    scale: blend(point => point.height) * height / 1.9,
  };
}
