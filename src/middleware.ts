import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ko'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /.* (all files in the `public` directory, e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
