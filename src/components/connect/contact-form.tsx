"use client";

import React, { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { Check } from "lucide-react";

export function ContactForm() {
    const form = useRef<HTMLFormElement>(null);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

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
