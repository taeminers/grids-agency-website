"use client";

import { useTranslations } from "next-intl";
import { Building2, Globe2, MessageCircle, RefreshCw, Smartphone } from "lucide-react";
import styles from "./pricing-examples.module.css";
import PricingCrmDemo from "./pricing-crm-demo";
import PricingAutomationDemo from "./pricing-automation-demo";
import PricingSupportDemo from "./pricing-support-demo";
import PricingExampleViewport from "./pricing-example-viewport";

const serviceIcons = { homepage: Globe2, webApp: Smartphone, crm: Building2, automation: RefreshCw, chatbot: MessageCircle };
type ExampleService = keyof typeof serviceIcons;

export default function PricingExamples({ service }: { service: ExampleService }) {
  const t = useTranslations("Pricing.examples");
  const Icon = serviceIcons[service];
  const interactive = service !== "webApp";
  return (
    <section id="pricing-examples" className={styles.section} aria-labelledby="pricing-examples-heading">
      <header className={styles.heading}><div><h2 id="pricing-examples-heading">{t("heading")}<span>{t("headingSecondary")}</span></h2></div></header>
      <div className={styles.frame}>
        {!interactive && <div className={styles.toolbar}><div className={styles.frameTitle}><Icon size={18} strokeWidth={1.6} aria-hidden="true" /><h3>{t(`services.${service}.title`)}</h3></div></div>}
        {service === "homepage" ? <PricingExampleViewport key="homepage" kind="homepage">{() => <iframe data-pricing-website className={styles.websiteFrame} src="https://demo001c.gridsagency.com/" title={t("services.homepage.title")} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" />}</PricingExampleViewport>
          : service === "automation" ? <PricingExampleViewport key="automation" kind="automation">{(device) => <PricingAutomationDemo device={device} />}</PricingExampleViewport>
          : service === "chatbot" ? <PricingExampleViewport key="chatbot" kind="chatbot">{(device) => <PricingSupportDemo device={device} />}</PricingExampleViewport>
          : service === "crm" ? <PricingExampleViewport key="crm" kind="crm">{(device) => <PricingCrmDemo device={device} />}</PricingExampleViewport>
          : <div className={styles.previewStage}><div className={styles.previewCanvas}><div className={styles.placeholder}><p>{t(`services.${service}.placeholder`)}</p></div></div></div>}
      </div>
    </section>
  );
}
