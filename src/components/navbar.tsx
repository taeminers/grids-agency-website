"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SpotlightBorder } from "@/components/ui/spotlight-border";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  // Apple Liquid Glass Style:
  // bg-black/5 (darker tint for visibility on light bg), saturated blur
  // Border: visible black/10 for definition on light mode
  // Removed static hover:border-violet-500/20 in favor of SpotlightBorder
  const blockClass = "h-11 flex items-center bg-black/5 dark:bg-white/5 backdrop-blur-md backdrop-saturate-200 border border-black/10 dark:border-white/10 shadow-lg rounded-md text-primary transition-all duration-300";

  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2", className)}>
      
      {/* Brand Block */}
      <SpotlightBorder className="p-0">
        <div className={cn(blockClass, "border-0 px-5 font-medium text-sm cursor-pointer")}>
            <Link href="/">
                GRIDS AGENCY
            </Link>
        </div>
      </SpotlightBorder>

      {/* Links Block - Hidden on mobile, visible on desktop */}
      <SpotlightBorder className="hidden md:block p-0">
        <div className={cn(blockClass, "border-0 px-2 gap-1")}>
            <Link href="#" className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
            Work
            </Link>
            <Link href="#" className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
            About
            </Link>
            <Link href="#" className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
            Services
            </Link>
            <Link href="#" className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
            Contact
            </Link>
        </div>
      </SpotlightBorder>

      {/* Theme Toggle Block */}
      <SpotlightBorder className="p-0">
        <div 
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={cn(blockClass, "border-0 w-11 justify-center cursor-pointer relative overflow-hidden")}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                {/* Sun Icon (Light Mode) */}
                <Sun 
                    className="absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" 
                    size={20} 
                />
                {/* Moon Icon (Dark Mode) */}
                <Moon 
                    className="absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" 
                    size={20} 
                />
            </div>
        </div>
      </SpotlightBorder>

    </nav>
  );
}
