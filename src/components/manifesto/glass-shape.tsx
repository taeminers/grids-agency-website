import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

function Scene() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const { resolvedTheme } = useTheme();
  
  // Colors based on globals.css
  // Light: Tertiary #e9620e, Secondary oklch(0.97 0 0) [approx #f5f5f5]
  // Dark: Tertiary #38bdf8, Secondary oklch(0.269 0 0) [approx #444]
  
  const isDark = resolvedTheme === 'dark';
  
  const colors = {
      sphere: isDark ? "#38bdf8" : "#e9620e",      // Tertiary
      accent: isDark ? "#0c4a6e" : "#efab6f",      // Tertiary Foreground
      lighting: isDark ? "#0a0a0a" : "#ffffff",    // Even dimmer lighting in dark
      glass: isDark ? "#0a0a0a" : "#ffffff"        // Pure black glass in dark mode
  };

  const envMapIntensity = isDark ? 0.05 : 1; // Almost zero reflections in dark mode
  const roughness = isDark ? 0.4 : 0.1;      // Matte in dark mode, glossy in light
  const clearcoat = isDark ? 0.5 : 1;        // Less clearcoat in dark mode
  
  const sphereEmissive = isDark ? 0.1 : 0.5; // Low glow in dark mode
  const sphereRoughness = isDark ? 0.5 : 0.2; // Matte sphere in dark mode

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      sphereRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  const numStrips = 20;
  const stripWidth = 0.6;
  
  return (
    <>
      <Environment preset="studio" />
      
      <group position={[0, 0, -2]}>
          {/* Main Sphere (Tertiary Color) */}
          <mesh ref={sphereRef} position={[2, 0, -2]} scale={2.5}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial 
                color={colors.sphere}
                emissive={colors.sphere}
                emissiveIntensity={sphereEmissive}
                roughness={sphereRoughness}
                metalness={0.1}
                envMapIntensity={envMapIntensity}
            />
          </mesh>

          {/* Accent Sphere */}
          <mesh position={[-3, -2, -4]} scale={1.5}>
             <sphereGeometry args={[1, 32, 32]} />
             <meshStandardMaterial color={colors.accent} roughness={0.1} envMapIntensity={envMapIntensity} />
          </mesh>
      </group>



       {/* Lighting */}
       <ambientLight intensity={isDark ? 0.8 : 1.5} />
       <pointLight position={[10, 10, 10]} intensity={isDark ? 1 : 2} color={colors.lighting} />
       <pointLight position={[-10, -10, -10]} intensity={isDark ? 0.5 : 1} color={colors.sphere} />
    </>
  );
}

export default function GlassShape() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {/* Background gradient handled by Theme/CSS, but we can add a base here */}
        <div className="absolute inset-0 bg-background/50 transition-colors duration-500" />
        
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true, antialias: true }}>
            <Suspense fallback={null}>
                <Scene />
            </Suspense>
        </Canvas>
    </div>
  );
}
