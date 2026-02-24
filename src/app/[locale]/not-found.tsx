"use client";

import React from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/cosmic-404";
import Link from "next/link";

// 🎞️ Animation Variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.9, ease: "easeOut" as const } 
  },
};

const globeVariants: Variants = {
  hidden: { scale: 0.85, opacity: 0, y: 10 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" as const },
  },
  floating: {
    y: [-4, 4],
    transition: {
      duration: 5,
      ease: "easeInOut" as const,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

export default function NotFound() {
  const t = useTranslations("NotFound");
  const locale = useLocale();

  return (
    <div className="flex flex-col justify-center items-center px-4 min-h-screen bg-background relative z-10">
      <AnimatePresence mode="wait">
        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeUp}
        >
          {/* Main 404 Display */}
          <div className="flex items-center justify-center gap-6 mb-10">
            <motion.span
              className="text-7xl md:text-9xl font-extrabold text-foreground/80 select-none tracking-tighter"
              variants={fadeUp}
            >
              4
            </motion.span>

            <motion.div
              className="relative w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44"
              variants={globeVariants}
              animate={["visible", "floating"]}
            >
              <Globe className="max-w-none" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_0%,transparent_70%)]" />
            </motion.div>

            <motion.span
              className="text-7xl md:text-9xl font-extrabold text-foreground/80 select-none tracking-tighter"
              variants={fadeUp}
            >
              4
            </motion.span>
          </div>

          {/* Text Content */}
          <motion.h1
            className="mb-4 text-3xl md:text-5xl font-bold tracking-tight text-foreground"
            variants={fadeUp}
          >
            {t("subtitle")}
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-md text-base md:text-lg text-muted-foreground/70 font-medium"
            variants={fadeUp}
          >
            {t("description")}
          </motion.p>

          <motion.div variants={fadeUp}>
            <Link href={`/${locale}`}>
              <Button size="lg" className="gap-2 hover:scale-105 transition-all duration-500 cursor-pointer rounded-full px-8">
                <ArrowLeftIcon className="w-5 h-5" />
                {t("cta")}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Atmospheric BG effect */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
