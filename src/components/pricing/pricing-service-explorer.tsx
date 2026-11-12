"use client";

import { useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Globe2,
  Smartphone,
  Building2,
  RefreshCw,
  MessageCircle,
  ReceiptText,
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
  { id: "rules", icon: ReceiptText },
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
  const [selected, setSelected] =
    useState<(typeof services)[number]["id"]>("homepage");
  const [tierIndex, setTierIndex] = useState(0);
  const selectorId = useId();
  const selectorRef = useRef<HTMLDivElement>(null);
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
      tabIndex={selected === id ? 0 : -1}
      aria-controls="pricing-service-content"
      onClick={() => {
        setSelected(id);
        setTierIndex(0);
      }}
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
        setSelected(services[next].id);
        setTierIndex(0);
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
    : t("explorer.customTitle");
  const packagePrice = service && tier ? money(packageAmount(service, tier)) : null;

  return (
    <section aria-label={t("packages.serviceLabel")}>
      <LayoutGroup id={selectorId}>
        <motion.div
          ref={selectorRef}
          className={styles.serviceGrid}
          role="tablist"
          aria-label={t("packages.serviceLabel")}
        >
          <div className={styles.serviceGroup} role="presentation">
            {services.slice(0, 5).map(renderService)}
          </div>
          <div className={styles.guideOption} role="presentation">
            {renderService(services[5], 5)}
          </div>
        </motion.div>
      </LayoutGroup>

      <div
        id="pricing-service-content"
        className={styles.serviceContent}
        role="tabpanel"
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
                    <p
                      className={styles.price}
                      data-custom={!service || !tier}
                      aria-label={packagePrice ? t("explorer.approximateMinimum", { price: packagePrice }) : undefined}
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {packagePrice ? `~ ${packagePrice}+` : t("explorer.customPrice")}
                    </p>
                  </div>
                </motion.div>
              </div>
              <div className={styles.options}>
                {service ? (
                  service.tiers.map((option, index) => {
                    const open = tierIndex === index;
                    return (
                      <div
                        key={`${selected}-${index}`}
                        className={styles.option}
                        data-state={open ? "open" : "closed"}
                      >
                        <h3>
                          <button
                            type="button"
                            className={styles.optionTrigger}
                            aria-expanded={open}
                            aria-controls={`pricing-tier-${selected}-${index}`}
                            onClick={() => {
                              setTierIndex(index);
                            }}
                          >
                            <span>
                              {option.title
                                ? copy(option.title)
                                : tierNames[index]}
                            </span>
                            <span
                              className={styles.indicator}
                              aria-hidden="true"
                              data-active={open}
                            />
                          </button>
                        </h3>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              id={`pricing-tier-${selected}-${index}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={
                                reduced
                                  ? { duration: 0 }
                                  : { type: "spring", bounce: 0, duration: 0.4 }
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
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.customOptions}>
                    <span className={styles.eyebrow}>
                      {t("explorer.customLabel")}
                    </span>
                    <h3>{t(`explorer.services.${selected}.heading`)}</h3>
                    <p>{t(`explorer.services.${selected}.description`)}</p>
                    <ul>
                      {["first", "second", "third"].map((key) => (
                        <li key={key}>
                          <Check size={14} aria-hidden="true" />
                          {t(`explorer.services.${selected}.scope.${key}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <PricingNotes />
            <PricingExamples service={selected} />
          </>
        )}
      </div>
    </section>
  );
}
