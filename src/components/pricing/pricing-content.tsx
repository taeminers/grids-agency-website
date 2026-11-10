"use client";

import Container from "@/components/container";
import PricingHeader from "./pricing-header";
import PricingServiceExplorer from "./pricing-service-explorer";
import styles from "./pricing-service-explorer.module.css";

export default function PricingContent() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PricingHeader />
      <Container className={styles.container}>
        <PricingServiceExplorer />
      </Container>
    </main>
  );
}
