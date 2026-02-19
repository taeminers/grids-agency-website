"use client";

import { useState } from "react";
import { ArchiveEntry } from "./archive-entry";
import { ArchiveGrid } from "./archive-grid";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

import { useRef } from "react";
import { FeaturedWork } from "./featured-work";

export function ArchiveWrapper() {
  const [showGrid, setShowGrid] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className={cn(
        "w-full bg-background relative",
        !showGrid ? "h-screen overflow-y-auto" : "h-screen overflow-hidden"
      )}
      ref={scrollContainerRef}
    >
      <AnimatePresence mode="wait">
        {!showGrid ? (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full min-h-screen"
          >
            <ArchiveEntry onEnter={() => setShowGrid(true)} />
            <FeaturedWork />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
             className="w-full h-full fixed top-0 left-0"
          >
            <ArchiveGrid onBack={() => setShowGrid(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
