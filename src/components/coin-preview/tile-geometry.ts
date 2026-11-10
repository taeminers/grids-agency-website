import { BufferGeometry, Float32BufferAttribute } from "three";

type ProfilePoint = { halfWidth: number; z: number };

/** A closed solid with rounded outer edges and uninterrupted flat faces. */
export class TileGeometry extends BufferGeometry {
  constructor() {
    super();

    // Preserve the approved 1.9 × 1.9 × 0.6 proportions. Sweeping one rounded
    // square contour along this profile avoids intersecting shells, which is
    // important when we introduce transmissive materials in the next stage.
    const front: ProfilePoint[] = [{ halfWidth: 0.95, z: 0 }];
    const bevelSteps = 12;
    for (let step = 0; step <= bevelSteps; step++) {
      const angle = (step / bevelSteps) * Math.PI / 2;
      front.push({
        halfWidth: 0.84 + 0.11 * Math.cos(angle),
        z: 0.19 + 0.11 * Math.sin(angle),
      });
    }
    // A flat strip before the cap keeps the broad face normals planar.
    front.push({ halfWidth: 0.81, z: 0.3 });

    const profile = [
      ...front.slice(1).reverse().map(({ halfWidth, z }) => ({ halfWidth, z: -z })),
      ...front,
    ];
    const cornerSteps = 20;
    const ringSize = 4 * (cornerSteps + 1);
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (const { halfWidth, z } of profile) {
      const radius = halfWidth * (0.24 / 0.95);
      const center = halfWidth - radius;
      const corners = [[center, center], [-center, center], [-center, -center], [center, -center]];

      for (let corner = 0; corner < 4; corner++) {
        for (let step = 0; step <= cornerSteps; step++) {
          const angle = (corner + step / cornerSteps) * Math.PI / 2;
          const x = corners[corner][0] + Math.cos(angle) * radius;
          const y = corners[corner][1] + Math.sin(angle) * radius;
          positions.push(x, y, z);
          uvs.push(x / 1.9 + 0.5, y / 1.9 + 0.5);
        }
      }
    }

    for (let ring = 0; ring < profile.length - 1; ring++) {
      for (let point = 0; point < ringSize; point++) {
        const next = (point + 1) % ringSize;
        const a = ring * ringSize + point;
        const b = ring * ringSize + next;
        const c = (ring + 1) * ringSize + next;
        const d = (ring + 1) * ringSize + point;
        indices.push(a, b, c, a, c, d);
      }
    }

    const backCenter = positions.length / 3;
    positions.push(0, 0, profile[0].z);
    uvs.push(0.5, 0.5);
    const frontCenter = positions.length / 3;
    positions.push(0, 0, profile[profile.length - 1].z);
    uvs.push(0.5, 0.5);
    const lastRing = (profile.length - 1) * ringSize;
    for (let point = 0; point < ringSize; point++) {
      const next = (point + 1) % ringSize;
      indices.push(backCenter, next, point);
      indices.push(frontCenter, lastRing + point, lastRing + next);
    }

    this.setAttribute("position", new Float32BufferAttribute(positions, 3));
    this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    this.setIndex(indices);
    this.computeVertexNormals();
    this.computeBoundingBox();
    this.computeBoundingSphere();
  }
}
