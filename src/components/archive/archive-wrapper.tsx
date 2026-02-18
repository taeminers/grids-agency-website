"use client";

import { useState } from "react";
import { ArchiveEntry } from "./archive-entry";
import { ArchiveGrid } from "./archive-grid";
import { AnimatePresence, motion } from "motion/react";

export function ArchiveWrapper() {
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="w-full h-screen bg-background relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!showGrid ? (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <ArchiveEntry onEnter={() => setShowGrid(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
             className="w-full h-full"
          >
            <ArchiveGrid />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
