"use client";

import { useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LayoutGroup, motion } from "framer-motion";
import { Accordion } from "radix-ui";
import {
  Globe2,
  Smartphone,
  Building2,
  RefreshCw,
  MessageCircle,
  ReceiptText,
  ChartNoAxesCombined,
  Check,
} from "lucide-react";
import PricingRules from "./pricing-rules";
import PricingNotes from "./pricing-notes";
import { useReducedMotionPreference } from "@/components/coin-preview/use-reduced-motion";
import { packageAmount, packageServices, type Copy } from "./pricing-data";
import styles from "./pricing-service-explorer.module.css";
import PricingExamples from "./pricing-examples";

const services = [
  { id: "homepage", icon: Globe2 },
  { id: "webApp", icon: Smartphone },
  { id: "crm", icon: Building2 },
  { id: "automation", icon: RefreshCw },
  { id: "chatbot", icon: MessageCircle },
  { id: "growth", icon: ChartNoAxesCombined },
] as const;
const tierNames = ["Basic", "Plus", "Pro"];
export default function PricingServiceExplorer() {
  const t = useTranslations("Pricing");
  const locale = useLocale();
  const reduced = useReducedMotionPreference();
  const copy = (value: Copy) => value[locale === "ko" ? "ko" : "en"];
  const money = (amount: number) =>
    new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(amount);
  const [selectedService, setSelectedService] =
    useState<(typeof services)[number]["id"]>("homepage");
  const [showRules, setShowRules] = useState(false);
  const selected = showRules ? "rules" : selectedService;
  const [tierIndex, setTierIndex] = useState(0);
  const [openTier, setOpenTier] = useState("0");
  const selectorId = useId();
  const selectorRef = useRef<HTMLDivElement>(null);
  const selectService = (id: (typeof services)[number]["id"]) => {
    setSelectedService(id);
    setShowRules(false);
    setTierIndex(0);
    setOpenTier("0");
  };
  const renderService = (
    { id, icon: Icon }: (typeof services)[number],
    index: number,
  ) => (
    <button
      key={id}
      id={`${selectorId}-${id}`}
      type="button"
      role="tab"
      className={styles.serviceTile}
      data-service={id}
      aria-selected={selected === id}
      tabIndex={selectedService === id ? 0 : -1}
      aria-controls="pricing-service-content"
      aria-describedby={`${selectorId}-${id === "growth" ? "growth" : "build"}-label`}
      onClick={() => selectService(id)}
      onKeyDown={(event) => {
        const next =
          event.key === "ArrowRight"
            ? (index + 1) % services.length
            : event.key === "ArrowLeft"
              ? (index - 1 + services.length) % services.length
              : event.key === "Home"
                ? 0
                : event.key === "End"
                  ? services.length - 1
                  : -1;
        if (next < 0) return;
        event.preventDefault();
        selectService(services[next].id);
        selectorRef.current
          ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
          [next]?.focus({ preventScroll: true });
      }}
    >
      {selected === id && (
        <motion.span
          className={styles.serviceSelection}
          layoutId="service-selection"
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", bounce: 0, duration: 0.4 }
          }
          aria-hidden="true"
        />
      )}
      <Icon
        className={styles.serviceIcon}
        size={20}
        strokeWidth={1.6}
        aria-hidden="true"
      />
      <span className={styles.serviceName}>
        {t(`explorer.services.${id}.title`)}
      </span>
    </button>
  );
  const packageId = selected === "webApp" ? "mvp" : selected;
  const service = packageServices.find((item) => item.id === packageId);
  const tier = service?.tiers[tierIndex];
  const tierTitle = tier
    ? tier.title
      ? copy(tier.title)
      : tierNames[tierIndex]
    : selected === "growth" ? t("explorer.services.growth.packageTitle") : t("explorer.customTitle");
  const packagePrice = service && tier ? money(packageAmount(service, tier)) : null;

  return (
    <section aria-label={t("packages.serviceLabel")}>
      <div className={styles.selectorToolbar}>
        <button id={`${selectorId}-rules`} type="button" className={styles.guideButton}
          aria-pressed={showRules} aria-controls="pricing-service-content"
          onClick={() => setShowRules(value => !value)}>
          <ReceiptText size={15} strokeWidth={1.6} aria-hidden="true" />
          {t("explorer.services.rules.title")}
        </button>
      </div>
      <LayoutGroup id={selectorId}>
        <motion.div ref={selectorRef} className={styles.serviceGrid} role="tablist"
          aria-label={t("packages.serviceLabel")}>
          <div className={styles.serviceRow} role="presentation">
            <p id={`${selectorId}-build-label`} className={styles.groupLabel} aria-hidden="true">{t("explorer.groups.build")}</p>
            <div className={styles.serviceGroup} role="presentation">
              {services.slice(0, -1).map(renderService)}
            </div>
          </div>
          <div className={styles.serviceRow} role="presentation">
            <p id={`${selectorId}-growth-label`} className={styles.groupLabel} aria-hidden="true">{t("explorer.groups.growth")}</p>
            <div className={styles.serviceGroup} role="presentation">
              {renderService(services[services.length - 1], services.length - 1)}
            </div>
          </div>
        </motion.div>
      </LayoutGroup>

      <div
        id="pricing-service-content"
        className={styles.serviceContent}
        role={showRules ? "region" : "tabpanel"}
        aria-labelledby={`${selectorId}-${selected}`}
        tabIndex={0}
      >
        {selected === "rules" ? (
          <PricingRules />
        ) : (
          <>
            <div className={styles.sectionHeading}>
              <h2>
                <span>{t(`explorer.services.${selected}.title`)}</span>
                <span className={styles.secondary}>
                  {t("explorer.heading")}
                </span>
              </h2>
            </div>
            <div className={styles.detailGrid}>
              <div className={styles.quote}>
                <motion.div
                  key={`${selected}-${tierIndex}`}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduced ? 0 : 0.25 }}
                  className={styles.quoteInner}
                >
                  <div className={styles.quoteHeader}>
                    <h3>{tierTitle}</h3>
                    <span>{t("vatNote")}</span>
                  </div>
                  <div className={styles.priceStage}>
                    <p className="sr-only">
                      {t(
                        service?.id === "homepage"
                          ? "packages.packagePrice"
                          : "packages.proposedPrice",
                      )}
                    </p>
                    {packagePrice && <span className={styles.priceQualifier} aria-hidden="true">{t("explorer.priceApproximate")}</span>}
                    <p
                      className={styles.price}
                      data-custom={!service || !tier}
                      aria-label={packagePrice ? t("explorer.approximateMinimum", { price: packagePrice }) : undefined}
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {packagePrice ?? t("explorer.customPrice")}
                    </p>
                    {packagePrice && <span className={styles.priceQualifier} aria-hidden="true">{t("explorer.priceStartingFrom")}</span>}
                  </div>
                </motion.div>
              </div>
              {service ? (
                <Accordion.Root
                  type="single"
                  collapsible
                  value={openTier}
                  onValueChange={(value) => {
                    setOpenTier(value);
                    if (value) setTierIndex(Number(value));
                  }}
                  className={styles.packageOptions}
                >
                  {service.tiers.map((option, index) => {
                    const open = openTier === String(index);
                    return (
                      <Accordion.Item
                        key={`${selected}-${index}`}
                        value={String(index)}
                        className={styles.option}
                      >
                        <Accordion.Header className={styles.optionHeader}>
                          <Accordion.Trigger
                            className={styles.optionTrigger}
                          >
                            <span className={styles.optionLabel}>
                              {option.title
                                ? copy(option.title)
                                : tierNames[index]}
                            </span>
                            <span
                              className={styles.indicator}
                              aria-hidden="true"
                            >
                              <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                                initial={false} animate={{ rotate: open ? 180 : 0 }}
                                transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.42 }}>
                                <path d="m6 9 6 6 6-6" />
                              </motion.svg>
                            </span>
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content forceMount asChild>
                          <motion.div
                            initial={false}
                            inert={!open}
                            aria-hidden={!open}
                            animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                            transition={
                              reduced
                                ? { duration: 0 }
                                : {
                                    height: { type: "spring", bounce: 0, duration: 0.42 },
                                    opacity: { duration: 0.22, ease: "easeOut" },
                                  }
                            }
                            className={styles.optionReveal}
                          >
                            <div className={styles.optionBody}>
                              <p className={styles.optionTitle}>
                                {copy(option.summary)}
                              </p>
                              <ul>
                                {option.scope.map((item) => (
                                  <li key={item.en}>
                                    <Check size={14} aria-hidden="true" />
                                    <span>{copy(item)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        </Accordion.Content>
                      </Accordion.Item>
                    );
                  })}
                </Accordion.Root>
              ) : (
                <div className={styles.options}>
                  <div className={styles.customOptions} data-state="open">
                    <span className={styles.eyebrow}>
                      {selected === "growth" ? t("explorer.services.growth.label") : t("explorer.customLabel")}
                    </span>
                    <h3>{t(`explorer.services.${selected}.heading`)}</h3>
                    <p>{t(`explorer.services.${selected}.description`)}</p>
                    <ul>
                      {(selected === "growth" ? ["first", "second", "third", "fourth", "fifth"] : ["first", "second", "third"]).map((key) => (
                        <li key={key}>
                          <Check size={14} aria-hidden="true" />
                          {t(`explorer.services.${selected}.scope.${key}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <PricingNotes />
            {selected !== "growth" && <PricingExamples service={selected} />}
          </>
        )}
      </div>
    </section>
  );
}
