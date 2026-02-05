"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Services3D from "@/components/services/services-3d";
import AutomationAnimation from "@/components/services/automation-animation";
import WebDesignCombined from "@/components/services/web-design-combined";
import ServiceItem from "@/components/services/service-item";
import { Button } from "@/components/ui/button";

// --- Icons ---
// Abstract icons for the accordion items to match the reference style
const Icons = {
  Web: () => (
    <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-current rounded-sm rotate-45" />
    </div>
  ),
  Brand: () => (
    <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-current rounded-full" />
    </div>
  ),
  Marketing: () => (
    <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center">
        <div className="flex gap-1">
            <div className="w-2 h-2 bg-current rounded-full" />
            <div className="w-2 h-2 bg-current rounded-full" />
             <div className="w-2 h-2 bg-current rounded-full" />
        </div>
    </div>
  ),
};

// --- Main Component ---

export default function ServicesSection() {
  const t = useTranslations('Services');
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default open first

  const services = [
    {
      id: "item1",
      icon: Icons.Web,
      number: "[01]",
      customContent: <WebDesignCombined />
    },
    {
      id: "item2",
      icon: Icons.Brand, // You might want to change this icon too if it's video, but keeping as is for now
      number: "[02]",
      videoSrc: "/videos/video-creation.mp4"
    },
    {
      id: "item3",
      icon: Icons.Marketing,
      number: "[03]",
      customContent: <AutomationAnimation />
    },
  ];

  const container = useRef(null);
  const { contextSafe } = useGSAP({ scope: container });

  const onEnter = contextSafe(() => {
    gsap.to(".cta-text", { yPercent: -100, duration: 0.3, ease: "power2.out" });
  });

  const onLeave = contextSafe(() => {
    gsap.to(".cta-text", { yPercent: 0, duration: 0.3, ease: "power2.out" });
  });

  return (
    <section className="relative w-full min-h-screen bg-background py-24 md:py-32 overflow-hidden">
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row">
          
          {/* LEFT COLUMN: Sticky Content & 3D */}
          <div className="w-full lg:w-5/12 relative lg:pr-20">
            <div className="lg:sticky lg:top-32 flex flex-col h-full justify-between gap-12">
                
                {/* Text Content */}
              <div className="space-y-8">
                <span className="text-sm font-mono text-tertiary tracking-wider uppercase">
              Our Services
                </span>
                <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.1]">
                  {t('title')}
                </h2>
                <p className="text-lg text-muted-foreground max-w-md">
                   {t('description')}
                </p>
                {/* <div className="pt-2">
                    <Button 
                        ref={container}
                        onMouseEnter={onEnter}
                        onMouseLeave={onLeave}
                        className="bg-tertiary text-white hover:bg-tertiary/90 px-8 rounded-full overflow-hidden relative"
                    >
                        <div className="relative overflow-hidden h-5 flex items-center">
                            <span className="cta-text block">
                                {t('cta')}
                            </span>
                            <span className="cta-text absolute top-full left-0 block">
                                {t('cta')}
                            </span>
                        </div>
                    </Button>
                </div> */}
              </div>

               {/* 3D Canvas Area */}
               <Services3D />
            </div>
          </div>

          {/* RIGHT COLUMN: Accordion */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center lg:border-l border-border/40">
            <div className="w-full">
              {services.map((service, index) => (
                <ServiceItem
                  key={service.id}
                  number={service.number}
                  title={t(`Items.${service.id}.title`)}
                  desc={t(`Items.${service.id}.desc`)}
                  Icon={service.icon}
                  videoSrc={service.videoSrc}
                  customContent={service.customContent}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(index === openIndex ? null : index)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
