"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Video, Bot } from "lucide-react";
import { useTranslations } from "next-intl";

interface ArchiveEntryProps {
  onEnter: () => void;
}

export function ArchiveEntry({ onEnter }: ArchiveEntryProps) {
    // const t = useTranslations("ArchiveEntry"); // Assuming key exists, or use hardcoded for now if not provided
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-24 relative overflow-hidden">
             {/* Background Decoration - subtle grid or gradient to match theme */}
            <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
            
            <div className="max-w-5xl w-full z-10 space-y-16">
                
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-7xl font-light tracking-tighter text-foreground">
                        ARCHIVE
                    </h1>
                 </div>

                {/* Three Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Web Development */}
                    <div className="group flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card/5 border border-border/50 hover:bg-card/10 transition-colors duration-500">
                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Code className="w-8 h-8 text-primary/80" />
                        </div>
                        <h3 className="text-xl font-medium tracking-wide">Web Development</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px]">
                            Crafting immersive digital experiences with modern technologies and clean code.
                        </p>
                    </div>

                    {/* Videos */}
                    <div className="group flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card/5 border border-border/50 hover:bg-card/10 transition-colors duration-500">
                         <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Video className="w-8 h-8 text-primary/80" />
                        </div>
                        <h3 className="text-xl font-medium tracking-wide">Videos</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px]">
                             Cinematic storytelling through motion, editing, and visual creativity.
                        </p>
                    </div>

                    {/* Automation */}
                    <div className="group flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card/5 border border-border/50 hover:bg-card/10 transition-colors duration-500">
                         <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Bot className="w-8 h-8 text-primary/80" />
                        </div>
                        <h3 className="text-xl font-medium tracking-wide">Automation</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px]">
                            Streamlining workflows and enhancing efficiency with intelligent systems.
                        </p>
                    </div>
                </div>

                {/* Enter Button */}
                <div className="flex justify-center pt-8">
                    <Button 
                        onClick={onEnter} 
                        size="lg"
                        className="rounded-full px-8 py-6 text-lg group relative overflow-hidden"
                    >
                         <span className="relative z-10 flex items-center gap-2">
                            View Grid <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
