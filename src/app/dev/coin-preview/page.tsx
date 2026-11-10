import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoinPreview from "@/components/coin-preview/coin-preview";

export const metadata: Metadata = {
  title: "Coin preview · GRIDS",
  robots: { index: false, follow: false },
};

export default function CoinPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <CoinPreview />;
}
