"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Settings, Sun, Moon, Languages, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SpotlightBorder } from "@/components/ui/spotlight-border";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Apple Liquid Glass Style:
  // bg-black/5 (darker tint for visibility on light bg), saturated blur
  // Border: visible black/10 for definition on light mode
  // Removed static hover:border-violet-500/20 in favor of SpotlightBorder
  const blockClass = "h-11 flex items-center bg-black/5 dark:bg-white/5 backdrop-blur-md backdrop-saturate-200 border border-black/10 dark:border-white/10 shadow-lg rounded-md text-primary transition-all duration-300";

  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = () => {
    const nextLocale = locale === 'en' ? 'ko' : 'en';
    // Simplified locale switch: replace current locale in path
    // Note: pathname includes locale, e.g. /en/about
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  if (!mounted) return null;

  return (
    <nav className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2", className)}>
      
      {/* Brand Block */}
      <SpotlightBorder className="p-0">
        <div className={cn(blockClass, "border-0 px-5 font-medium text-sm cursor-pointer whitespace-nowrap")}>
            <Link href={`/${locale}`} className=" animate-in fade-in fill-mode-forwards duration-1000 delay-500">
                GRIDS AGENCY
            </Link>
        </div>
      </SpotlightBorder>

      {/* Links Block - Hidden on mobile, visible on desktop */}
      <SpotlightBorder className="hidden md:block p-0">
        <div className={cn(blockClass, "border-0 px-2 gap-1")}>
            <Link href="#" className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
            {t('work')}
            </Link>
            <Link href="#" className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
            {t('about')}
            </Link>
            <Link href="#" className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
            {t('services')}
            </Link>
            <Link href="#" className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
            {t('contact')}
            </Link>
        </div>
      </SpotlightBorder>

      {/* Settings Dropdown Block (Theme + Language) */}
      <SpotlightBorder className="p-0">
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <div className={cn(blockClass, "border-0 w-11 justify-center cursor-pointer relative overflow-hidden group")}>
                    <div className="relative w-5 h-5 flex items-center justify-center">
                        <Menu 
                            size={20} 
                            className={cn(
                                "absolute text-primary/80 transition-all duration-300",
                                isOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"
                            )} 
                        />
                        <X 
                            size={20} 
                            className={cn(
                                "absolute text-primary/80 transition-all duration-300",
                                isOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"
                            )} 
                        />
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/80 backdrop-blur-md border-border/50 p-2">
                {/* Theme Toggle Item */}
                <div className="flex items-center justify-between p-2 rounded-sm hover:bg-accent hover:text-accent-foreground select-none">
                    <div className="flex items-center gap-2">
                        {resolvedTheme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                        <span className="font-medium text-sm w-20">{resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                    </div>
                    <Switch 
                        checked={resolvedTheme === "dark"}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                </div>
                
                {/* Language Toggle Item */}
                <div className="flex items-center justify-between p-2 rounded-sm hover:bg-accent hover:text-accent-foreground select-none">
                     <div className="flex items-center gap-2">
                        <Languages size={16} />
                        <span className="font-medium text-sm w-20">{locale === 'ko' ? 'Korean' : 'English'}</span>
                     </div>
                     <Switch 
                        checked={locale === 'ko'}
                        onCheckedChange={() => switchLocale()}
                     />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
      </SpotlightBorder>

    </nav>
  );
}
