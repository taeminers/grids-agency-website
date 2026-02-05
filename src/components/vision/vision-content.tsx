import { useTranslations } from "next-intl";
import React from "react";

export default function VisionContent() {
    const t = useTranslations("Vision");

    return (
        <>
            <div className="relative z-10 w-full h-[60vh] md:h-[70vh] flex items-center justify-center pointer-events-none">
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {t("title")}
                </h1>
            </div>

            {/* Content Quote */}
            <section className="container mx-auto px-4 py-32 relative z-10">
                 <div className="max-w-6xl mx-auto border-t border-l border-white/20 pt-8 pl-4 md:pl-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                        {/* Meta Column */}
                        <div className="md:col-span-4 flex justify-start gap-1 text-xs font-mono tracking-widest text-muted-foreground w-full">
                            <div className="flex justify-between items-center w-full border-b border-white/10 pb-2 mb-2">
                                <span>[ &quot; ]</span>
                                <span>Kyle Lee</span>
                           
                                <span>{t("Quote.role")}</span>
                            </div>
                                
                        </div>

                        {/* Quote Column */}
                        <div className="md:col-span-4">
                            <p className="text-3xl md:text-5xl font-medium leading-tight text-muted-foreground">
                                &quot;{t("Quote.textPart1")} <span className="text-foreground">{t("Quote.highlight1")}</span>{t("Quote.textPart2")} <span className="text-foreground">{t("Quote.highlight2")}</span>{t("Quote.textPart3")} <span className="text-foreground">{t("Quote.highlight3")}</span>{t("Quote.textPart4")}&quot;
                            </p>
                            
                        </div>
                    </div>
                 </div>
            </section>
        </>
    );
}
