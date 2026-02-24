import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ScrollToTop from "@/components/scroll-to-top";
import Navbar from "@/components/navbar";
import FooterSection from "@/components/footer-section";

// ... imports
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!['en', 'ko'].includes(locale as any)) {
    notFound();
  }

  // Provide all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ScrollToTop />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <Navbar />
        {children}
        <FooterSection />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
