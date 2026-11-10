import { useEffect, useRef, useState } from "react";
import { simulateInquiry, type AutomationProcessor, type DemoInput, type DemoResult } from "./engine";

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export function useInquirySimulation(processor: AutomationProcessor = simulateInquiry) {
  const [result, setResult] = useState<DemoResult | null>(null);
  const [completed, setCompleted] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);
  const [sourcesRead, setSourcesRead] = useState(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const reset = () => {
    controller.current?.abort();
    controller.current = null;
    setResult(null); setCompleted(0); setRunning(false); setError(false); setSourcesRead(0);
  };
  const finish = () => {
    if (!result) return;
    controller.current?.abort();
    setSourcesRead(result.sources.length); setCompleted(5); setRunning(false);
  };
  const run = async (input: DemoInput) => {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setRunning(true); setError(false); setCompleted(0); setResult(null); setSourcesRead(0);
    try {
      const output = await processor(input, active.signal);
      if (active.signal.aborted) return;
      setResult(output);
      // Deliberate demonstration pacing; reduced motion removes movement, not reading time.
      await pause(1800, active.signal);
      setCompleted(1);
      for (let index = 0; index < output.sources.length; index++) {
        await pause(2400, active.signal);
        setSourcesRead(index + 1);
      }
      if (!output.sources.length) await pause(1800, active.signal);
      setCompleted(2);
      await pause(1800, active.signal);
      setCompleted(3);
      await pause(2800, active.signal);
      setCompleted(4);
      await pause(2000, active.signal);
      setCompleted(5);
    } catch {
      if (!active.signal.aborted) setError(true);
    } finally {
      if (!active.signal.aborted) setRunning(false);
    }
  };
  return { result, completed, running, error, sourcesRead, reset, run, finish };
}
