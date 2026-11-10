import assert from "node:assert/strict";
import test from "node:test";
import { Euler, Vector3 } from "three";
import { TileGeometry } from "./tile-geometry.ts";
import { getTileArrangement } from "./tile-arrangement.ts";

test("the projected glass stays clear of the headline across phones, tablets, and wide screens", () => {
  const geometry = new TileGeometry();
  const vertices = geometry.getAttribute("position");
  for (const aspect of [0.55, 0.78, 1.09, 1.1, 1.5, 1.849, 1.85, 2.3, 3.2]) {
    const { width, height, tiles } = getTileArrangement(aspect);
    const text = aspect < 1.1 ? [0.08, 0.92, 0.05, 0.35]
      : aspect < 1.85 ? [0.25, 0.75, 0.05, 0.35] : [0.33, 0.67, 0.05, 0.42];
    for (const tile of tiles) {
      const bounds = [Infinity, -Infinity, Infinity, -Infinity];
      const rotation = new Euler(...tile.rotation);
      const point = new Vector3();
      for (let i = 0; i < vertices.count; i++) {
        point.fromBufferAttribute(vertices, i).multiplyScalar(tile.scale).applyEuler(rotation);
        const u = (point.x + tile.position[0]) / width + 0.5;
        const v = 0.5 - (point.y + tile.position[1]) / height;
        bounds[0] = Math.min(bounds[0], u);
        bounds[1] = Math.max(bounds[1], u);
        bounds[2] = Math.min(bounds[2], v);
        bounds[3] = Math.max(bounds[3], v);
      }
      const overlapsText = bounds[0] < text[1] && bounds[1] > text[0] && bounds[2] < text[3] && bounds[3] > text[2];
      assert.equal(overlapsText, false, `${tile.id} intrudes on the headline at aspect ${aspect}`);
      assert.ok(bounds[1] > 0 && bounds[0] < 1 && bounds[3] > 0 && bounds[2] < 1,
        `${tile.id} is completely outside the frame at aspect ${aspect}`);
      assert.ok(bounds[3] < 1, `${tile.id} is cut off at the bottom at aspect ${aspect}`);
    }
  }
  geometry.dispose();
});

test("the entire moving path preserves the headline and hides its wrap beyond the frame", async () => {
  const { getRibbonArrangement, sampleRibbon } = await import("./tile-arrangement.ts");
  const geometry = new TileGeometry();
  const vertices = geometry.getAttribute("position");
  for (const aspect of [0.55, 0.78, 1.09, 1.1, 1.5, 1.849, 1.85, 2.3, 3.2]) {
    const arrangement = getRibbonArrangement(aspect);
    const text = aspect < 1.1 ? [0.08, 0.92, 0.05, 0.35]
      : aspect < 1.85 ? [0.25, 0.75, 0.05, 0.35] : [0.33, 0.67, 0.05, 0.42];
    for (const origin of arrangement.origins) {
      for (let step = 0; step <= 300; step++) {
        const phase = arrangement.start + arrangement.period * step / 300 - origin;
        const tile = sampleRibbon(arrangement, origin, phase);
        const repeated = sampleRibbon(arrangement, origin, phase + arrangement.period * 4);
        tile.rotation.forEach((value, index) => assert.ok(Math.abs(value - repeated.rotation[index]) < 1e-8));
        tile.position.forEach((value, index) => assert.ok(Math.abs(value - repeated.position[index]) < 1e-8));
        const bounds = [Infinity, -Infinity, Infinity, -Infinity];
        const rotation = new Euler(...tile.rotation);
        const point = new Vector3();
        for (let i = 0; i < vertices.count; i++) {
          point.fromBufferAttribute(vertices, i).multiplyScalar(tile.scale).applyEuler(rotation);
          const u = (point.x + tile.position[0]) / arrangement.width + 0.5;
          const v = 0.5 - (point.y + tile.position[1]) / arrangement.height;
          bounds[0] = Math.min(bounds[0], u); bounds[1] = Math.max(bounds[1], u);
          bounds[2] = Math.min(bounds[2], v); bounds[3] = Math.max(bounds[3], v);
        }
        assert.ok(!(bounds[0] < text[1] && bounds[1] > text[0] && bounds[2] < text[3] && bounds[3] > text[2]), `headline collision at aspect ${aspect}, step ${step}`);
        assert.ok(bounds[3] < 1, `bottom cutoff at aspect ${aspect}, step ${step}`);
        if (step === 0 || step === 299) assert.ok(bounds[1] < 0 || bounds[0] > 1, `visible wrap at aspect ${aspect}`);
      }
    }
  }
  geometry.dispose();
});
