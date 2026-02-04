"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import CoreValueAnimation from "./core-values/core-value-animation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";

import { useTranslations } from "next-intl";

const values = [
  {
    id: 1,
    color: "bg-[#1C1C1C]", // Dark charcoal
    textColor: "text-white"
  },
  {
    id: 2,
    color: "bg-[#E8E6D9]", // Light beige
    textColor: "text-black"
  },
  {
    id: 3,
    color: "bg-[#283E4A]", // Sophisticated blue-grey
    textColor: "text-white"
  },
  {
    id: 4,
    color: "bg-[#C4D9D3]", // Muted sage/mint
    textColor: "text-black"
  }
];

export default function CoreValuesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0); 
  const t = useTranslations("CoreValues");

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col mb-12">
            <span className="text-sm font-mono text-tertiary mb-2 tracking-wider uppercase">{t("label")}</span>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">{t("title")}</h2>
        </div>

        {/* Desktop View (md+) */}
        <div className="hidden md:flex h-[600px] gap-4 w-full">
          {values.map((value, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={value.id}
                onMouseEnter={() => setHoveredIndex(index)}
                className={cn(
                  "relative h-full rounded-3xl overflow-hidden cursor-pointer transition-[flex] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group",
                  isHovered ? "flex-[3]" : "flex-[1]",
                  value.color,
                  value.textColor
                )}
              >
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}>
                    <CoreValueAnimation id={value.id} />
                  </div>
                  
                {/* Content Overlay */}
                <div className={cn(
                    "absolute inset-0 p-8 flex flex-col justify-between transition-opacity duration-500",
                    isHovered ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                    value.textColor
                )}>
                   
                   {/* Top Content (Title) */}
                   <div className={cn(
                        "transition-all duration-500",
                        isHovered ? "translate-y-0" : ""
                   )}>
                       <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-3">
                            {t(`items.item${value.id}.subtitle`)}
                       </span>
                       <h3 className="text-3xl font-medium leading-tight text-balance">
                            {t(`items.item${value.id}.title`)}
                       </h3>
                   </div>

                   {/* Bottom Content (Description) */}
                   <div className={cn(
                        "transition-all duration-500",
                        isHovered ? "delay-300 translate-y-0 opacity-100" : "delay-0 translate-y-4 opacity-0"
                   )}>
                        <p className={cn(
                            "text-lg leading-relaxed max-w-md",
                            value.textColor === "text-white" ? "text-white/80" : "text-black/80"
                        )}>
                            {t(`items.item${value.id}.description`)}
                        </p>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View (< md) - Carousel */}
        <div className="md:hidden w-full">
             <Carousel 
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
             >
                <CarouselContent className="-ml-4">
                    {values.map((value) => (
                        <CarouselItem key={value.id} className="pl-4 basis-1/2">
                            <div className={cn(
                                "aspect-[3/4] rounded-2xl p-6 flex flex-col justify-between",
                                value.color,
                                value.textColor
                            )}>
                                <CoreValueAnimation id={value.id} />
                                <div>
                                    <span className="text-xs font-medium opacity-80 uppercase tracking-wider block mb-2">{t(`items.item${value.id}.subtitle`)}</span>
                                    <h3 className="text-xl font-medium">{t(`items.item${value.id}.title`)}</h3>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="flex justify-start gap-1 mt-4 pl-4">
                    <CarouselPrevious className="static translate-y-0 translate-x-0 left-auto right-auto top-auto bottom-auto" />
                    <CarouselNext className="static translate-y-0 translate-x-0 left-auto right-auto top-auto bottom-auto" />
                </div>
             </Carousel>
        </div>

      </div>
    </section>
  );
}
