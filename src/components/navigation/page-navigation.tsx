"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";
import "./page-navigation.css";

type Pending = { pathname: string; finish: () => void };
type Navigate = (href: string) => boolean;
const NavigationContext = createContext<Navigate | null>(null);

export function PageNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const generation = useRef(0);
  const pending = useRef<Pending | null>(null);
  const scrollTarget = useRef<string | null>(null);
  const active = useRef<ViewTransition | null>(null);
  const entrance = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (scrollTarget.current === pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      scrollTarget.current = null;
    }
    const navigation = pending.current;
    if (navigation?.pathname === pathname) {
      // Commit the new route and its scroll-driven navbar state before capture.
      queueMicrotask(navigation.finish);
      return;
    }
    // Also covers history navigation, unsupported browsers, and slow routes
    // that committed after the native transition's safety timeout.
    entrance.current?.cancel();
    const page = document.querySelector("main");
    if (page && typeof page.animate === "function") {
      entrance.current = page.animate([{ opacity: .35 }, { opacity: 1 }], {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 120 : 400,
        easing: "cubic-bezier(.22,1,.36,1)",
      });
    }
  }, [pathname]);

  useEffect(() => () => {
    generation.current += 1;
    pending.current?.finish();
    active.current?.skipTransition();
    entrance.current?.cancel();
    delete document.documentElement.dataset.pageTransition;
  }, []);

  const navigate = useCallback<Navigate>((href) => {
    const destination = new URL(href, window.location.href);
    // Keep native hash scrolling, same-page links, and external URLs intact.
    if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return false;

    const request = ++generation.current;
    pending.current?.finish();
    active.current?.skipTransition();
    entrance.current?.cancel();
    active.current = null;
    delete document.documentElement.dataset.pageTransition;

    if (!document.startViewTransition) {
      router.push(href);
      return true;
    }

    const root = document.documentElement;
    root.dataset.pageTransition = "active";
    scrollTarget.current = destination.pathname.replace(/\/$/, "") || "/";
    const transition = document.startViewTransition(() => {
      // A newer click can arrive before the browser invokes this callback.
      if (generation.current !== request) return;
      return new Promise<void>(resolve => {
        const finish = () => {
          window.clearTimeout(timer);
          if (pending.current?.finish === finish) pending.current = null;
          resolve();
        };
        const timer = window.setTimeout(() => {
          transition.skipTransition();
          finish();
        }, 2200);
        pending.current = { pathname: destination.pathname.replace(/\/$/, "") || "/", finish };
        router.push(href, { scroll: false });
      });
    });
    active.current = transition;
    // Snapshot failures must never prevent the underlying route from opening.
    void transition.ready.catch(() => {});
    void transition.finished.finally(() => {
      if (active.current !== transition) return;
      active.current = null;
      delete root.dataset.pageTransition;
    }).catch(() => {});
    return true;
  }, [router]);

  return <NavigationContext.Provider value={navigate}>{children}</NavigationContext.Provider>;
}

export default function PageLink({ href, ...props }: Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & { href: string }) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} href={href} onNavigate={event => {
    // Next invokes onNavigate only for client-side navigation: modified clicks,
    // downloads, and new tabs retain normal browser behavior.
    if (navigate?.(href)) event.preventDefault();
  }} />;
}
