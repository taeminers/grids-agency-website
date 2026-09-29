import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const isProduction = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  title: "GRIDS AGENCY [그리즈 에이전시]",
  description:
    "서울대학교 컴퓨터공학부 기술진의 전문적인 프로그램 개발. 웹사이트, 시스템, 앱, 자동화. 모든것을 만들어드립니다.",
  openGraph: {
    title: "Grids Agency [그리즈 에이전시]",
    description:
      "서울대학교 컴퓨터공학부 기술진의 전문적인 프로그램 개발. 웹사이트, 시스템, 앱, 자동화. 모든것을 만들어드립니다.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Grids Agency",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className="[scrollbar-gutter:stable]"
      suppressHydrationWarning
    >
      <head>
        {isProduction && (
          <Script
            id="google-tag-manager"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P24CXJTJ');`,
            }}
          />
        )}
        {/* Reset before next-themes initializes so refreshes start in dark mode. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try { localStorage.setItem('theme', 'dark'); } catch {}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        {isProduction && (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-P24CXJTJ"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
