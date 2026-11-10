"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";
import { WebGLGuard } from "./coin-preview/webgl-guard";
import styles from "./footer-cube.module.css";

const FooterCubeScene = dynamic(() => import("./footer-cube-scene"), { ssr: false });

class CubeBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function FooterCube({ background }: { background: MotionValue<string> }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const t = useTranslations("Footer");
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);

  return (
    <div className={styles.stage} data-ready={ready && !failed}>
      <div className={styles.renderer} inert={!ready || failed} aria-hidden={!ready || failed}>
        {/* Warm the real geometry, studio and refraction buffers on mount.
            The scene already stops its idle loop while outside the viewport. */}
        {!failed && (
          <CubeBoundary onFailure={onFailure}>
            <WebGLGuard onUnavailable={onFailure}>
              <FooterCubeScene background={background} label={t("cubeLabel")} help={t("cubeHelp")} onReady={onReady} onFailure={onFailure} />
            </WebGLGuard>
          </CubeBoundary>
        )}
      </div>
    </div>
  );
}
