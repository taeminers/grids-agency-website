"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import ConsultationLink from "./consultation-link";
import { trackEvent } from "@/lib/analytics";
import styles from "./consultation-button.module.css";
import { useFooterVisible } from "@/hooks/use-footer-desktop-active";

export default function ConsultationButton() {
  const t = useTranslations("ConsultationButton");
  const inFooter = useFooterVisible();
  const pathname = usePathname();

  if (pathname.replace(/\/$/, "").endsWith("/connect")) return null;

  return (
    <div inert={inFooter} aria-hidden={inFooter} data-hidden={inFooter}
      className={`${styles.floating} fixed right-[max(1.25rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 md:right-8 md:bottom-8`}>
      <ConsultationLink
        href="https://pf.kakao.com/_FGQrX"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("accessibleLabel")}
        label={t("label")}
        icon={<span className={styles.kakaoLogo} />}
        onClick={() => trackEvent("cta_click", {
          cta_location: "floating_consultation",
          cta_text: t("label"),
        })}
      />
    </div>
  );
}
