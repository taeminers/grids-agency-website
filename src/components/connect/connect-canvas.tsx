"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Environment, ContactShadows, TorusKnot, MeshTransmissionMaterial } from "@react-three/drei";

export default function ConnectCanvas() {
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                <Suspense fallback={null}>
                    <Environment preset="city" />
                    
                    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
                        {/* Abstract Knot representing connection/complexity */}
                        <TorusKnot args={[1.5, 0.4, 128, 32]} rotation={[0, 0, 0]}>
                            <MeshTransmissionMaterial 
                                backside
                                thickness={1.5}
                                roughness={0.0}
                                transmission={1}
                                chromaticAberration={0.4}
                                anisotropicBlur={0.3}
                                distortion={0.4}
                                distortionScale={0.4}
                                temporalDistortion={0.2}
                                samples={8}
                                resolution={512}
                                background={undefined}
                                color="#ffffff" 
                            />
                        </TorusKnot>
                    </Float>

                    {/* Simple ambient light to ensure visibility */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 10, 5]} intensity={2} color="white" />
                    <spotLight position={[-10, 10, -5]} intensity={1} color="#e9620e" /> {/* Hint of orange/tertiary */}

                    <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={15} blur={3} far={4.5} />
                </Suspense>
            </Canvas>
        </div>
    );
}
