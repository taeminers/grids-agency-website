"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { markSiteVisited } from "@/lib/intro-visit";

export default function SiteVisitTracker() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    // A visitor who lands on another page should not get an intro later on Home.
    // On a homepage entry, Intro itself claims the first visit.
    if (!/^\/(en|ko)\/?$/.test(pathname)) markSiteVisited();
  }, [pathname]);

  return null;
}
