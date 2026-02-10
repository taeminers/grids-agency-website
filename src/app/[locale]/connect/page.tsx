"use client";

import React from "react";
import { ArrowUpRight, Facebook, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";
import ConnectCanvas from "@/components/connect/connect-canvas";
import { ContactForm } from "@/components/connect/contact-form";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ConnectPage() {
    const t = useTranslations("Connect");

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pt-32 pb-16 md:pt-32 md:pb-32 font-sans text-foreground">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* 1. Header Section */}
                <div className="bg-card rounded-[2rem] p-8 md:p-12 shadow-sm flex flex-col lg:flex-row justify-between gap-12 relative overflow-hidden">
                    {/* Glow Effect matching reference but with tertiary color */}
                    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-tertiary/40 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl pt-20 lg:pt-0">
                        <h1 className="text-5xl md:text-7xl font-semibold leading-tight tracking-tight text-foreground">
                            {t("titlePrefix")}
                            <span className="inline-block text-tertiary px-2 -rotate-1 mx-1 rounded-lg relative">
                                {/* Subtle backing for the highlight text to pop on dark */}
                                <span className="absolute inset-0  rounded-lg -z-10"></span>
                                {t("titleHighlight")}
                            </span>
                        </h1>
                    </div>

                    <div className="relative z-10 max-w-md flex flex-col justify-center space-y-8">
                        <p className="text-neutral-400 text-lg leading-relaxed">
                        {t("description")}</p>
                    </div>
                </div>

                {/* 2. Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: t("Cards.address"), value: t("Cards.addressValue"), href: "https://www.google.com/maps/search/?api=1&query=435+Olympic-ro,+Songpa-gu,+Seoul,+Republic+of+Korea" },
                        { label: t("Cards.email"), value: "hello@gridsagency.com", href: "mailto:hello@gridsagency.com" },    
                        { label: t("Cards.telegram"), value: "@kyle_lee10", href: "https://t.me/kyle_lee10" },
                        { label: t("Cards.workingHours"), value: "10:00 am - 7:00 pm(KST)", href: "https://www.google.com/search?q=10am+kst+to+local+time" },
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
                <div className="bg-card rounded-[2rem] p-4 md:p-8 shadow-sm border border-border">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column: Image & Sub-card */}
                        <div className="lg:col-span-5 flex flex-col gap-4">
                            {/* Abstract Brand Image */}
                            {/* Abstract Brand Image / 3D Canvas */}
                            <div className="bg-tertiary/5 rounded-[1.5rem] aspect-square w-full relative overflow-hidden">
                                <ConnectCanvas />
                            </div>
                            
                            {/* Partnership Card */}
                            {/* Partnership Card / Instagram */}
                            {/* <a 
                                href="https://www.instagram.com/gridsagency" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-card border border-border rounded-[1.5rem] p-6 flex items-center justify-between shadow-sm cursor-pointer hover:border-tertiary transition-colors group"
                            >
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">{t("Cards.partnerships")}</p>
                                    <p className="text-sm font-semibold text-foreground">@gridsagency</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:bg-tertiary transition-colors">
                                    <ArrowUpRight size={16} />
                                </div>
                            </a> */}
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="lg:col-span-7 bg-muted/30 rounded-[1.5rem] p-6 md:p-12">
                            <ContactForm />
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}