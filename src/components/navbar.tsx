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
  const blockClass = "h-11 flex items-center bg-black/10 dark:bg-white/5 backdrop-blur-md backdrop-saturate-200 border border-black dark:border-white/10 shadow-lg rounded-sm text-primary transition-all duration-300";

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
    <nav className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-40 flex flex-wrap justify-center gap-1 w-max md:w-auto md:flex-nowrap md:items-center", className)}>
      
      {/* Brand Block - Mobile: Order 2 (Bottom Left) */}
      <SpotlightBorder className="p-0 order-2 md:order-none">
        <div className={cn(blockClass, "border-0 px-5 font-medium text-sm cursor-pointer whitespace-nowrap")}>
            <Link href={`/${locale}`} className="flex items-center gap-2 animate-in fade-in fill-mode-forwards duration-1000 delay-500">
                <div className="relative w-4 h-4">
                  {/* Using standard img tag or Next Image? Next Image is better but needs import.
                      Since I can't easily add import at top and edit body in one go with replace_file_content unless I do a big chunk,
                      I will do multi_replace if I need to add import. 
                      Actually, let's use a simple img if we don't want to mess with imports, BUT `next/image` is best practice.
                      I'll try to match the import section in a separate chunk.
                  */}
                  <img 
                    src={resolvedTheme === 'dark' ? '/logo/grids-white.png' : '/logo/grids-black.png'} 
                    alt="Grids Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span>GRIDS AGENCY</span>
            </Link>
        </div>
      </SpotlightBorder>

      {/* Links Block - Mobile: Order 1 (Top Center), Wrapped to force new line visually without expanding border */}
      <div className="order-1 w-full flex justify-center md:contents">
        <SpotlightBorder className="p-0 md:block">
            <div className={cn(blockClass, "border-0 px-2 gap-1")}>
                <Link href="#" className="px-4 py-1.5  rounded- text-sm font-medium transition-colors">
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
      </div>

      {/* Settings Dropdown Block - Mobile: Order 3 (Bottom Right) */}
      <SpotlightBorder className="p-0 order-3 md:order-none">
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
                        <span className="font-medium text-sm w-20">{resolvedTheme === "dark" ? t('Settings.darkMode') : t('Settings.lightMode')}</span>
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
                        <span className="font-medium text-sm w-20">{locale === 'ko' ? t('Settings.korean') : t('Settings.english')}</span>
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
