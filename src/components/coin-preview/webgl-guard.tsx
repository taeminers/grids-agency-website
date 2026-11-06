"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { webGLAvailability } from "./webgl-availability";

export function WebGLGuard({ children, fallback = null, onUnavailable }: {
  children: ReactNode;
  fallback?: ReactNode;
  onUnavailable?: () => void;
}) {
  const status = useSyncExternalStore(webGLAvailability.subscribe,
    webGLAvailability.getSnapshot, webGLAvailability.getServerSnapshot);
  useEffect(() => { webGLAvailability.check(); }, []);
  useEffect(() => {
    if (status === "unavailable") onUnavailable?.();
  }, [status, onUnavailable]);
  // The Three renderer must not be constructed when Chrome blocks WebGL.
  // Canvas's HTML fallback does not cover a refused getContext() call.
  return status === "available" ? children : status === "unavailable" ? fallback : null;
}
