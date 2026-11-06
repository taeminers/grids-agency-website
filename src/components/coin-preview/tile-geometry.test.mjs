import assert from "node:assert/strict";
import { test } from "node:test";
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { TileGeometry } from "./tile-geometry.ts";

test("tile preserves the approved dimensions and has flat faces without a raised rim", () => {
  const geometry = new TileGeometry();
  const material = new MeshBasicMaterial();
  try {
    const size = geometry.boundingBox.getSize(new Vector3());
    for (const [actual, expected] of [[size.x, 1.9], [size.y, 1.9], [size.z, 0.6]]) {
      assert.ok(Math.abs(actual - expected) < 1e-6);
    }
    const positions = geometry.getAttribute("position");
    const centers = [];
    for (let index = 0; index < positions.count; index++) {
      if (positions.getX(index) === 0 && positions.getY(index) === 0) centers.push(positions.getZ(index));
    }
    assert.equal(centers.length, 2);
    assert.ok(centers[0] < 0 && centers[1] > 0);
    assert.ok(centers.every((z) => Math.abs(Math.abs(z) - size.z / 2) < 1e-6));
    const tile = new Mesh(geometry, material);
    const ray = new Raycaster();
    for (const side of [-1, 1]) {
      for (const x of [-0.7, -0.35, 0, 0.35, 0.7]) {
        for (const y of [-0.7, -0.35, 0, 0.35, 0.7]) {
          ray.set(new Vector3(x, y, side * 2), new Vector3(0, 0, -side));
          const hit = ray.intersectObject(tile)[0];
          assert.ok(hit, "face must have no holes");
          assert.ok(Math.abs(hit.point.z - side * 0.3) < 1e-6, "face must remain flat across its interior");
        }
      }
    }
  } finally {
    geometry.dispose();
    material.dispose();
  }
});

test("tile is a closed, consistently wound solid without degenerate triangles", () => {
  const geometry = new TileGeometry();
  try {
    const positions = geometry.getAttribute("position");
    const edges = new Map();
    const a = new Vector3();
    const b = new Vector3();
    const c = new Vector3();
    let signedVolume = 0;

    for (let index = 0; index < geometry.index.count; index += 3) {
      const ids = [0, 1, 2].map((offset) => geometry.index.getX(index + offset));
      a.fromBufferAttribute(positions, ids[0]);
      b.fromBufferAttribute(positions, ids[1]);
      c.fromBufferAttribute(positions, ids[2]);
      const normal = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a));
      assert.ok(normal.lengthSq() > 1e-16, `degenerate triangle ${index / 3}`);
      signedVolume += a.dot(new Vector3().crossVectors(b, c)) / 6;

      for (let edge = 0; edge < 3; edge++) {
        const from = ids[edge];
        const to = ids[(edge + 1) % 3];
        const key = `${Math.min(from, to)}:${Math.max(from, to)}`;
        const uses = edges.get(key) ?? [];
        uses.push(from < to ? 1 : -1);
        edges.set(key, uses);
      }
    }
    for (const [key, uses] of edges) {
      assert.equal(uses.length, 2, `open or non-manifold edge ${key}`);
      assert.equal(uses[0] + uses[1], 0, `inconsistent winding at ${key}`);
    }
    assert.ok(signedVolume > 0, "normals must point outward");

    const normals = geometry.getAttribute("normal");
    for (let index = 0; index < normals.count; index++) {
      const length = new Vector3().fromBufferAttribute(normals, index).length();
      assert.ok(Number.isFinite(length) && Math.abs(length - 1) < 1e-5);
    }
  } finally {
    geometry.dispose();
  }
});
