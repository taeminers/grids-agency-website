"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import BrandLogo from "@/components/brand-logo";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Sun, Moon, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
  inHero?: boolean;
}

const MotionLink = motion.create(Link);

const subscribeToHydration = () => () => {};
const subscribeToScroll = (onChange: () => void) => {
  // Capture also receives scroll events from page-owned containers (Archive).
  window.addEventListener("scroll", onChange, { passive: true, capture: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange, true);
    window.removeEventListener("resize", onChange);
  };
};
const getScrolled = () => {
  const pinnedStage = document.querySelector<HTMLElement>(
    "[data-navbar-pinned-stage]",
  );
  if (pinnedStage) {
    // Scroll used to animate a pinned scene is not visible page movement.
    // Compact only after the scene itself starts leaving its sticky position.
    const stickyTop = parseFloat(getComputedStyle(pinnedStage).top) || 0;
    return stickyTop - pinnedStage.getBoundingClientRect().top > 80;
  }
  const pageScroller = document.querySelector<HTMLElement>(
    "[data-navbar-scroll]",
  );
  return Math.max(window.scrollY, pageScroller?.scrollTop ?? 0) > 80;
};
const getServerScrolled = () => false;

export default function Navbar({ className, inHero = false }: NavbarProps) {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const subscribeToPageScroll = useCallback((onChange: () => void) => {
    const unsubscribe = subscribeToScroll(onChange);
    // Re-read after the destination page and its scroll position are committed.
    const frame = requestAnimationFrame(() => {
      if (window.location.pathname === pathname) onChange();
    });
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [pathname]);

  const reducedMotion = useReducedMotion();
  const pillTransition = {
    duration: reducedMotion ? 0 : 0.42,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const scrolled = useSyncExternalStore(
    subscribeToPageScroll,
    getScrolled,
    getServerScrolled,
  );

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const switchLocale = () => {
    const nextLocale = locale === "en" ? "ko" : "en";
    const newPath = pathname.replace(/^\/(en|ko)(?=\/|$)/, `/${nextLocale}`);
    router.push(`${newPath}${window.location.search}${window.location.hash}`, {
      scroll: false,
    });
  };

  // The homepage navbar belongs to the hero's animated surface. Render its
  // markup immediately so the intro timeline can find all reveal targets.
  if (isHome && !inHero) return null;

  const themeLabel =
    locale === "ko"
      ? resolvedTheme === "dark"
        ? "라이트 모드로 전환"
        : "다크 모드로 전환"
      : resolvedTheme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode";
  const languageLabel = locale === "ko" ? "Switch to English" : "한국어로 전환";
  const iconButtonClass =
    "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-sm text-inherit transition-colors hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary disabled:cursor-default disabled:opacity-50";
  const controls = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={!mounted}
        aria-label={mounted ? themeLabel : t("Settings.darkMode")}
        title={mounted ? themeLabel : t("Settings.darkMode")}
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className={iconButtonClass}
      >
        <Moon size={18} aria-hidden="true" className="dark:hidden" />
        <Sun size={18} aria-hidden="true" className="hidden dark:block" />
      </button>
      <button
        type="button"
        disabled={!mounted}
        aria-label={languageLabel}
        title={languageLabel}
        onClick={switchLocale}
        className={iconButtonClass}
      >
        <Languages size={18} aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <motion.div key={pathname} layoutRoot className="pointer-events-none fixed inset-0 z-40">
      <motion.nav
        layout
        layoutDependency={scrolled}
        transition={{ layout: pillTransition }}
        aria-label={locale === "ko" ? "주 메뉴" : "Main navigation"}
        className={cn(
          "pointer-events-auto absolute inset-x-0 mx-auto rounded-none text-foreground",
          scrolled
            ? "top-3 h-[104px] w-[calc(100%-24px)] px-5 md:top-4 md:h-16 md:w-[min(760px,calc(100%-48px))] md:px-7"
            : "top-0 h-[112px] w-[calc(100%-clamp(20px,4.2vw,72px)*2)] px-5 md:h-[72px] md:px-9",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] border border-white/60 bg-white/25 shadow-[0_8px_32px_-12px_rgb(0_0_0/0.22),inset_0_1px_0_rgb(255_255_255/0.8),inset_0_-1px_0_rgb(255_255_255/0.25)] backdrop-blur-[16px] backdrop-saturate-[1.8] transition-opacity duration-300 motion-reduce:transition-none dark:border-white/20 dark:bg-black/25 dark:shadow-[0_8px_32px_-12px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.3),inset_0_-1px_0_rgb(255_255_255/0.08)]",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.06)_35%,transparent_55%,rgba(255,255,255,0.16)_100%)] dark:opacity-50" />
          <span className="absolute inset-x-[12%] top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent dark:via-white/60" />
        </span>
        {(isHome || pathname.replace(/\/$/, "") === `/${locale}/connect`) && (
          <span
            data-hero-reveal="grid"
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-0 -inset-x-[clamp(20px,4.2vw,72px)] border-b border-foreground/15 transition-opacity duration-300 motion-reduce:transition-none group-data-[hero-pending=true]/hero:opacity-0",
              scrolled && "opacity-0",
            )}
          />
        )}
        <div className="relative flex h-full flex-wrap items-center justify-between gap-x-3 py-3 md:flex-nowrap md:py-0">
          <MotionLink
            layout="position"
            layoutDependency={scrolled}
            transition={{ layout: pillTransition }}
            data-hero-reveal="text"
            href={`/${locale}`}
            aria-label={locale === "ko" ? "그리즈 에이전시" : "Grids Agency"}
            className="flex items-center gap-2.5 group-data-[hero-pending=true]/hero:opacity-0 group-data-[hero-pending=true]/hero:blur-[10px]"
          >
            <BrandLogo className="size-[22px]" />
            <span
              className="relative inline-grid h-6 overflow-hidden text-[17px] font-bold tracking-[-0.025em] leading-6 max-[360px]:text-sm"
              data-locale={locale}
              aria-hidden="true"
            >
              <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
                GRIDS AGENCY
              </span>
              <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
                그리즈 에이전시
              </span>
              <span
                className={cn(
                  "absolute top-0 left-0 animate-brand-roll motion-reduce:animate-none",
                  locale === "ko" && "motion-reduce:-translate-y-1/3",
                )}
              >
                <span lang="en" className="block h-6 whitespace-nowrap">
                  GRIDS<span className="opacity-50"> AGENCY</span>
                </span>
                <span lang="ko" className="block h-6 whitespace-nowrap">
                  그리즈
                  <span className="opacity-50"> 에이전시</span>
                </span>
                <span lang="en" className="block h-6 whitespace-nowrap">
                  GRIDS<span className="opacity-50"> AGENCY</span>
                </span>
              </span>
            </span>
          </MotionLink>
          <motion.div
            layout="position"
            layoutDependency={scrolled}
            transition={{ layout: pillTransition }}
            data-hero-reveal="text"
            className="order-3 flex w-full items-center justify-between gap-3 text-xs group-data-[hero-pending=true]/hero:opacity-0 group-data-[hero-pending=true]/hero:blur-[10px] md:order-none md:ml-auto md:w-auto md:gap-7 md:text-[13px]"
          >
            <Link
              href={`/${locale}/archive`}
              className="transition-colors hover:text-tertiary"
            >
              {t("work")}
            </Link>
            <Link
              href={`/${locale}/vision`}
              className="transition-colors hover:text-tertiary"
            >
              {t("about")}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="transition-colors hover:text-tertiary"
            >
              {t("pricing")}
            </Link>
            <Link
              href={`/${locale}/connect`}
              className="transition-colors hover:text-tertiary"
            >
              {t("contact")}
            </Link>
          </motion.div>
          <motion.div
            layout="position"
            layoutDependency={scrolled}
            transition={{ layout: pillTransition }}
            data-hero-reveal="text"
            className="ml-auto group-data-[hero-pending=true]/hero:opacity-0 group-data-[hero-pending=true]/hero:blur-[10px] md:ml-0"
          >
            {controls}
          </motion.div>
        </div>
      </motion.nav>
    </motion.div>
  );
}
