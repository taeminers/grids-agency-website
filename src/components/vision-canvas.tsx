"use client";

import React from "react";
import { WebGLShader } from "@/components/ui/web-gl-shader";

export default function VisionCanvas() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden h-[60vh] md:h-[70vh] bg-black invert dark:invert-0 transition-colors duration-500">
      <WebGLShader />
    </div>
  );
}
