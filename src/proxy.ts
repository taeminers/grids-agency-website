import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const handleI18nRouting = createMiddleware({
  locales: ["en", "ko"],
  defaultLocale: "ko",
  localeDetection: false,
  localeCookie: false,
});

export default function proxy(request: NextRequest) {
  // Keep the standalone local scene preview outside the localized site shell.
  if (request.nextUrl.pathname === "/dev/coin-preview") {
    return NextResponse.next();
  }

  // Reset actual document loads to Korean. An absent RSC header does not
  // necessarily mean a document request, so do not redirect client navigation.
  const isDocumentRequest =
    request.headers.get("sec-fetch-dest") === "document" ||
    request.headers.get("sec-fetch-mode") === "navigate";

  if (isDocumentRequest && /^\/en(?:\/|$)/.test(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = url.pathname.replace(/^\/en(?=\/|$)/, "/ko");
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
