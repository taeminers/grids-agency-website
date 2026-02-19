"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";

import HaloScene from "@/components/archive/halo-scene";
// const HaloScene = dynamic(() => import("@/components/archive/halo-scene"), { ssr: false });

interface ArchiveEntryProps {
  onEnter: () => void;
}

import { useTranslations } from "next-intl";

export function ArchiveEntry({ onEnter }: ArchiveEntryProps) {
    const t = useTranslations("Archive");
    return (
        <div className="w-full h-screen sticky top-0 overflow-hidden bg-background">
            {/* Background - 3D Halo */}
            <div className="absolute inset-0 z-1 pointer-events-none">
                <HaloScene />
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 w-full h-full flex flex-col justify-center p-8 md:p-24 pointer-events-none">
                <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 pointer-events-auto">
                    <h1 className="text-5xl md:text-8xl font-regular tracking-tighter text-foreground leading-[0.9]">
                        {t("Entry.title")}
                    </h1>
                    

                    <p className="text-base md:text-lg text-muted-foreground font-light max-w-md leading-relaxed">
                        {t("Entry.subtitle")}
                    </p>

                    <div className="pt-8 relative">
                        {/* Decorative Line for button grouping */}
                       

                        <button 
                            onClick={onEnter} 
                            className="group relative flex items-center gap-2 text-sm tracking-widest uppercase hover:text-foreground/80 transition-colors pl-8 md:pl-0"
                        >
                            <span className="relative z-10 border-b border-transparent group-hover:border-foreground transition-all duration-300">
                                {t("Entry.explore")}
                            </span>
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                        </button>
                    </div>
                </div>
                
                 <div className="absolute bottom-12 right-8 md:right-24 text-[10px] tracking-widest text-muted-foreground opacity-50 flex items-center gap-2 pointer-events-auto">
                    {t("Entry.checkFeatured")} <ArrowRight className="w-3 h-3 rotate-90" />
                </div>
            </div>

            {/* Interactive/Decorative Circle - Bottom Right */}
            <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center animate-spin-slow opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-1 h-1 bg-white rounded-full" />
            </div>
        </div>
    );
}
