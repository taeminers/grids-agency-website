"use client";

import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const HeroContent = () => {
  const t = useTranslations("Hero");
  const navT = useTranslations("Navbar");
  const locale = useLocale();

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 md:px-8 text-center relative z-10 select-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            {t("headline_prefix")}
          </h1>
          
        </div>

        <div className="flex flex-row items-center justify-center gap-3 pt-4">
          <Link href={`/${locale}/archive`}>
            <LiquidButton size="lg" className="min-w-[120px]">
              {navT("work")}
            </LiquidButton>
          </Link>
          <Link href={`/${locale}/connect`}>
            <LiquidButton variant="ghost" size="lg" className="min-w-[120px] bg-foreground/5 dark:bg-foreground/10 hover:bg-foreground/15">
              {navT("contact")}
            </LiquidButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroContent;
