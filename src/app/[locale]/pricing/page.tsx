import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PricingContent from "@/components/pricing/pricing-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return { title: `${t("metaTitle")} — GRIDS`, description: t("description") };
}

export default function PricingPage() {
  return <PricingContent />;
}
