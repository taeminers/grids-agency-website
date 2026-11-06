type Availability = "checking" | "available" | "unavailable";
type ProbeContext = Pick<WebGL2RenderingContext, "isContextLost" | "getExtension">;

function requestContext(): ProbeContext | null {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 2;
  return canvas.getContext("webgl2", { antialias: false, powerPreference: "low-power" });
}

/** One tiny capability probe per page, with immediate GPU resource release. */
export function createWebGLAvailability(probe: () => ProbeContext | null = requestContext) {
  let status: Availability = "checking";
  const listeners = new Set<() => void>();
  const publish = (next: Availability) => {
    status = next;
    listeners.forEach(listener => listener());
  };
  return {
    getSnapshot: () => status,
    getServerSnapshot: (): Availability => "checking",
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    check() {
      // Also avoids extra probes during React Strict Mode and route remounts.
      if (status !== "checking") return;
      let context: ProbeContext | null = null;
      let available = false;
      try {
        context = probe();
        available = !!context && !context.isContextLost();
      } catch {
        available = false;
      } finally {
        // Do not keep a spare context alive alongside the real renderer.
        try { context?.getExtension("WEBGL_lose_context")?.loseContext(); } catch { /* Already lost. */ }
      }
      publish(available ? "available" : "unavailable");
    },
    markUnavailable() {
      // Stay on the static fallback; never automatically retry a lost context.
      if (status !== "unavailable") publish("unavailable");
    },
  };
}

export const webGLAvailability = createWebGLAvailability();
