"use client";

import React from "react";
import { ArrowUpRight, Facebook, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";
import ConnectCanvas from "@/components/connect/connect-canvas";
import { ContactForm } from "@/components/connect/contact-form";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { EtheralShadow } from "@/components/ui/etheral-shadow";

export default function ConnectPage() {
    const t = useTranslations("Connect");

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pt-32 pb-16 md:pt-32 md:pb-32 font-sans text-foreground relative overflow-hidden">
            {/* Dynamic Background */}
            <EtheralShadow 
                color="rgba(255, 255, 255, 0.18)"
                animation={{ scale: 100, speed: 80 }}
                noise={{ opacity: 0.85, scale: 2.5 }}
                className="opacity-10 dark:opacity-100"
            />
            
            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                
    
              
                <div className="bg-card rounded-[2rem] p-4 md:p-8 shadow-sm border border-border">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        
                        {/* Left Column: Image & Sub-card */}
                        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
                            {/* Abstract Brand Image */}
                            {/* Abstract Brand Image / 3D Canvas */}
                            <div className="bg-tertiary/5 rounded-[1.5rem] w-full flex-grow relative overflow-hidden min-h-[250px] md:min-h-[400px]">
                                <ConnectCanvas />
                            </div>
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="lg:col-span-7 bg-muted/30 rounded-[1.5rem] p-6 md:p-12 h-full flex flex-col justify-center">
                            <ContactForm />
                        </div>

                    </div>
                </div>
                {/* 2. Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: t("Cards.address"), value: t("Cards.addressValue"), href: "https://www.google.com/maps/search/?api=1&query=435+Olympic-ro,+Songpa-gu,+Seoul,+Republic+of+Korea" },
                        { label: t("Cards.email"), value: t("Cards.emailValue"), href: `mailto:${t("Cards.emailValue")}` },    
                        { label: t("Cards.telegram"), value: t("Cards.telegramValue"), href: `https://t.me/${t("Cards.telegramValue").replace('@', '')}` },
                        { label: t("Cards.workingHours"), value: t("Cards.workingHoursValue"), href: "https://www.google.com/search?q=10am+kst+to+local+time" },
                    ].map((item, i) => {
                        const CardContent = (
                            <>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:bg-tertiary group-hover:text-white transition-colors">
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                                <span className="text-lg font-semibold text-foreground">{item.value}</span>
                            </>
                        );

                        return item.href ? (
                            <a 
                                key={i} 
                                href={item.href}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="bg-card rounded-[1.5rem] p-6 shadow-sm border border-border flex flex-col justify-between h-32 relative group hover:border-tertiary transition-colors cursor-pointer"
                            >
                                {CardContent}
                            </a>
                        ) : (
                            <div key={i} className="bg-card rounded-[1.5rem] p-6 shadow-sm border border-border flex flex-col justify-between h-32 relative group hover:border-tertiary transition-colors cursor-pointer">
                                {CardContent}
                            </div>
                        );
                    })}
                </div>

                {/* 3. Main Split Section */}
              

            </div>
        </div>
    );
}