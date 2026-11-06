"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { TileView } from "./rotation-motion";
import type { ViewRequest } from "./interactive-tile";
import { useReducedMotionPreference } from "./use-reduced-motion";
import styles from "./coin-preview.module.css";

const views: { value: TileView; label: string }[] = [
  { value: "perspective", label: "Three-quarter" },
  { value: "front", label: "Front" },
  { value: "edge", label: "Edge" },
  { value: "back", label: "Back" },
];

function SceneMessage({ children }: { children: ReactNode }) {
  return <div className={styles.sceneMessage} role="status">{children}</div>;
}

const CoinScene = dynamic(() => import("./coin-scene"), {
  ssr: false,
  loading: () => <SceneMessage>Preparing the scene…</SceneMessage>,
});
const CompositionScene = dynamic(() => import("./composition-scene"), {
  ssr: false,
  loading: () => <SceneMessage>Preparing the composition…</SceneMessage>,
});

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <SceneMessage>The 3D preview is unavailable. Check browser graphics support, then reload the scene.</SceneMessage>;
    }
    return this.props.children;
  }
}

export default function CoinPreview() {
  const [study, setStudy] = useState<"composition" | "single">("composition");
  const [textGuide, setTextGuide] = useState(true);
  const [paused, setPaused] = useState(false);
  const [resetRequest, setResetRequest] = useState(0);
  const reduced = useReducedMotionPreference();
  const [visible, setVisible] = useState(true);
  const [revision, setRevision] = useState(0);
  const [view, setView] = useState<TileView | null>("perspective");
  const [request, setRequest] = useState<ViewRequest>({ view: "perspective", sequence: 0 });
  const onTurn = useCallback((preset?: TileView) => setView(preset ?? null), []);

  return (
    <main className={styles.preview} lang="en">
      <header className={styles.header}>
        <Link className={styles.back} href="/ko">GRIDS <span aria-hidden="true">↗</span></Link>
        <span className={styles.step}>06 / Motion</span>
      </header>

      <section className={styles.workspace} aria-labelledby="coin-preview-heading">
        <div className={styles.introduction}>
          <h1 id="coin-preview-heading">{study === "composition" ? "Go with the flow." : "Give it a turn."}</h1>
          <p>{study === "composition" ? "A ribbon in motion. Catch it, move it, let it glide." : "Drag the glass. Let it glide. Catch it again."}</p>
          <div className={`${styles.actions} ${styles.studyTabs}`} role="group" aria-label="Preview mode">
            <button type="button" aria-pressed={study === "composition"} onClick={() => setStudy("composition")}>Composition</button>
            <button type="button" aria-pressed={study === "single"} onClick={() => {
              setStudy("single");
              setView(request.view);
            }}>Single tile</button>
          </div>
        </div>

        <div id="coin-preview-stage" className={`${styles.stage} ${study === "composition" ? styles.compositionStage : ""}`}>
          {visible ? (
            <SceneBoundary key={revision}>
              {study === "composition" ? <CompositionScene paused={paused} reduced={reduced} resetRequest={resetRequest} onPauseChange={setPaused} /> : <CoinScene request={request} onTurn={onTurn} />}
            </SceneBoundary>
          ) : (
            <SceneMessage>Scene hidden.</SceneMessage>
          )}
          {study === "composition" && visible && textGuide && (
            <div className={styles.headlineGuide}>
              <span>Text placement guide</span>
              <h2>Ideas take<br />shape.</h2>
            </div>
          )}
        </div>

        <div className={styles.toolbar}>
          {study === "single" ? <div className={styles.actions} role="group" aria-label="Inspect tile finish">
            {views.map(({ value, label }) => (
              <button key={value} type="button" aria-pressed={view === value}
                aria-controls="coin-preview-stage" onClick={() => {
                  setView(value);
                  setRequest(current => ({ view: value, sequence: current.sequence + 1 }));
                }}>
                {label}
              </button>
            ))}
          </div> : <div className={styles.actions}>
            <button type="button" disabled={reduced} onClick={() => setPaused(current => !current)}>
              {reduced ? "Loop off" : paused ? "Play loop" : "Pause loop"}
            </button>
            <button type="button" onClick={() => setResetRequest(current => current + 1)}>Reset arrangement</button>
            <button type="button" aria-pressed={textGuide} onClick={() => setTextGuide(current => !current)}>
              {textGuide ? "Hide text guide" : "Show text guide"}
            </button>
          </div>}
          <div className={styles.actions}>
            <button
              type="button"
              aria-controls="coin-preview-stage"
              onClick={() => {
                if (!visible) setView(request.view);
                setVisible(current => !current);
              }}
            >
              {visible ? "Hide scene" : "Show scene"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRevision((current) => current + 1);
                setVisible(true);
                setView(request.view);
              }}
            >
              Reload scene
            </button>
          </div>
        </div>
        {study === "single" ? <><p id="tile-interaction-help" className={styles.note}>
          Drag to rotate and tilt. On touch, swipe sideways to turn; swipe vertically to scroll.
          Keyboard: focus the glass and use arrow keys. Shift for finer turns, Home to reset, Escape to stop.
        </p>
        <p className={styles.viewStatus} aria-live="polite" aria-atomic="true">
          {view ? `${views.find(item => item.value === view)?.label} view` : "Custom angle"}
        </p></> : <><p id="ribbon-interaction-help" className={styles.note}>
          Drag sideways to move the ribbon. Swipe vertically to scroll. Keyboard: left/right arrows to move,
          Shift for smaller steps, Space to pause or play, Home to reset, Escape to pause. The headline is a placement guide.
        </p><p className={styles.viewStatus} aria-live="polite" aria-atomic="true">
          {reduced ? "Reduced motion: automatic movement and momentum are off. Drag and keyboard controls remain available." : paused ? "Loop paused. You can still move the ribbon." : "Loop playing."}
        </p></>}
      </section>

      <footer className={styles.footer}>GRIDS / Hero studies <span>Geometry · Material · Motion</span></footer>
    </main>
  );
}
