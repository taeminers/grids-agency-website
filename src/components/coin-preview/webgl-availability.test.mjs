import assert from "node:assert/strict";
import test from "node:test";
import { createWebGLAvailability } from "./webgl-availability.ts";

test("a blocked context selects fallback and is not retried on remount", () => {
  let attempts = 0;
  const guard = createWebGLAvailability(() => { attempts++; return null; });
  guard.check();
  guard.check();
  assert.equal(guard.getSnapshot(), "unavailable");
  assert.equal(attempts, 1);
});

test("a successful probe releases its context and is shared across Strict Mode mounts", () => {
  let attempts = 0;
  let releases = 0;
  const guard = createWebGLAvailability(() => {
    attempts++;
    return { isContextLost: () => false, getExtension: () => ({ loseContext() { releases++; } }) };
  });
  assert.equal(guard.getServerSnapshot(), "checking");
  guard.check();
  guard.check();
  assert.equal(guard.getSnapshot(), "available");
  assert.equal(attempts, 1);
  assert.equal(releases, 1);
});

test("a later context loss notifies subscribers once and prevents another startup", () => {
  let attempts = 0;
  const guard = createWebGLAvailability(() => {
    attempts++;
    return { isContextLost: () => false, getExtension: () => null };
  });
  guard.check();
  let notifications = 0;
  const unsubscribe = guard.subscribe(() => notifications++);
  guard.markUnavailable();
  guard.markUnavailable();
  guard.check();
  assert.equal(guard.getSnapshot(), "unavailable");
  assert.equal(attempts, 1);
  assert.equal(notifications, 1);
  unsubscribe();
});

test("throwing or already-lost context creation falls back without escaping", () => {
  for (const probe of [
    () => { throw new Error("GPU unavailable"); },
    () => ({ isContextLost: () => true, getExtension: () => null }),
  ]) {
    const guard = createWebGLAvailability(probe);
    assert.doesNotThrow(() => guard.check());
    assert.equal(guard.getSnapshot(), "unavailable");
  }
});
