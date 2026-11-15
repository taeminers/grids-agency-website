"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import BrandLogo from "@/components/brand-logo";
import Link from "@/components/navigation/page-navigation";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import styles from "./navbar.module.css";
import { isFooterDesktopActive } from "@/hooks/use-footer-desktop-active";

interface NavbarProps {
  className?: string;
  inHero?: boolean;
}

const subscribeToHydration = () => () => {};
const subscribeToScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true, capture: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange, true);
    window.removeEventListener("resize", onChange);
  };
};
const getScrolled = () => {
  if (isFooterDesktopActive()) return false;
  const pinnedStage = document.querySelector<HTMLElement>("[data-navbar-pinned-stage]");
  if (pinnedStage) {
    const stickyTop = parseFloat(getComputedStyle(pinnedStage).top) || 0;
    return stickyTop - pinnedStage.getBoundingClientRect().top > 80;
  }
  const scroller = document.querySelector<HTMLElement>("[data-navbar-scroll]");
  return Math.max(window.scrollY, scroller?.scrollTop ?? 0) > 80;
};
const getServerScrolled = () => false;

export default function Navbar({ className, inHero = false }: NavbarProps) {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const detailsId = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinnedPath, setPinnedPath] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const subscribeToPageScroll = useCallback((onChange: () => void) => {
    const unsubscribe = subscribeToScroll(onChange);
    // Re-read when a route replaces a page-owned scroll container.
    const frame = requestAnimationFrame(() => {
      if (window.location.pathname === pathname) onChange();
    });
    return () => { cancelAnimationFrame(frame); unsubscribe(); };
  }, [pathname]);
  const scrolled = useSyncExternalStore(subscribeToPageScroll, getScrolled, getServerScrolled);
  const expanded = !scrolled || hovered || focused || pinnedPath === pathname || menuOpen;

  useEffect(() => {
    const onOutsidePress = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (navRef.current?.contains(event.target) || dropdownRef.current?.contains(event.target)) return;
      setPinnedPath(null);
      setHovered(false);
      setFocused(false);
    };
    document.addEventListener("pointerdown", onOutsidePress);
    return () => document.removeEventListener("pointerdown", onOutsidePress);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeMobileMenu = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeMobileMenu);
    return () => desktop.removeEventListener("change", closeMobileMenu);
  }, []);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

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

  const languageLabel = locale === "ko" ? "Switch to English" : "한국어로 전환";
  const links = [
    { id: "work", label: t("work"), link: `/${locale}/archive` },
    { id: "pricing", label: t("pricing"), link: `/${locale}/pricing` },
    { id: "blog", label: t("blog"), link: `/${locale}/blog` },
    { id: "contact", label: t("contact"), link: `/${locale}/connect` },
  ];
  const activeIndex = links.findIndex(({ link }) =>
    pathname === link || pathname.startsWith(`${link}/`),
  );

  return (
    <nav
      ref={navRef}
      data-site-navigation
      data-scrolled={scrolled}
      data-expanded={expanded}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--glass-light-x", `${event.clientX - bounds.left}px`);
      }}
      onPointerOver={(event) => {
        if (event.pointerType === "mouse" && event.target instanceof Element &&
            !event.target.closest("[data-navbar-cta]")) setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        // Pointer focus must not move the button before its click is delivered.
        if (event.target.matches(":focus-visible") && !event.target.closest("[data-navbar-cta]")) setFocused(true);
      }}
      onClick={(event) => {
        if (scrolled && event.target instanceof Element && !event.target.closest("a, button")) {
          setPinnedPath(pathname);
        }
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !scrolled || menuOpen || window.matchMedia("(max-width: 767px)").matches) return;
        event.preventDefault();
        brandRef.current?.focus({ preventScroll: true });
        setPinnedPath(null);
        setHovered(false);
        setFocused(false);
      }}
      aria-label={locale === "ko" ? "주 메뉴" : "Main navigation"}
      className={cn(styles.navbar, className)}
    >
      <span aria-hidden="true" className={styles.glassSurface} />
      <div className={styles.content}>
        <Link
          href={`/${locale}`}
          aria-label={locale === "ko" ? "그리즈 홈" : "Grids home"}
          className={cn(styles.item, styles.mobileLogo)}
        >
          <BrandLogo className="size-[19px] bg-current" />
        </Link>
      <div className={styles.brand}>
        {scrolled ? (
          <Link
            ref={brandRef}
            href={`/${locale}`}
            className={cn(styles.item, styles.brandLink)}
            aria-label={locale === "ko" ? "그리즈 홈" : "Grids home"}
          >
            <BrandLogo className="size-[19px] bg-current" />
            <span>GRIDS AGENCY</span>
          </Link>
        ) : (<>
        <Link
          data-hero-reveal="text"
          href={`/${locale}`}
          aria-label={locale === "ko" ? "그리즈 홈" : "Grids home"}
          className={cn(styles.item, styles.logo)}
        >
          <BrandLogo className="size-[19px] bg-current" />
        </Link>
        <Link
          data-hero-reveal="text"
          href={`/${locale}`}
          className={cn(styles.item, styles.appName)}
        >
          GRIDS AGENCY
        </Link>
        </>)}
      </div>
      <div id={detailsId} className={styles.details} inert={!expanded} aria-hidden={!expanded}>
        <div data-hero-reveal="text" className={styles.links}>
          {links.map((item, index) => (
            <Link
              key={item.id}
              href={item.link}
              aria-current={activeIndex === index ? "page" : undefined}
              className={styles.item}
            >
              {item.label}
            </Link>
          ))}
        </div>
      <div data-hero-reveal="text" className={styles.controls}>
        <button
          type="button"
          disabled={!mounted}
          aria-label={languageLabel}
          title={languageLabel}
          onClick={switchLocale}
          className={cn(styles.item, styles.control, styles.language)}
        >
          <span aria-hidden="true" className={styles.locale}>{locale.toUpperCase()}</span>
        </button>

      </div>
      </div>
        <Link
          href={`/${locale}/connect`}
          className={cn(styles.item, styles.cta)}
          data-navbar-cta="true"
          aria-label={t("consultation")}
          title={t("consultation")}
          onClick={() => trackEvent("cta_click", {
            cta_location: "navbar",
            cta_text: t("consultation"),
          })}
        >
          <span aria-hidden="true">{t("consultation")}</span>
          <ChevronRight strokeWidth={3.5} size={18} aria-hidden="true" className={styles.ctaArrow} />
        </Link>
        <div data-hero-reveal="text" className={styles.mobileMenu}>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button type="button" className={cn(styles.item, styles.control)}
                aria-label={locale === "ko" ? "메뉴 열기" : "Open menu"}>
                <Menu size={17} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent ref={dropdownRef} data-scrolled={scrolled} align="end" sideOffset={5} collisionPadding={12}
              className={cn(styles.dropdown, "w-64 max-w-[calc(100vw-24px)] rounded-xl p-2 motion-reduce:animate-none")}>
              <DropdownMenuLabel className="px-3 py-2 text-xs tracking-tight">GRIDS AGENCY</DropdownMenuLabel>
              {links.map((item, index) => (
                <DropdownMenuItem key={item.id} asChild className="min-h-11 rounded px-3">
                  <Link href={item.link} aria-current={activeIndex === index ? "page" : undefined}>
                    {item.label}
                    {activeIndex === index && <span aria-hidden="true" className="ml-auto size-1 rounded-full bg-current" />}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className={styles.menuSeparator} />
              <DropdownMenuItem
                disabled={!mounted}
                onSelect={switchLocale}
                aria-label={languageLabel}
                className="min-h-11 rounded px-3"
              >
                {locale.toUpperCase()}
              </DropdownMenuItem>
              <DropdownMenuSeparator className={styles.menuSeparator} />
              <DropdownMenuItem asChild className={styles.menuCta}>
                <Link href={`/${locale}/connect`} onClick={() => trackEvent("cta_click", {
                  cta_location: "navbar",
                  cta_text: t("consultation"),
                })}>
                  {t("consultation")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
