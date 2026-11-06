import assert from "node:assert/strict";
import test from "node:test";
import { RotationMotion, VIEW_ROTATIONS } from "./rotation-motion.ts";

function flick() {
  const motion = new RotationMotion(VIEW_ROTATIONS.perspective);
  motion.grab(100, 100, 0);
  motion.drag(115, 105, 20, true);
  motion.drag(130, 110, 40, true);
  motion.drag(145, 115, 60, true);
  motion.release(65, false);
  return motion;
}

test("drag starts at the visible angle and regrabbing a moving tile never snaps", () => {
  const motion = flick();
  motion.advance(0.05);
  const visible = [...motion.rotation];
  motion.grab(400, 300, 100);
  assert.deepEqual(motion.rotation, visible);
  motion.drag(410, 300, 120, true);
  assert.ok(Math.abs(motion.rotation[1] - visible[1] - 0.08) < 1e-12);
  assert.equal(motion.target, null);
});

test("release carries velocity, settles, and gives the same result at 60 and 120 Hz", () => {
  const sixty = flick();
  const fast = flick();
  const released = sixty.rotation[1];
  assert.ok(sixty.velocity[1] > 0);
  sixty.advance(1 / 60);
  assert.ok(sixty.rotation[1] > released);
  for (let i = 1; i < 60; i++) sixty.advance(1 / 60);
  for (let i = 0; i < 120; i++) fast.advance(1 / 120);
  sixty.rotation.forEach((value, axis) => assert.ok(Math.abs(value - fast.rotation[axis]) < 1e-10));
  for (let i = 0; i < 120; i++) sixty.advance(1 / 60);
  assert.equal(sixty.target, null);
  assert.equal(sixty.advance(1), false);
});

test("holding still before release does not produce a stale flick", () => {
  const motion = new RotationMotion([0, 0, 0]);
  motion.grab(0, 0, 0);
  motion.drag(30, 0, 30, true);
  motion.release(200, false);
  assert.deepEqual(motion.velocity, [0, 0, 0]);
  const released = [...motion.rotation];
  motion.advance(1);
  assert.deepEqual(motion.rotation, released);
});

test("reduced motion keeps direct manipulation but removes glide and preset animation", () => {
  const motion = new RotationMotion([0, 0, 0]);
  motion.grab(0, 0, 0);
  motion.drag(40, 10, 30, true);
  const released = [...motion.rotation];
  motion.release(35, true);
  assert.equal(motion.advance(0.5), false);
  assert.deepEqual(motion.rotation, released);
  motion.goTo(VIEW_ROTATIONS.front, true);
  assert.ok(motion.rotation.every(value => Math.abs(value) < 1e-12));
  assert.equal(motion.target, null);
});

test("pitch has progressive resistance, remains continuous on regrab, and settles within bounds", () => {
  const motion = new RotationMotion([0, 0, 0]);
  motion.grab(0, 0, 0);
  motion.drag(0, 300, 30, true);
  const resisted = motion.rotation[0];
  assert.ok(resisted > Math.PI / 3 && resisted < Math.PI / 3 + 0.25);
  motion.grab(0, 300, 50);
  motion.drag(0, 300, 60, true);
  assert.ok(Math.abs(motion.rotation[0] - resisted) < 1e-12);
  motion.release(65, false);
  for (let i = 0; i < 180; i++) motion.advance(1 / 60);
  assert.ok(motion.rotation[0] <= Math.PI / 3);
});

test("touch turns horizontally without tilting; cancellation leaves no residual animation", () => {
  const motion = new RotationMotion([0.12, 0, 0]);
  motion.grab(0, 0, 0);
  motion.drag(30, 80, 30, false);
  assert.equal(motion.rotation[0], 0.12);
  assert.equal(motion.rotation[1], 0.24);
  motion.stop();
  assert.equal(motion.advance(1), false);
  motion.release(40, false);
  assert.equal(motion.target, null);
});

test("presets take the nearest equivalent angle and can redirect an active spring", () => {
  const motion = new RotationMotion([0, Math.PI * 4 + 0.1, 0]);
  motion.goTo(VIEW_ROTATIONS.front, false);
  assert.ok(Math.abs(motion.target[1] - motion.rotation[1]) < 0.11);
  motion.advance(0.04);
  const visible = [...motion.rotation];
  const velocity = [...motion.velocity];
  motion.goTo(VIEW_ROTATIONS.edge, false);
  assert.deepEqual(motion.rotation, visible);
  assert.deepEqual(motion.velocity, velocity);
  motion.nudge(-Math.PI / 12, 0, false);
  assert.ok(motion.target[0] < 0);
});
