"use client";

import { useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

export function isFooterDesktopActive() {
  const footer = document.querySelector<HTMLElement>("[data-footer-desktop]");
  if (!footer) return false;
  const bounds = footer.getBoundingClientRect();
  // Allow subpixel rounding at the end of the document, not an early reveal.
  return bounds.bottom <= window.innerHeight + 2 && bounds.bottom > 0;
}

function isFooterVisible() {
  const footer = document.querySelector<HTMLElement>("[data-footer-desktop]");
  if (!footer) return false;
  const bounds = footer.getBoundingClientRect();
  return bounds.top < window.innerHeight && bounds.bottom > 0;
}

const serverSnapshot = () => false;

function useFooterState(snapshot: () => boolean) {
  const pathname = usePathname();
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("scroll", onChange, { passive: true, capture: true });
    window.addEventListener("resize", onChange);
    const observer = new ResizeObserver(onChange);
    observer.observe(document.documentElement);
    const frame = requestAnimationFrame(() => {
      if (window.location.pathname === pathname) onChange();
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onChange, true);
      window.removeEventListener("resize", onChange);
    };
  // Recheck after navigation adds or removes the footer.
  }, [pathname]);
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function useFooterDesktopActive() { return useFooterState(isFooterDesktopActive); }
export function useFooterVisible() { return useFooterState(isFooterVisible); }
