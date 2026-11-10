"use client";

import { Component, useCallback, useId, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import { Infinite } from "reicon-react/icons/Infinite";
import { useLocale, useTranslations } from "next-intl";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";
import { trackEvent } from "@/lib/analytics";
import styles from "./hero-content.module.css";
import ConsultationLink from "./consultation-link";

const GlassRibbon = dynamic(() => import("./coin-preview/composition-scene"), { ssr: false });
const koreanHeroFont = localFont({
  src: "../../public/fonts/suit/SUIT-Medium.woff2",
  weight: "500",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
});

class RibbonBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function HeroContent() {
  const t = useTranslations("Hero");
  const navT = useTranslations("Navbar");
  const locale = useLocale();
  const reduced = useReducedMotionPreference();
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const helpId = useId();
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => { setFailed(true); setReady(false); }, []);

  return <section id="home-hero" className={styles.hero} aria-labelledby="hero-heading" lang={locale}>
    <div className={styles.stage}>
      {failed && <div className={styles.poster} aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" srcSet="/images/hero/glass-ribbon-mobile.webp" />
          <Image src="/images/hero/glass-ribbon.webp" alt="" fill sizes="100vw" />
        </picture>
      </div>}
      {!failed && <div className={styles.scene} data-ready={ready} inert={!ready}>
        <RibbonBoundary onUnavailable={onUnavailable}>
          <GlassRibbon paused={paused} reduced={reduced} resetRequest={0} onPauseChange={setPaused}
            label={t("ribbon.label")} helpId={helpId} hint={null} onReady={onReady} onUnavailable={onUnavailable} />
        </RibbonBoundary>
      </div>}
      <div className={styles.title}>
        <h1 id="hero-heading" className={locale === "ko" ? koreanHeroFont.className : undefined}>
          <span>{t("headline_lead")}</span><span>{t("headline_prefix")}</span>
        </h1>
        <div className={styles.actions}>
          <Link href={`/${locale}/archive`} className={styles.portfolio}>
            <span aria-hidden="true" className={styles.portfolioCorners}>
              <span /><span /><span /><span />
            </span>
            {navT("work")}<Infinite size={16} aria-hidden="true" />
          </Link>
          <ConsultationLink href={`/${locale}/connect`} label={t("start_project")}
            onClick={() => trackEvent("cta_click", { cta_location: "hero", cta_text: t("start_project") })} />
        </div>
      </div>
    </div>
    <div className={styles.content}>
      <p className={styles.description}>{t("studio_description")}</p>
    </div>
    <p id={helpId} className="sr-only">{t(reduced ? "ribbon.reducedHelp" : "ribbon.help")}</p>
  </section>;
}
