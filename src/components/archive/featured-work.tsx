"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeaturedWork() {
  const t = useTranslations("Archive");

  const featuredProjectsArg: {
      id: string;
      service: string;
      title: string;
      description: string;
      video?: string;
      image?: string;
      link: string;
      year: string;
  }[] = [
    {
      id: "web-dev",
      service: "Web Development & AI Video Production",
      title: "AETHER",
      description: "Next-gen e-commerce experience with immersive 3D interactions.",
      video: "/videos/aether-velum.mp4",
      link: "https://aetherfragrances.vercel.app/",
      year: "2025"
    },
    {
        id: "ai-video",
        service: "AI Video Production",
        title: "Cinematics",
        description: "Pushing the boundaries of generative AI video.",
        video: "/videos/tcl.mp4",
        link: "https://drive.google.com/drive/folders/1jMGQeDtEEHjjFct-hJTBl5PQHehL795N?usp=drive_link",
        year: "2024"
    }
  ];

  return (
    <section className="w-full bg-black relative z-10 pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col gap-32">
            
            {/* Header */}
            <div className="border-t border-white/10 pt-8 flex justify-between items-start">
                <h2 className="text-sm tracking-widest text-muted-foreground uppercase">Featured Work</h2>
                <div className="text-sm tracking-widest text-muted-foreground uppercase text-right">
                    Selected Projects <br/> 2025 — 2026
                </div>
            </div>

            {/* Projects Loop */}
            {featuredProjectsArg.map((project, index) => (
                <div key={project.id} className="group relative flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 items-center">
                    
                    {/* Project Number */}
                    <div className="col-span-1 text-sm text-muted-foreground/50 font-mono hidden md:block">
                        {(index + 1).toString().padStart(2, '0')}
                    </div>

                    {/* Visual Asset */}
                    <div 
                        className={cn(
                            "col-span-12 md:col-span-7 w-full aspect-video relative bg-card/5 border border-white/5 overflow-hidden transition-all duration-700 group-hover:border-white/20",
                            index % 2 === 1 ? "md:order-last" : "" 
                        )}
                    >
                         {project.video ? (
                            <video
                                src={project.video}
                                className="absolute inset-0 w-full h-full object-cover  transition-opacity duration-700"
                                muted
                                playsInline
                                loop
                                autoPlay
                            />
                        ) : (
                            <Image
                                src={project.image!}
                                alt={project.title}
                                fill
                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                            />
                        )}
                        
                        {/* Interactive Overlay */}
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                    </div>

                    {/* Content Info */}
                    <div 
                        className={cn(
                            "col-span-12 md:col-span-4 flex flex-col gap-6",
                             index % 2 === 1 ? "md:order-first md:text-right items-end" : "md:items-start"
                        )}
                    >
                        <div className={cn("flex flex-col gap-2", index % 2 === 1 ? "items-end" : "items-start")}>
                             <span className="w-fit text-xs flex justify-center tracking-widest text-blue-400/80 uppercase px-2 py-1 border border-blue-500/20 rounded-full bg-blue-500/5">
                                {project.service}
                            </span>
                            <h3 className="text-4xl md:text-6xl font-light tracking-tight text-white group-hover:text-blue-100 transition-colors duration-500">
                                {project.title}
                            </h3>
                        </div>
                        
                        <p className="text-muted-foreground font-light text-lg leading-relaxed max-w-sm">
                            {project.description}
                        </p>

                        <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-white/50 hover:text-white transition-colors mt-4 group/link"
                        >
                            View Project
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                        </a>
                    </div>

                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
