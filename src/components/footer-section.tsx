"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "@/components/navigation/page-navigation";
import { Eclipse, Mail } from "lucide-react";
import FooterCube from "@/components/footer-cube";
import FooterContactOrb from "@/components/footer-contact-orb";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import styles from "./footer-section.module.css";
import { useFooterDesktopActive } from "@/hooks/use-footer-desktop-active";
import { useReducedMotionPreference } from "./coin-preview/use-reduced-motion";

interface FooterSectionProps {
  className?: string;
}

export default function FooterSection({ className }: FooterSectionProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Footer");
  const nav = useTranslations("Navbar");
  const revealed = useFooterDesktopActive();
  const reduced = useReducedMotionPreference();
  const background = useMotionValue("#ffffff");
  useEffect(() => {
    const animation = animate(background, revealed ? "#f1f4f6" : "#ffffff", {
      duration: reduced ? 0 : .85, ease: [.22, 1, .36, 1],
    });
    return () => animation.stop();
  }, [background, revealed, reduced]);
  if (pathname?.includes("/connect")) return null;

  const textReveal = {
    initial: false as const,
    animate: { opacity: revealed ? 1 : 0, y: revealed || reduced ? 0 : 8 },
    transition: { duration: reduced ? 0 : .55, delay: revealed && !reduced ? .1 : 0 },
    inert: !revealed,
    "aria-hidden": !revealed,
  };

  const trackContact = (label: string) => trackEvent("cta_click", { cta_location: "footer", cta_text: label });
  const apps = [
    { key: "contact", href: `/${locale}/connect`, label: nav("contact"), icon: <FooterContactOrb /> },
    { key: "work", href: `/${locale}/archive`, label: nav("work"), icon: <Eclipse strokeWidth={1.5} /> },
    { key: "pricing", href: `/${locale}/pricing`, label: nav("pricing"), icon:
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="m4 5 4 14 4-14 4 14 4-14M2 10h20M2 14h20" />
      </svg> },
  ];

  return (
    <motion.footer data-footer-desktop data-revealed={revealed} style={{ backgroundColor: background }}
      className={cn(styles.footer, className)} aria-label={t("desktopLabel")}>
        <div className={styles.screen}>
          <div className={styles.center}>
            <motion.address {...textReveal} className={styles.address}>{t("location")}</motion.address>
            <div className={styles.cubeArea}><FooterCube background={background} /></div>
            <motion.p {...textReveal} className={styles.copyright}>{t("copyright")}</motion.p>
          </div>
          <motion.nav className={styles.dock} aria-label={t("navigationLabel")}
            initial={false} inert={!revealed} aria-hidden={!revealed}
            animate={{ opacity: revealed ? 1 : 0, y: revealed || reduced ? 0 : 18, scale: revealed || reduced ? 1 : .97 }}
            transition={{ type: "spring", bounce: 0, duration: reduced ? 0 : .65, delay: revealed && !reduced ? .08 : 0 }}>
            {apps.map(({ key, href, label, icon }) => (
              <Link key={key} className={styles.app} href={href} aria-label={label}
                onClick={() => { if (key === "contact") trackContact(label); }}>
                <span className={`${styles.icon} ${styles[key]}`} aria-hidden="true">{icon}</span>
                <span className={styles.appLabel} aria-hidden="true">{label}</span>
              </Link>
            ))}
            <span className={styles.separator} aria-hidden="true" />
            <a className={styles.app} href={`mailto:${t("email")}`} aria-label={`${t("mailApp")} — ${t("email")}`}
              onClick={() => trackContact(t("email"))}>
              <span className={`${styles.icon} ${styles.mail}`} aria-hidden="true"><Mail strokeWidth={1.5} /></span>
              <span className={styles.appLabel} aria-hidden="true">{t("mailApp")}</span>
            </a>
            <a className={styles.app} href="https://pf.kakao.com/_FGQrX" target="_blank" rel="noopener noreferrer"
              aria-label={t("kakaoApp")} onClick={() => trackContact("KakaoTalk ↗")}>
              <span className={`${styles.icon} ${styles.kakao}`} aria-hidden="true">
                <Image src="/icons/integrations/kakao.svg" width={64} height={64} alt="" />
              </span>
              <span className={styles.appLabel} aria-hidden="true">{t("kakaoApp")}</span>
            </a>
          </motion.nav>
        </div>
    </motion.footer>
  );
}
