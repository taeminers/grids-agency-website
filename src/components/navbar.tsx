"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Settings, Sun, Moon, Languages, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = () => {
    const nextLocale = locale === 'en' ? 'ko' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  if (!mounted) return null;

  return (
    <nav 
        className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-40 flex justify-center", className)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onClick={() => setIsExpanded(!isExpanded)} 
    >
        <AnimatePresence mode="popLayout">
            {!isExpanded ? (
                // Collapsed State: "Menu" Pill
                <motion.div
                    key="menu-pill"
                    layout
                    layoutId="navbar-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    <SpotlightBorder className="p-0">
                        <div className={cn(blockClass, "border-0 px-6 font-medium text-sm cursor-pointer whitespace-nowrap")}>
                            <motion.span 
                                layout 
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                            >
                                Menu
                            </motion.span>
                        </div>
                    </SpotlightBorder>
                </motion.div>
            ) : (
                // Expanded State: Full Navbar Content
                <motion.div
                    key="full-nav"
                    layout
                    layoutId="navbar-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex flex-wrap justify-center gap-1 w-max md:w-auto md:flex-nowrap md:items-center"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()} 
                >
                      {/* Brand Block */}
                      <SpotlightBorder className="p-0 order-2 md:order-none">
                        <motion.div 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.1 }}
                           className={cn(blockClass, "border-0 px-4 font-medium text-sm cursor-pointer whitespace-nowrap")}
                        >
                            <Link href={`/${locale}`} className="flex items-center gap-2">
                                <div className="relative w-4 h-4">
                                  <img 
                                    src={resolvedTheme === 'dark' ? '/logo/grids-white.png' : '/logo/grids-black.png'} 
                                    alt="Grids Logo" 
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                            </Link>
                        </motion.div>
                      </SpotlightBorder>

                      {/* Links Block */}
                      <div className="order-1 w-full flex justify-center md:contents">
                        <SpotlightBorder className="p-0 md:block">
                            <motion.div 
                               initial={{ opacity: 0, scale: 0.95 }}
                               animate={{ opacity: 1, scale: 1 }}
                               transition={{ delay: 0.05 }}
                               className={cn(blockClass, "border-0 px-2 gap-1")}
                            >
                                <Link href={`/${locale}/archive`} className="px-4 py-1.5  rounded- text-sm font-medium transition-colors">
                                {t('work')}
                                </Link>
                                <Link href={`/${locale}/vision`} className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
                                {t('about')}
                                </Link>
                                <Link href={`/${locale}/connect`} className="px-4 py-1.5  rounded-sm text-sm font-medium transition-colors">
                                {t('contact')}
                                </Link>
                            </motion.div>
                        </SpotlightBorder>
                      </div>

                      {/* Settings Dropdown Block */}
                      <SpotlightBorder className="p-0 order-3 md:order-none">
                        <DropdownMenu onOpenChange={() => {}} modal={false}>
                            <DropdownMenuTrigger asChild>
                                <motion.div 
                                   initial={{ opacity: 0, x: 10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: 0.1 }}
                                   className={cn(blockClass, "border-0 w-11 justify-center cursor-pointer relative overflow-hidden group")}
                                >
                                    <div className="relative w-5 h-5 flex items-center justify-center">
                                        <Settings size={20} className="text-primary/80 transition-transform duration-500 group-hover:rotate-180" />
                                    </div>
                                </motion.div>
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
                </motion.div>
            )}
        </AnimatePresence>
    </nav>
  );
}
