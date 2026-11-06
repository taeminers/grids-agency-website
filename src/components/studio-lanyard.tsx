"use client";

import {
  Component,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";

// Share artwork between the loading/error preview and the live card.
const cardImage = "/models/lanyard/grids-card.svg";
const portraitImage = "/models/lanyard/portrait-new2.png";

function StaticPass({ centered }: { centered: boolean }) {
  return (
    <div
      className={`flex size-full items-center justify-center py-16 ${centered ? "" : "lg:ml-[47.619%] lg:w-[52.381%]"}`}
      aria-hidden="true"
    >
      <div className={`relative aspect-[2/3] ${centered ? "w-[min(60%,280px)]" : "w-[min(75%,375px)]"} -rotate-6 rounded-2xl border border-black/10 bg-[#eeeeea] text-black shadow-xl`}>
        <span className="absolute -top-32 left-1/2 h-32 w-5 -translate-x-1/2 bg-neutral-400" />
        <Image
          src={cardImage}
          alt=""
          width={600}
          height={900}
          unoptimized
          className="relative size-full rounded-2xl"
        />
        <div className="absolute top-[18.8889%] left-[8.6667%] h-[48.8889%] w-[82.6667%] bg-[#eeeee9]">
          <Image
            src={portraitImage}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

const Lanyard = dynamic(() => import("@/components/Lanyard"), {
  ssr: false,
  loading: () => null,
});

class LanyardBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function StudioLanyard({ centered = false }: { centered?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, { margin: "200px 0px", once: true });
  const visible = useInView(ref);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const handleUnavailable = useCallback(() => setFailed(true), []);
  const reducedMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className="relative size-full"
      aria-label="GRIDS studio pass"
    >
      {(!ready || failed || reducedMotion) && <StaticPass centered={centered} />}
      {entered && !reducedMotion && !failed && (
        <div
          className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <LanyardBoundary onError={handleUnavailable}>
            <Lanyard
              active={visible}
              onReady={handleReady}
              onUnavailable={handleUnavailable}
              portraitImage={portraitImage}
              cardScale={1.25}
              position={[0, 0, 20]}
              horizontalOffset={centered ? 0 : 5 / 21}
              frontImage={cardImage}
              backImage={cardImage}
              lanyardImage="/models/lanyard/plain-strap.svg"
            />
          </LanyardBoundary>
        </div>
      )}
    </div>
  );
}
