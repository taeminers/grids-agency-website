"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function ManifestoSection() {
  const t = useTranslations("Manifesto");

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Tagline */}
          <div className="flex flex-col">
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tighter whitespace-pre-line text-foreground/90">
                {t("tagline")}
             </h2>
          </div>

          {/* Right Column: Description & CTA */}
          <div className="flex flex-col gap-8 md:pt-4">
             <p className="text-2xl md:text-3xl lg:text-4xl leading-tight font-medium text-foreground/80 text-balance">
                {t("description")}
             </p>
             <div>
                <a href="/connect" className="group inline-flex items-center gap-2 text-red-500 font-medium text-lg hover:text-red-400 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-red-500 group-hover:bg-red-400 transition-colors"></span>
                    {t("cta")}
                </a>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
