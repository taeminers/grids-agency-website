"use client";

import React from "react";
import { ArrowUpRight, Facebook, Twitter, Linkedin, Check } from "lucide-react";
import Image from "next/image";
import ConnectCanvas from "@/components/connect/connect-canvas";

import Link from "next/link";
import emailjs from "@emailjs/browser"; // Import EmailJS

export default function ConnectPage() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pt-24 md:pt-32 font-sans text-foreground">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* 1. Header Section */}
                <div className="bg-card rounded-[2rem] p-8 md:p-12 shadow-sm flex flex-col lg:flex-row justify-between gap-12 relative overflow-hidden">
                    {/* Glow Effect matching reference but with tertiary color */}
                    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-tertiary/40 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl pt-20 lg:pt-0">
                        <h1 className="text-5xl md:text-7xl font-semibold leading-tight tracking-tight text-foreground">
                            We Would Love to Hear <br />
                            <span className="inline-block text-tertiary px-2 -rotate-1 mx-1 rounded-lg relative">
                                {/* Subtle backing for the highlight text to pop on dark */}
                                <span className="absolute inset-0  rounded-lg -z-10"></span>
                                from You
                            </span>
                        </h1>
                    </div>

                    <div className="relative z-10 max-w-md flex flex-col justify-center space-y-8">
                        <p className="text-neutral-400 text-lg leading-relaxed">
                        We appreciate you reaching out to connect. At Grids, every interaction is a coordinate for future growth. Please share your details below, and let’s start engineering.</p>
                    </div>
                </div>

                {/* 2. Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Address", value: "435 Olympic-ro, Songpa-gu, Seoul, Republic of Korea", href: "https://www.google.com/maps/search/?api=1&query=435+Olympic-ro,+Songpa-gu,+Seoul,+Republic+of+Korea" },
                        { label: "You Can Email Here", value: "hello@gridsagency.com", href: "mailto:hello@gridsagency.com" },    
                        { label: "Telegram", value: "@kyle_lee10", href: "https://t.me/kyle_lee10" },
                        { label: "Working Hours", value: "10:00 am - 6:00 pm(KST)", href: "https://www.google.com/search?q=10am+kst+to+local+time" },
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
                            <a 
                                href="https://www.instagram.com/gridsagency" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-card border border-border rounded-[1.5rem] p-6 flex items-center justify-between shadow-sm cursor-pointer hover:border-tertiary transition-colors group"
                            >
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Partnerships and Collaborations</p>
                                    <p className="text-sm font-semibold text-foreground">@gridsagency</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:bg-tertiary transition-colors">
                                    <ArrowUpRight size={16} />
                                </div>
                            </a>
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

function ContactForm() {
    const form = React.useRef<HTMLFormElement>(null);
    const [status, setStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.current) return;

        // Check terms
        const formData = new FormData(form.current);
        if (!formData.get("terms")) {
           alert("Please agree to the Terms of Use and Privacy Policy.");
           return;
        }

        setStatus('sending');

        // Replace with your EmailJS Service ID, Template ID, and Public Key
        // Sign up at https://www.emailjs.com/
        emailjs.sendForm('service_k62vn7v', 'template_zvarahr', form.current, 'vibNm6YwfgMqbbecO')
          .then((result) => {
              console.log(result.text);
              setStatus('success');
              form.current?.reset();
          }, (error) => {
              console.log(error.text);
              setStatus('error');
          });
    };

    return (
        <form ref={form} onSubmit={sendEmail} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">First Name <span className="text-red-500">*</span></label>
                    <input name="firstName" required type="text" placeholder="Enter First Name" className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary outline-none shadow-sm" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Last Name <span className="text-red-500">*</span></label>
                    <input name="lastName" required type="text" placeholder="Enter Last Name" className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary outline-none shadow-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Email <span className="text-red-500">*</span></label>
                    <input name="email" required type="email" placeholder="Enter your Email" className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary outline-none shadow-sm" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Phone <span className="text-muted-foreground text-xs font-normal">(Optional)</span></label>
                    <input name="phone" type="tel" placeholder="Enter Phone Number" className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary outline-none shadow-sm" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Message <span className="text-red-500">*</span></label>
                <textarea name="message" required placeholder="Enter your Message" rows={4} className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary resize-none outline-none shadow-sm"></textarea>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                        <input type="checkbox" name="terms" required className="peer sr-only" />
                        <div className="w-5 h-5 border border-input rounded flex items-center justify-center bg-card peer-checked:bg-tertiary peer-checked:border-tertiary transition-colors">
                            <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">I agree with Terms of Use and Privacy Policy</span>
                </label>

                <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                    <button 
                        type="submit" 
                        disabled={status === 'sending' || status === 'success'}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium hover:bg-tertiary hover:text-white transition-all duration-300 w-full md:w-auto shadow-lg shadow-tertiary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send your Message'}
                    </button>
                    {status === 'success' && <p className="text-xs text-green-500">We'll get back to you soon!</p>}
                    {status === 'error' && <p className="text-xs text-red-500">Something went wrong. Please try again.</p>}
                </div>
            </div>
        </form>
    );
}