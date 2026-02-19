"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Float } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

function HaloRing() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pendulum swing (Left-Right on Z axis)
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      
      // Slight "breathing" tilt on X (Forward-Back)
      meshRef.current.rotation.x = Math.PI / 1.8 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05;

      // Minimize Y rotation (spinning) to keep it facing mostly forward
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 8]}> {/* Slight initial tilt */}
      <mesh ref={meshRef}>
        {/* Thicker ring for more presence */}
        <torusGeometry args={[3.2, 0.15, 64, 200]} />
        <meshPhysicalMaterial
          color={isDark ? "#000000" : "#ffffff"} 
          roughness={0.2}
          metalness={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          envMapIntensity={2} // Stronger reflections from environment
        />
      </mesh>
    </group>
  );
}

// Custom shader for soft, glowing aurora-like rays
const AuroraRayMaterial = {
  uniforms: {
    uColor: { value: new THREE.Color("#e0f7ff") },
    uOpacity: { value: 0.15 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uTime;
    varying vec2 vUv;
    
    // Pseudo-random noise
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Aurora distortion - Wavy movement
      float wave = sin(vUv.y * 5.0 + uTime * 0.5) * 0.1;
      float distortedX = vUv.x + wave;

      // Soft edges on the sides (X axis) creating a "beam" shape
      float beam = smoothstep(0.0, 0.4, distortedX) * smoothstep(1.0, 0.6, distortedX);
      
      // Fade out at the bottom (Y axis) - CUT OFF AT MIDDLE
      // 0.0 to 0.5 is faded out, 0.5 to 0.8 is transition, 0.8+ is full visibility
      float fade = smoothstep(0.4, 0.6, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
      
      // Dynamic noise for shimmering effect
      float noise = random(vUv * 20.0 + uTime * 0.2) * 0.15;
      
      // Boost brightness at the core
      float core = smoothstep(0.4, 0.5, distortedX) * smoothstep(0.6, 0.5, distortedX) * 1.5;

      gl_FragColor = vec4(uColor, ((beam + core) * fade + noise) * uOpacity);
    }
  `
};

function AuroraRays() {
  const groupRef = useRef<THREE.Group>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Re-create materials when theme changes to handle blending/color correctly
  const mat1 = useMemo(() => new THREE.ShaderMaterial({
      ...AuroraRayMaterial,
      transparent: true,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      side: THREE.DoubleSide,
      uniforms: {
          uColor: { value: new THREE.Color(isDark ? "#e0fbff" : "#1a1a1a") }, 
          uOpacity: { value: isDark ? 0.12 : 0.05 }, // Lower opacity for dark rays on white?
          uTime: { value: 0 }
      }
  }), [isDark]);

  const mat2 = useMemo(() => mat1.clone(), [mat1]);
  const mat3 = useMemo(() => mat1.clone(), [mat1]); // Third ray
  
  useFrame((state) => {
    if (groupRef.current) {
        // Slow rotation of the whole group
        groupRef.current.rotation.z = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
        
        // Update shader time for waves
        mat1.uniforms.uTime.value = state.clock.elapsedTime;
        mat2.uniforms.uTime.value = state.clock.elapsedTime + 50;
        mat3.uniforms.uTime.value = state.clock.elapsedTime + 100;
    }
  });

  return (
    <group ref={groupRef} position={[-5, 5, -5]} rotation={[0, 0, Math.PI / 4]}>
      {/* Main Aurora Sheet */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[15, 50, 16, 16]} /> {/* More segments for smooth shader waves if using verts, currently frag */}
        <primitive object={mat1} attach="material" />
      </mesh>
      
      {/* Secondary Sheet */}
      <mesh position={[3, 0, 2]} rotation={[0, 0.2, -0.1]} scale={[0.8, 1, 1]}>
        <planeGeometry args={[10, 45]} />
         <primitive object={mat2} attach="material" />
      </mesh>

      {/* Tertiary Faint Background Sheet */}
      <mesh position={[-3, 0, -2]} rotation={[0, -0.2, 0.1]} scale={[1.2, 1, 1]}>
         <planeGeometry args={[18, 55]} />
         <primitive object={mat3} attach="material" />
      </mesh>
    </group>
  );
}

export default function HaloScene() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [opacity, setOpacity] = useState(0);

    // Fade in effect
    useEffect(() => {
        const timer = setTimeout(() => setOpacity(1), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div 
            className="w-full h-full min-h-[50vh] transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity }}
        >
            <Canvas dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={40} />
                
                <color attach="background" args={[isDark ? '#050505' : '#ffffff']} />
                {/* Fog to blend the ring into the void */}
                <fog attach="fog" args={[isDark ? '#050505' : '#ffffff', 8, 25]} />
                
                 <AuroraRays />

                {/* Main Sunlight - Top Left */}
                <directionalLight 
                    position={[-10, 10, 5]} 
                    intensity={2} 
                    color={isDark ? "#fff8e7" : "#fff"} 
                    castShadow
                    shadow-bias={-0.0001}
                />
                
                {/* Subtle Fill Light from opposite side (Bottom Right) */}
                 <spotLight position={[10, -5, -5]} angle={0.5} penumbra={1} intensity={100} color="#a0a0a0" />

                {/* Studio environment for metallic reflections - lowered intensity to let sunlight dominate */}
                <Environment preset="city" environmentIntensity={isDark ? 0.3 : 0.5} />

                <HaloRing />
            </Canvas>
        </div>
    );
}
