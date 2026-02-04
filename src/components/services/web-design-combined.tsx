"use client";

import { CodeExample } from "./code-example/code-example";
import WebDesignAnimation from "./web-design-animation";

export default function WebDesignCombined() {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col md:flex-row bg-muted/20">
      {/* Visual Animation (Left/Top) */}
      <div className="w-full md:w-1/2 h-full relative md:border-r border-border/50">
        <WebDesignAnimation />
      </div>

      {/* Code Example (Right/Bottom) */}
      <div className="hidden md:block w-full md:w-1/2 h-full relative overflow-hidden bg-background">
        <div className="absolute inset-0 scale-[0.7] origin-top-left w-[142%] h-[142%]">
            <CodeExample />
        </div>
      </div>
    </div>
  );
}
