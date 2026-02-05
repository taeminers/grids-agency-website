"use client";

import { usePathname } from "next/navigation";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface FooterSectionProps {
  className?: string;
}

export default function FooterSection({ className }: FooterSectionProps) {
  const t = useTranslations('Footer');
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.includes('/connect') || pathname?.includes('/archive')) return null;

  return (
    <footer 
      className={cn(
        "relative w-full min-h-screen bg-muted flex flex-col justify-between p-8 md:p-12 lg:p-20 z-10 overflow-hidden", 
        className
      )}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid" />
      
      {/* Right Side Colored Gradient Overlay */}
      <div className="absolute inset-y-0 right-0 w-1/2 md:w-1/3 z-0 pointer-events-none bg-gradient-to-l from-tertiary/15 to-transparent opacity-80" />
      
      {/* Top Section: Logo (Left Only) */}
      <div className="relative z-10 w-full flex justify-start items-center gap-4">
        <div className="relative w-8 h-8 md:w-10 md:h-10">
           {mounted && (
             <Image
               src={theme === 'dark' ? "/logo/grids-white.png" : "/logo/grids-black.png"}
               alt="GRIDS AGENCY"
               fill
               className="object-contain object-left"
               priority
             />
           )}
        </div>
        <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          GRIDS AGENCY
        </span>
      </div>

      {/* Middle Section: Quote & CTA */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-start my-12 md:my-0 gap-8">
        <div className="w-full max-w-5xl">
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-medium leading-[1.1] tracking-tight text-foreground/90">
            &quot;{t('quote')}&quot;
          </h2>
        </div>

        {/* CTA Button moved here */}
        <Link 
          href="mailto:hello@grids.agency"
          className="group flex items-center gap-3 px-6 py-3 rounded-full bg-tertiary text-foreground font-bold hover:scale-105 transition-transform duration-300 w-max"
        >
          <span>{t('cta')}</span>
          <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
        </Link>
      </div>

      {/* Bottom Section: Info Grid */}
      <div className="relative z-10 w-full flex flex-col-reverse md:flex-row justify-between items-end gap-12 md:gap-0">
        
        {/* Left: Copyright */}
        <div className="w-full md:w-auto">
          <p className="text-xs md:text-sm text-muted-foreground/60 font-mono uppercase tracking-wider">
            {t('copyright')}
          </p>
        </div>

        {/* Right: Info Columns */}
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-12 md:gap-24">
            {/* Location */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {t('locationLabel')}
              </span>
              <p className="text-sm md:text-base font-medium leading-relaxed max-w-[200px]">
                {t('location')}
              </p>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {t('contactLabel')}
              </span>
              <div className="flex flex-col gap-2">
                <a href={`mailto:${t('email')}`} className="text-sm md:text-base font-medium hover:text-tertiary transition-colors w-max underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-tertiary">
                  {t('email')}
                </a>
                <p className="text-sm md:text-base text-muted-foreground font-mono">
                  {t('phone')}
                </p>
              </div>
            </div>
        </div>

      </div>
    </footer>
  );
}
