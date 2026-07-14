"use client";

import emailjs from "@emailjs/browser";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";

export function ContactForm() {
    const t = useTranslations("Connect.Form");
    const form = useRef<HTMLFormElement>(null);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.current) return;

        // Check terms
        const formData = new FormData(form.current);
        if (!formData.get("terms")) {
           alert(t("termsAlert"));
           return;
        }

        setStatus('sending');

        // Replace with your EmailJS Service ID, Template ID, and Public Key
        // Sign up at https://www.emailjs.com/
        emailjs.sendForm(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            form.current,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        )
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
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">{t("firstName")} <span className="text-red-500">*</span></label>
                    <input name="firstName" required type="text" placeholder={t("firstNamePlaceholder")} className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary outline-none shadow-sm" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">{t("lastName")} <span className="text-red-500">*</span></label>
                    <input name="lastName" required type="text" placeholder={t("lastNamePlaceholder")} className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary outline-none shadow-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">{t("email")} <span className="text-red-500">*</span></label>
                    <input name="email" required type="email" placeholder={t("emailPlaceholder")} className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary outline-none shadow-sm" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">{t("phone")} <span className="text-muted-foreground text-xs font-normal">{t("optional")}</span></label>
                    <input name="phone" type="tel" placeholder={t("phonePlaceholder")} className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary outline-none shadow-sm" />
                </div>
            </div>

                <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">{t("message")} <span className="text-red-500">*</span></label>
                <textarea name="message" required placeholder={t("messagePlaceholder")} rows={4} className="w-full bg-card border-none rounded-xl p-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-tertiary resize-none outline-none shadow-sm"></textarea>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                        <input type="checkbox" name="terms" required className="peer sr-only" />
                        <div className="w-5 h-5 border border-input rounded flex items-center justify-center bg-card peer-checked:bg-tertiary peer-checked:border-tertiary transition-colors">
                            <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t("terms")}</span>
                </label>

                <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                    <button 
                        type="submit" 
                        disabled={status === 'sending' || status === 'success'}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium hover:bg-tertiary hover:text-white transition-all duration-300 w-full md:w-auto shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'sending' ? t("sending") : status === 'success' ? t("success") : t("submit")}
                    </button>
                    {status === 'success' && <p className="text-xs text-green-500">{t("successNote")}</p>}
                    {status === 'error' && <p className="text-xs text-red-500">{t("error")}</p>}
                </div>
            </div>
        </form>
    );
}
