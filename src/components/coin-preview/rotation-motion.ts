export type Rotation = [number, number, number];
export type TileView = "perspective" | "front" | "edge" | "back";
export const VIEW_ROTATIONS: Record<TileView, Rotation> = {
  perspective: [0.12, -0.5, -0.08],
  front: [0, 0, 0],
  edge: [0, -Math.PI / 2, 0],
  back: [0.12, Math.PI - 0.5, -0.08],
};

const PITCH_LIMIT = Math.PI / 3;
const clampPitch = (value: number) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, value));
const nearestAngle = (angle: number, current: number) => current + Math.atan2(Math.sin(angle - current), Math.cos(angle - current));
const resistedPitch = (value: number) => {
  const excess = Math.abs(value) - PITCH_LIMIT;
  return excess <= 0 ? value : Math.sign(value) * (PITCH_LIMIT + 0.25 * (1 - Math.exp(-excess / 0.25)));
};
const unresistedPitch = (value: number) => {
  const excess = Math.abs(value) - PITCH_LIMIT;
  return excess <= 0 ? value : Math.sign(value) * (PITCH_LIMIT - 0.25 * Math.log(Math.max(0.000001, 1 - excess / 0.25)));
};

/** Direct manipulation and a critically damped, interruptible release spring. */
export class RotationMotion {
  rotation: Rotation;
  velocity: Rotation = [0, 0, 0];
  target: Rotation | null = null;
  private origin: { x: number; y: number; rotation: Rotation } | null = null;
  private samples: { time: number; rotation: Rotation }[] = [];

  constructor(initial: Rotation) { this.rotation = [...initial]; }

  stop() {
    this.target = null;
    this.origin = null;
    this.samples = [];
    this.velocity = [0, 0, 0];
  }

  grab(x: number, y: number, time: number) {
    this.stop();
    this.origin = { x, y, rotation: [...this.rotation] };
    this.samples = [{ time, rotation: [...this.rotation] }];
  }

  drag(x: number, y: number, time: number, allowTilt: boolean) {
    if (!this.origin) return;
    const { rotation, x: startX, y: startY } = this.origin;
    this.rotation = [
      allowTilt ? resistedPitch(unresistedPitch(rotation[0]) + (y - startY) * 0.006) : rotation[0],
      rotation[1] + (x - startX) * 0.008,
      rotation[2],
    ];
    this.samples.push({ time, rotation: [...this.rotation] });
    while (this.samples.length > 2 && this.samples[1].time < time - 90) this.samples.shift();
  }

  release(time: number, reducedMotion: boolean) {
    if (!this.origin) return;
    const last = this.samples.at(-1)!;
    const first = this.samples.find(sample => sample.time >= time - 90) ?? last;
    const elapsed = (time - first.time) / 1000;
    this.velocity = this.rotation.map((value, axis) =>
      !reducedMotion && time - last.time < 80 && elapsed > 0.008
        ? Math.max(-5, Math.min(5, (value - first.rotation[axis]) / elapsed)) : 0,
    ) as Rotation;
    this.origin = null;
    this.samples = [];
    if (reducedMotion) {
      this.rotation[0] = clampPitch(this.rotation[0]);
      this.target = null;
      return;
    }
    this.target = [
      clampPitch(this.rotation[0] + this.velocity[0] * 0.18),
      this.rotation[1] + this.velocity[1] * 0.22,
      this.rotation[2],
    ];
  }

  goTo(rotation: Rotation, reducedMotion: boolean) {
    this.origin = null;
    this.samples = [];
    const next = rotation.map((value, axis) => nearestAngle(value, this.rotation[axis])) as Rotation;
    if (reducedMotion) {
      this.stop();
      this.rotation = next;
    } else {
      // Preserve existing velocity when a key or preset redirects the spring.
      this.target = next;
    }
  }

  nudge(pitch: number, yaw: number, reducedMotion: boolean) {
    const current = this.target ?? this.rotation;
    this.goTo([clampPitch(current[0] + pitch), current[1] + yaw, current[2]], reducedMotion);
  }

  advance(seconds: number): boolean {
    if (!this.target) return false;
    // Exact critically damped solution: stable and independent of refresh rate.
    const frequency = 12;
    const decay = Math.exp(-frequency * Math.max(0, seconds));
    for (let axis = 0; axis < 3; axis++) {
      const displacement = this.rotation[axis] - this.target[axis];
      const coefficient = this.velocity[axis] + frequency * displacement;
      this.rotation[axis] = this.target[axis] + (displacement + coefficient * seconds) * decay;
      this.velocity[axis] = (this.velocity[axis] - frequency * coefficient * seconds) * decay;
    }
    if (this.rotation.every((value, axis) => Math.abs(value - this.target![axis]) < 0.0001 && Math.abs(this.velocity[axis]) < 0.001)) {
      this.rotation = [...this.target];
      this.target = null;
      this.velocity = [0, 0, 0];
      return false;
    }
    return true;
  }
}
