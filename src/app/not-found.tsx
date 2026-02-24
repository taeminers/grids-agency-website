"use client";

import React from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/cosmic-404";
import Link from "next/link";
import "./globals.css";

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

export default function RootNotFound() {
  return (
    <div className="flex flex-col justify-center items-center px-4 min-h-screen bg-[#09090b] relative z-10 selection:bg-primary/30 antialiased">
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
              className="text-7xl md:text-9xl font-extrabold text-white/80 select-none tracking-tighter"
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
              className="text-7xl md:text-9xl font-extrabold text-white/80 select-none tracking-tighter"
              variants={fadeUp}
            >
              4
            </motion.span>
          </div>

          {/* Text Content */}
          <motion.h1
            className="mb-4 text-3xl md:text-5xl font-bold tracking-tight text-white font-sans"
            variants={fadeUp}
          >
            COORDINATE NOT FOUND
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-md text-base md:text-lg text-zinc-400 font-medium"
            variants={fadeUp}
          >
            The page you are looking for has been lost in the digital void. Let's get you back to the system.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Link href="/en">
              <Button size="lg" className="gap-2 hover:scale-105 transition-all duration-500 cursor-pointer rounded-full px-8 bg-white text-black hover:bg-zinc-200">
                <ArrowLeftIcon className="w-5 h-5" />
                Go Back to Base
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Atmospheric BG effect */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
