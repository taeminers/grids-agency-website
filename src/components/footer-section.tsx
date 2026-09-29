"use client";

import { useRef } from "react";
import { useScrollReveals } from "@/hooks/use-scroll-reveals";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import BrandLogo from "@/components/brand-logo";
import { FooterBeams } from "@/components/footer-graphics";
import { MetalButton } from "@/components/spectrumui/metal-button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface FooterSectionProps {
  className?: string;
}

const footerLink =
  "transition-colors hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary";

function FooterContent({ className }: FooterSectionProps) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const root = useRef<HTMLElement>(null);
  useScrollReveals(
    root,
    pathname === `/${locale}` || pathname === `/${locale}/`,
  );

  return (
    <footer
      ref={root}
      className={cn(
        "relative isolate z-10 mt-section overflow-hidden bg-background text-foreground",
        className,
      )}
      aria-labelledby="footer-heading"
    >
      <FooterBeams />
      <div className="relative px-[clamp(20px,4.2vw,72px)]">
        <div className="flex flex-col items-center py-section text-center">
          <h2
            data-scroll-reveal="text"
            id="footer-heading"
            className="max-w-4xl text-[clamp(38px,6.2vw,92px)] leading-[1.15] font-bold tracking-[-0.055em] [word-break:keep-all]"
          >
            <span className="block">{t("headline")}</span>
            <span className="block">{t("headlineEnd")}</span>
          </h2>
          <p
            data-scroll-reveal="text"
            className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground [text-wrap:balance] [word-break:keep-all]"
          >
            {t("closing")}
          </p>
          <div data-scroll-reveal="text">
            <MetalButton
              asChild
              size="md"
              className="gap-6 rounded-none text-sm"
              wrapperClassName="mt-8 rounded-none"
            >
              <Link
                href={`/${locale}/connect`}
                onClick={() =>
                  trackEvent("cta_click", {
                    cta_location: "footer",
                    cta_text: t("cta"),
                  })
                }
              >
                {t("cta")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </MetalButton>
          </div>
        </div>

        <div
          data-scroll-reveal="fade"
          className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-foreground/10 py-10 md:py-12 lg:grid-cols-[1.6fr_0.8fr_1fr] lg:gap-x-16"
        >
          <div data-scroll-reveal="text" className="col-span-2 lg:col-span-1">
            <Link
              href={`/${locale}`}
              aria-label={t("home")}
              className={cn("inline-flex items-center gap-3", footerLink)}
            >
              <BrandLogo className="size-6" />
              <span className="text-sm font-semibold tracking-[0.04em]">
                GRIDS AGENCY
              </span>
            </Link>
            <p
              data-scroll-reveal="text"
              className="mt-4 max-w-72 text-xs leading-6 text-muted-foreground [word-break:keep-all]"
            >
              {t("location")}
            </p>
          </div>

          <nav data-scroll-reveal="text" aria-label={t("navigationLabel")}>
            <h3 className="mb-6 text-xs font-medium">{t("navigationLabel")}</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {[
                { href: `/${locale}`, label: t("home") },
                { href: `/${locale}/archive`, label: nav("work") },
                { href: `/${locale}/connect`, label: nav("contact") },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div data-scroll-reveal="text">
            <h3 className="mb-6 text-xs font-medium">{t("contactLabel")}</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a
                  href={`mailto:${t("email")}`}
                  onClick={() =>
                    trackEvent("cta_click", {
                      cta_location: "footer",
                      cta_text: t("email"),
                    })
                  }
                  className={cn("break-words", footerLink)}
                >
                  {t("email")}
                </a>
              </li>
              <li>
                <a
                  href="https://pf.kakao.com/_FGQrX"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("cta_click", {
                      cta_location: "footer",
                      cta_text: "KakaoTalk ↗",
                    })
                  }
                  className={footerLink}
                >
                  KakaoTalk ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          data-scroll-reveal="fade"
          className="flex flex-wrap items-center justify-between gap-5 border-t border-foreground/10 pt-5 pb-24 md:pb-8"
        >
          <p
            data-scroll-reveal="text"
            className="text-[10px] leading-5 text-muted-foreground"
          >
            {t("copyright")}
          </p>
          <button
            data-scroll-reveal="text"
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
            className={cn(
              "flex cursor-pointer items-center gap-3 text-xs text-muted-foreground",
              footerLink,
            )}
          >
            {t("backToTop")}
            <ArrowRight size={14} className="-rotate-90" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default function FooterSection(props: FooterSectionProps) {
  const pathname = usePathname();
  if (pathname?.includes("/connect") || pathname?.includes("/archive"))
    return null;
  return <FooterContent {...props} />;
}
