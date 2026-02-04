"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Stars, PerspectiveCamera } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

function AnimatedGrid({ isDark }: { isDark: boolean }) {
    const gridRef = useRef<any>(null);

    useFrame((state) => {
        if (gridRef.current) {
             // Subtle breathing/movement effect
             gridRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
             gridRef.current.rotation.z = state.clock.elapsedTime * 0.05;
        }
    });

    const gridColor = isDark ? "#333333" : "#000000";
    const sectionColor = isDark ? "#444444" : "#000000";

    return (
        <group rotation={[Math.PI / 3, 0, 0]}>
             {/* Main Grid: "XY Coordinate Plane" feel */}
            <Grid
                key={isDark ? "dark" : "light"}
                ref={gridRef}
                args={[20, 20]} // Width, Height
                cellSize={1}
                cellThickness={1}
                cellColor={gridColor}
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor={sectionColor}
                fadeDistance={50}
                infiniteGrid
                followCamera={false}
                side={2} // THREE.DoubleSide
            />

        </group>
    );
}

export default function VisionCanvas() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-full h-[60vh] md:h-[70vh] bg-background" />;

    const effectiveIsDark = resolvedTheme === 'dark';
    const fogColor = effectiveIsDark ? '#0b0b0b' : '#ffffff';

    return (
        <div className="w-full h-[60vh] md:h-[70vh] relative overflow-hidden bg-background">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
                <color attach="background" args={[fogColor]} />
                <fog attach="fog" args={[fogColor, 5, 30]} />
                <ambientLight intensity={0.5} />
                <AnimatedGrid isDark={effectiveIsDark} />
            </Canvas>
            
            {/* Vignette Overlay for focus */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)] pointer-events-none" />
        </div>
    );
}
