"use client";

import PricingHeader from "./pricing-header";
import PricingServiceExplorer from "./pricing-service-explorer";
import styles from "./pricing-service-explorer.module.css";

export default function PricingContent() {
  return (
    <main className="min-h-screen bg-background text-foreground [--pricing-gutter:1.25rem] sm:[--pricing-gutter:2rem] md:[--pricing-gutter:3rem] lg:[--pricing-gutter:4rem]">
      <PricingHeader />
      <div className={styles.container}>
        <PricingServiceExplorer />
      </div>
    </main>
  );
}
