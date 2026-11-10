import assert from "node:assert/strict";
import test from "node:test";
import { RibbonMotion } from "./ribbon-motion.ts";

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
test("idle travel and release decay are independent of frame rate", () => {
  for (const autoplay of [true, false]) {
    const run = fps => {
      const motion = new RibbonMotion();
      motion.velocity = -0.4;
      for (let i = 0; i < fps; i++) motion.advance(1 / fps, autoplay);
      return motion;
    };
    near(run(60).phase, run(120).phase);
    near(run(60).velocity, run(120).velocity);
  }
});
test("grabbing preserves the visible phase and supports immediate reversal", () => {
  const motion = new RibbonMotion();
  motion.advance(2, true);
  const phase = motion.phase;
  motion.grab(250, 1000, 0);
  motion.advance(1, true);
  near(motion.phase, phase);
  motion.drag(210, 80);
  near(motion.phase, phase - 0.04);
  motion.release(90, false);
  assert.ok(motion.velocity < 0);
  motion.advance(0.1, true);
  assert.ok(motion.phase < phase - 0.04);
  const regrab = motion.phase;
  motion.grab(400, 1000, 200);
  motion.drag(450, 250);
  near(motion.phase, regrab + 0.05);
});
test("stale gestures and reduced motion never add release momentum", () => {
  for (const [time, reduced] of [[250, false], [70, true]]) {
    const motion = new RibbonMotion();
    motion.grab(0, 1000, 0);
    motion.drag(100, 60);
    motion.release(time, reduced);
    assert.equal(motion.velocity, 0);
    const phase = motion.phase;
    assert.equal(motion.advance(1, false), false);
    near(motion.phase, phase);
  }
});
test("pause stops immediately; direct keyboard movement still works", () => {
  const motion = new RibbonMotion();
  motion.advance(3, true);
  motion.stop();
  const phase = motion.phase;
  motion.advance(1, false);
  near(motion.phase, phase);
  motion.nudge(-0.09, true);
  near(motion.phase, phase - 0.09);
  assert.equal(motion.advance(1, false), false);
});
test("reset returns to the nearest equivalent arrangement and remains interruptible", () => {
  const motion = new RibbonMotion();
  motion.phase = 6.2;
  motion.reset(2, false);
  assert.equal(motion.target, 6);
  motion.advance(0.1, false);
  assert.ok(motion.phase < 6.2 && motion.phase > 6);
  motion.grab(0, 100, 0);
  assert.equal(motion.target, null);
  motion.reset(2, true);
  assert.equal(motion.phase, 6);
});
