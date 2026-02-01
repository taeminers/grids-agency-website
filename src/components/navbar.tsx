"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  return (
    <nav className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2", className)}>
      
      {/* Brand Block */}
      <div className="bg-[#1c1c1c] text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-lg backdrop-blur-sm">
        <Link href="/">
            GRIDS AGENCY
        </Link>
      </div>

      {/* Links Block - Hidden on mobile, visible on desktop */}
      <div className="hidden md:flex bg-[#1c1c1c] text-white px-2 py-1.5 rounded-lg items-center gap-1 shadow-lg backdrop-blur-sm">
        <Link href="#" className="px-4 py-1.5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors">
          Work
        </Link>
        <Link href="#" className="px-4 py-1.5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors">
          About
        </Link>
        <Link href="#" className="px-4 py-1.5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors">
          Services
        </Link>
        <Link href="#" className="px-4 py-1.5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors">
          Contact
        </Link>
      </div>

      {/* Menu Block */}
      <div className="bg-[#1c1c1c] text-white px-3 py-2.5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shadow-lg backdrop-blur-sm">
        <MoreHorizontal size={20} />
      </div>

    </nav>
  );
}
