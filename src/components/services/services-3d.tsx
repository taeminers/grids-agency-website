"use client";

import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, PresentationControls, Environment } from "@react-three/drei";

function AbstractShape() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[1, 100, 200]} scale={1.8}>
        <MeshDistortMaterial
          color="#e9620e" // Default orange, will be overridden by lighting/env or props if needed
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="city" />
      <PresentationControls
        global={false} // Spin the model, not the camera
        cursor={true}
        snap={true} // Snap back to center
        speed={1.5}
        zoom={0.8}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]} // Vertical limits
        azimuth={[-Math.PI / 4, Math.PI / 4]} // Horizontal limits
      >
        <AbstractShape />
      </PresentationControls>
    </>
  );
}

export default function Services3D() {
  return (
    <div className="relative w-full aspect-square bg-muted/30 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-border/50">
      <div className="absolute inset-4 z-10 pointer-events-none">
        <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">Interactive Mode</span>
      </div>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
