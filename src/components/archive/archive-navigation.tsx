"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";
import styles from "./archive-navigation.module.css";

type Navigate = (href: string, mediaSlug?: string) => void;
const NavigationContext = createContext<Navigate | null>(null);

export function ArchiveNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<(() => void) | null>(null);
  const transition = useRef<ViewTransition | null>(null);

  useLayoutEffect(() => { pending.current?.(); }, [pathname]);
  useEffect(() => () => {
    pending.current?.();
    transition.current?.skipTransition();
  }, []);

  const navigate = useCallback((href: string, mediaSlug?: string) => {
    transition.current?.skipTransition();
    pending.current?.();
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }
    const source = mediaSlug ? document.querySelector<HTMLElement>(`[data-archive-media="${CSS.escape(mediaSlug)}"]`) : null;
    const sourceVideo = source?.querySelector("video");
    const playbackTime = sourceVideo?.currentTime ?? 0;
    const videoSrc = sourceVideo?.currentSrc;
    if (source) source.style.viewTransitionName = "archive-project-media";

    const active = document.startViewTransition(() => new Promise<void>(resolve => {
      // Resolve on the route commit, with a fallback for failed/cancelled navigation.
      const timer = window.setTimeout(() => {
        active.skipTransition();
        finish();
      }, 2000);
      const finish = () => {
        window.clearTimeout(timer);
        if (pending.current === onRouteCommit) pending.current = null;
        resolve();
      };
      const onRouteCommit = () => {
        pending.current = null;
        // Carry the playing frame into the newly mounted video before taking
        // its snapshot, so expansion does not jump back to the opening frame.
        const destination = document.querySelector<HTMLVideoElement>("[data-archive-detail-media] video");
        if (!destination || !videoSrc || !playbackTime) { finish(); return; }
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(seekTimeout);
          destination.removeEventListener("loadedmetadata", seek);
          destination.removeEventListener("seeked", settle);
          destination.removeEventListener("error", settle);
          finish();
        };
        const seek = () => {
          try { destination.currentTime = playbackTime; }
          catch { settle(); }
        };
        const seekTimeout = window.setTimeout(settle, 700);
        destination.addEventListener("seeked", settle, { once: true });
        destination.addEventListener("error", settle, { once: true });
        if (destination.readyState >= 1) seek();
        else destination.addEventListener("loadedmetadata", seek, { once: true });
      };
      pending.current = onRouteCommit;
      router.push(href);
    }));
    transition.current = active;
    void active.ready.catch(() => { /* Native navigation still completes if snapshots are unavailable. */ });
    void active.finished.finally(() => {
      if (source) source.style.viewTransitionName = "";
      if (transition.current === active) transition.current = null;
    }).catch(() => {});
  }, [router]);

  return (
    <NavigationContext.Provider value={navigate}>
      <div className={styles.surface}>
        <div key={pathname} className={styles.enter}>{children}</div>
      </div>
    </NavigationContext.Provider>
  );
}

export function ArchiveLink({ href, mediaSlug, ...props }: Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & { href: string; mediaSlug?: string }) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} href={href} onNavigate={navigate ? event => {
    event.preventDefault();
    navigate(href, mediaSlug);
  } : undefined} />;
}
