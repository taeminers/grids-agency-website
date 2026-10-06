import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ScrollToTop from "@/components/scroll-to-top";
import SiteVisitTracker from "@/components/site-visit-tracker";
import Navbar from "@/components/navbar";
import FooterSection from "@/components/footer-section";
import ConsultationButton from "@/components/consultation-button";

// ... imports
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!["en", "ko"].includes(locale)) {
    notFound();
  }

  // Provide all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SiteVisitTracker />
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
        <ConsultationButton />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
