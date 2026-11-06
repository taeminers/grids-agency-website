/** One phase owns idle travel, direct manipulation, and release momentum. */
export class RibbonMotion {
  phase = 0;
  velocity = 0;
  target: number | null = null;
  private grabOrigin: { x: number; phase: number; width: number } | null = null;
  private samples: { time: number; phase: number }[] = [];

  stop() {
    this.velocity = 0;
    this.target = null;
    this.grabOrigin = null;
    this.samples = [];
  }

  grab(x: number, width: number, time: number) {
    this.stop();
    this.grabOrigin = { x, width: Math.max(1, width), phase: this.phase };
    this.samples = [{ time, phase: this.phase }];
  }

  drag(x: number, time: number) {
    if (!this.grabOrigin) return;
    this.phase = this.grabOrigin.phase + (x - this.grabOrigin.x) / this.grabOrigin.width;
    this.samples.push({ time, phase: this.phase });
    while (this.samples.length > 2 && this.samples[1].time < time - 90) this.samples.shift();
  }

  release(time: number, reduced: boolean) {
    if (!this.grabOrigin) return;
    const last = this.samples.at(-1)!;
    const first = this.samples.find(sample => sample.time >= time - 90) ?? last;
    const elapsed = (time - first.time) / 1000;
    this.velocity = !reduced && time - last.time < 80 && elapsed > 0.008
      ? Math.max(-0.65, Math.min(0.65, (this.phase - first.phase) / elapsed)) : 0;
    this.grabOrigin = null;
    this.samples = [];
  }

  nudge(amount: number, reduced: boolean) {
    this.grabOrigin = null;
    if (reduced) { this.stop(); this.phase += amount; }
    else this.target = (this.target ?? this.phase) + amount;
  }

  reset(period: number, reduced: boolean) {
    const target = Math.round(this.phase / period) * period;
    this.grabOrigin = null;
    if (reduced) { this.stop(); this.phase = target; }
    else this.target = target;
  }

  advance(seconds: number, autoplay: boolean): boolean {
    if (this.grabOrigin) return false;
    if (this.target !== null) {
      const displacement = this.phase - this.target;
      const coefficient = this.velocity + 12 * displacement;
      const decay = Math.exp(-12 * seconds);
      this.phase = this.target + (displacement + coefficient * seconds) * decay;
      this.velocity = (this.velocity - 12 * coefficient * seconds) * decay;
      if (Math.abs(this.phase - this.target) < 0.00001 && Math.abs(this.velocity) < 0.0001) {
        this.phase = this.target;
        this.target = null;
        this.velocity = 0;
      }
    } else {
      const desired = autoplay ? 0.022 : 0;
      const decay = Math.exp(-4.5 * seconds);
      this.phase += desired * seconds + (this.velocity - desired) * (1 - decay) / 4.5;
      this.velocity = desired + (this.velocity - desired) * decay;
      if (!autoplay && Math.abs(this.velocity) < 0.0001) this.velocity = 0;
    }
    return autoplay || this.target !== null || this.velocity !== 0;
  }
}
