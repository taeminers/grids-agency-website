"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const VisionCanvas = dynamic(() => import("@/components/vision-canvas"), { ssr: false });
const VisionEvolution = dynamic(() => import("@/components/vision/vision-evolution"), { ssr: false });

export default function VisionPageClient({ children }: { children: ReactNode }) {
    return (
        <div className="w-full min-h-screen pt-20 bg-background">
            {/* Hero / Vision Canvas Section */}
            <section className="relative w-full flex flex-col items-center justify-center">
                <div className="absolute inset-0 z-0">
                     <VisionCanvas />
                </div>
                {children}
            </section>
            
            <VisionEvolution />
        </div>
    );
}
