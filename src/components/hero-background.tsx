"use client";

import React from "react";
import { ShaderAnimation } from "@/components/ui/shader-lines";

const HeroBackground = () => {
  return (
    <div className="fixed inset-0 z-0 bg-background overflow-hidden invert dark:invert-0">
      <ShaderAnimation />
    </div>
  );
};

export default HeroBackground;
