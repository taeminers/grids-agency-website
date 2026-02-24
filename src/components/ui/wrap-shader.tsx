"use client";

import { Warp } from "@paper-design/shaders-react";

export default function WarpShader() {
  return (
    <div className="absolute inset-0 z-0">
      <Warp
        style={{ height: "100%", width: "100%" }}
        proportion={0.45}
        softness={1}
        distortion={0.25}
        swirl={0.8}
        swirlIterations={10}
        shape="checks"
        shapeScale={0.1}
        scale={1}
        rotation={0}
        speed={1}
        colors={[
          "hsl(0, 0%, 0%)",
          "hsl(0, 0%, 10%)",
          "hsl(0, 0%, 20%)",
          "hsl(0, 0%, 100%)",
        ]}
      />
    </div>
  );
}
