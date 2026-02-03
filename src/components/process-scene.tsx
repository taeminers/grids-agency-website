"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import * as THREE from 'three';
import { useThree } from "@react-three/fiber";
import { Environment, Float, ContactShadows, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

gsap.registerPlugin(ScrollTrigger);

export default function ProcessScene() {
  const foundationRef = useRef<THREE.Group>(null);
  const wallsRef = useRef<THREE.Group>(null);
  const roofRef = useRef<THREE.Group>(null);
  const decorRef = useRef<THREE.Group>(null);
  const garageRef = useRef<THREE.Group>(null);
  
  const { scene, viewport } = useThree();
  const isMobile = viewport.width < 7;
  const scale = isMobile ? 0.5 : 1;
  const positionX = isMobile ? 0.5 : 0;

  useGSAP(() => {
    
    // Timeline attached to the main scroll container in parent
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#process-container", // ID in parent
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      }
    });

    // 1. Foundation: Rise up
    tl.fromTo(foundationRef.current!.position, 
        { y: 10 }, 
        { y: 0, duration: 1.5, ease: "power2.out" }
    )
    .fromTo(foundationRef.current!.scale,
        { x: 0.8, z: 0.8 },
        { x: 1, z: 1, duration: 1.5, ease: "power2.out" },
        "<"
    );

    // 2. Walls: Drop Down
    tl.fromTo(wallsRef.current!.position,
        { y: 10 },
        { y: 0, duration: 1.5, ease: "power2.out" }
    );

    // 3. Roof: Drop Down
    tl.fromTo(roofRef.current!.position,
        { y: 10 },
        { y: 0, duration: 1.5, ease: "power2.out" }
    );

    // 4. Decor/Polish: Spin & Scale
    tl.fromTo(decorRef.current!.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 2, ease: "elastic.out(1, 0.5)" }
    );

    // 5. Garage Extension: Drop Down (Phase 4 - Polish)
    tl.fromTo(garageRef.current!.position,
        { y: 10 },
        { y: 0, duration: 1.5, ease: "power2.out" },
        "<+=0.2"
    );

    // Rotation removed as per user request to keep it static facing forward
    // tl.to(scene.rotation, { ... })


  }, { dependencies: [] });

  return (
    <>
        <Environment preset="city" />
        
        {/* Float removed as per user request */}
            <group rotation={[0, 0.5, 0]} scale={scale} position={[positionX, 0, 0]}> 
            
            {/* 1. Foundation (Base + Steps) */}
            <group ref={foundationRef}>
                {/* Main Slab */}
                <RoundedBox args={[4, 0.5, 4]} radius={0.05} smoothness={4} position={[0, -0.25, 0]} receiveShadow>
                    <meshStandardMaterial color="#444" roughness={0.8} />
                </RoundedBox>
                {/* Deck/Patio Area - Floating Step effect */}
                <RoundedBox args={[2, 0.1, 1]} radius={0.02} smoothness={4} position={[0, -0.15, 2.2]} receiveShadow>
                    <meshStandardMaterial color="#333" roughness={0.9} />
                </RoundedBox>
            </group>

            {/* 2. Walls (Detailed Structure) */}
            <group ref={wallsRef} position={[0, 10, 0]}>
                
                {/* Main Core */}
                <RoundedBox args={[3.5, 2.5, 3.5]} radius={0.05} smoothness={4} position={[0, 1.25, 0]} castShadow receiveShadow>
                     <meshStandardMaterial color="#F2F2F2" roughness={0.5} />
                </RoundedBox>
                
                {/* Window Frames (Architectural Noise) */}
                {/* Front Window */}
                <group position={[0.85, 1.5, 1.76]}>
                     {/* Frame */}
                    <RoundedBox args={[1.3, 1.3, 0.1]} radius={0.02} smoothness={4} position={[0, 0, -0.05]}>
                        <meshStandardMaterial color="#1A1A1A" roughness={0.2} metalness={0.5} />
                    </RoundedBox>
                    {/* Glass Pane (Recessed) */}
                    <RoundedBox args={[1.1, 1.1, 0.05]} radius={0.01} smoothness={4} position={[0, 0, 0]}>
                        <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.9} opacity={0.6} transparent />
                    </RoundedBox>
                </group>

                {/* Side Window */}
                <group position={[1.76, 1.5, 0]} rotation={[0, Math.PI/2, 0]}>
                    {/* Frame */}
                    <RoundedBox args={[1.3, 1.3, 0.1]} radius={0.02} smoothness={4} position={[0, 0, -0.05]}>
                        <meshStandardMaterial color="#1A1A1A" roughness={0.2} metalness={0.5} />
                    </RoundedBox>
                     {/* Glass Pane (Recessed) */}
                     <RoundedBox args={[1.1, 1.1, 0.05]} radius={0.01} smoothness={4} position={[0, 0, 0]}>
                        <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.9} opacity={0.6} transparent />
                    </RoundedBox>
                </group>

                 {/* Door Frame (Recessed) */}
                <group position={[-1, 0.75, 1.76]}>
                    {/* Frame */}
                    <RoundedBox args={[1.0, 1.6, 0.15]} radius={0.02} smoothness={4} position={[0, 0, -0.05]}>
                         <meshStandardMaterial color="#1A1A1A" roughness={0.2} />
                    </RoundedBox>
                    {/* Door */}
                    <RoundedBox args={[0.8, 1.4, 0.05]} radius={0.02} smoothness={4} position={[0, 0, 0.02]}>
                         <meshStandardMaterial color="#333" roughness={0.2} />
                    </RoundedBox>
                </group>

            </group>

            {/* 3. Roof (Modern Flat + Overhang) */}
            <group ref={roofRef} position={[0, 10, 0]}>
                {/* Main Roof */}
                <RoundedBox args={[4.2, 0.2, 4.2]} radius={0.02} smoothness={4} position={[0, 2.6, 0]}>
                    <meshStandardMaterial color="#1A1A1A" roughness={0.5} metalness={0.2} />
                </RoundedBox>
                {/* Second Level Detail */}
                 <RoundedBox args={[2, 0.4, 2]} radius={0.02} smoothness={4} position={[0.5, 2.9, 0.5]}>
                    <meshStandardMaterial color="#222" roughness={0.5} />
                </RoundedBox>
            </group>
            
            {/* 4. Decor (Chimney, Lights) */}
            <group ref={decorRef} position={[1, 3.2, 0.5]}>
                {/* Chimney */}
                <RoundedBox args={[0.4, 1.2, 0.4]} radius={0.02} smoothness={4}>
                    <meshStandardMaterial color="#444" roughness={0.8} />
                </RoundedBox>
                 {/* Light Emissive */}
                 <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.01} smoothness={4} position={[0, 0.5, 0]}>
                    <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={3} toneMapped={false} />
                </RoundedBox>
            </group>

            {/* 5. Garage Extension (Attached Side Building) */}
            <group ref={garageRef} position={[-3.25, 0, 0.5]}>
                 {/* Garage Foundation */}
                 <RoundedBox args={[2.5, 0.5, 3]} radius={0.05} smoothness={4} position={[0, -0.25, 0]} receiveShadow>
                    <meshStandardMaterial color="#444" roughness={0.8} />
                 </RoundedBox>
                 {/* Garage Structure */}
                 <RoundedBox args={[2.5, 2, 3]} radius={0.05} smoothness={4} position={[0, 1, 0]} castShadow receiveShadow>
                     <meshStandardMaterial color="#F2F2F2" roughness={0.5} />
                 </RoundedBox>
                 {/* Garage Door */}
                 <RoundedBox args={[2.0, 1.6, 0.1]} radius={0.02} smoothness={4} position={[0, 0.8, 1.5]}>
                     <meshStandardMaterial color="#333" roughness={0.4} metalness={0.4} />
                 </RoundedBox>
                 {/* Overhang/Detail */}
                 <RoundedBox args={[2.6, 0.1, 3.1]} radius={0.02} smoothness={4} position={[0, 2.05, 0]}>
                     <meshStandardMaterial color="#1A1A1A" roughness={0.5} metalness={0.2} />
                 </RoundedBox>
            </group>

            {/* Additional Light Sources */}
            <pointLight position={[2, 2, 2]} intensity={1} color="#ffeebb" distance={5} decay={2} />
            <ambientLight intensity={0.5} />
            
            </group>
        {/* </Float> */}

        <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={2} 
            far={4} 
        />

        <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.2} radius={0.5} />
        </EffectComposer>
    </>
  );
}
