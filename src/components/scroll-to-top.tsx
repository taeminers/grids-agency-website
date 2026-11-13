"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // Prevent browser from restoring scroll position
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      if (!window.location.hash) window.scrollTo(0, 0);
    }
  }, []);

  return null;
}
