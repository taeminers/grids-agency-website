"use client";

import { useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, LayoutGroup, motion, useInView } from "framer-motion";
import {
  Globe2,
  Smartphone,
  Building2,
  RefreshCw,
  MessageCircle,
  ReceiptText,
  Check,
  ListChecks,
  Languages,
} from "lucide-react";
import PricingRules from "./pricing-rules";
import PricingExamples from "./pricing-examples";
import ConsultationLink from "@/components/consultation-link";
import { WebGLGuard } from "@/components/coin-preview/webgl-guard";
import { useReducedMotionPreference } from "@/components/coin-preview/use-reduced-motion";
import {
  getRate,
  getPackageBaseRate,
  packageAmount,
  packageMinimumAdjustment,
  packageServices,
  type Copy,
} from "./pricing-data";
import styles from "./pricing-service-explorer.module.css";

const SilkCurrent = dynamic(() => import("./silk-current"), { ssr: false });

function QuoteBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "400px 0px" });

  return (
    <div ref={ref} className={styles.quoteBackdrop} aria-hidden="true">
      {visible && (
        <WebGLGuard>
          <SilkCurrent />
        </WebGLGuard>
      )}
    </div>
  );
}

const services = [
  { id: "homepage", icon: Globe2 },
  { id: "webApp", icon: Smartphone },
  { id: "crm", icon: Building2 },
  { id: "automation", icon: RefreshCw },
  { id: "chatbot", icon: MessageCircle },
  { id: "rules", icon: ReceiptText },
] as const;
const tierNames = ["Basic", "Plus", "Pro"];
const pricingNotes = [
  { id: "scope", icon: ListChecks },
  { id: "costs", icon: ReceiptText },
  { id: "translation", icon: Languages },
] as const;

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
  const revealOption = (button: HTMLButtonElement) => {
    const container = selectorRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const target = button.getBoundingClientRect();
    const offset =
      target.left < bounds.left + 8
        ? target.left - bounds.left - 8
        : target.right > bounds.right - 8
          ? target.right - bounds.right + 8
          : 0;
    if (offset)
      container.scrollBy({
        left: offset,
        behavior: reduced ? "instant" : "smooth",
      });
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
      tabIndex={selected === id ? 0 : -1}
      aria-controls="pricing-service-content"
      onFocus={(event) => revealOption(event.currentTarget)}
      onClick={(event) => {
        setSelected(id);
        setTierIndex(0);
        revealOption(event.currentTarget);
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

  return (
    <section aria-label={t("packages.serviceLabel")}>
      <LayoutGroup id={selectorId}>
        <motion.div
          layoutScroll
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
              <p>{t(`explorer.services.${selected}.description`)}</p>
            </div>
            <div className={styles.detailGrid}>
              <div className={styles.options}>
                {service ? (
                  service.tiers.map((option, index) => {
                    const open = tierIndex === index;
                    return (
                      <div
                        key={`${selected}-${index}`}
                        className={styles.option}
                      >
                        <h3>
                          <button
                            type="button"
                            className={styles.optionTrigger}
                            aria-expanded={open}
                            aria-controls={`pricing-tier-${selected}-${index}`}
                            onClick={() => setTierIndex(index)}
                          >
                            <span className={styles.number}>0{index + 1}</span>
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
              <div className={styles.quote}>
                <QuoteBackdrop />
                <div className={styles.quoteSurface}>
                  <motion.div
                    key={`${selected}-${tierIndex}`}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.25 }}
                    className={styles.quoteInner}
                  >
                    <div className={styles.quoteHeader}>
                      <span>{t(`explorer.services.${selected}.title`)}</span>
                      <span>{t("vatNote")}</span>
                    </div>
                    <h3>{tierTitle}</h3>
                    <p className={styles.priceLabel}>
                      {t(
                        service?.id === "homepage"
                          ? "packages.packagePrice"
                          : "packages.proposedPrice",
                      )}
                    </p>
                    <p className={styles.price}>
                      {service && tier
                        ? money(packageAmount(service, tier))
                        : t("explorer.customPrice")}
                    </p>
                    {service && tier && (
                      <dl className={styles.breakdown}>
                        <div>
                          <dt>{t("packages.base")}</dt>
                          <dd>
                            {money(getPackageBaseRate(service, tier).amount!)}
                          </dd>
                        </div>
                        {tier.extras.map((item) => (
                          <div key={item.id}>
                            <dt>
                              {copy(getRate(item.id).label)}
                              {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                            </dt>
                            <dd>
                              {money(getRate(item.id).amount! * item.quantity)}
                            </dd>
                          </div>
                        ))}
                        {packageMinimumAdjustment(service, tier) > 0 && (
                          <div>
                            <dt>{t("packages.minimumAdjustment")}</dt>
                            <dd>
                              {money(packageMinimumAdjustment(service, tier))}
                            </dd>
                          </div>
                        )}
                      </dl>
                    )}
                    {selected === "webApp" && (
                      <p className={styles.quoteNote}>
                        {t("explorer.webAppPricingNote")}
                      </p>
                    )}
                    <p className={styles.quoteNote}>
                      {t(
                        service
                          ? service.id === "homepage"
                            ? "packages.homepageNote"
                            : "packages.draftNote"
                          : "explorer.customNote",
                      )}
                    </p>
                    <div className={styles.quoteAction}>
                      <ConsultationLink
                        href={`/${locale}/connect`}
                        label={t("packages.cta")}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
            <dl className={styles.notes}>
              {pricingNotes.map(({ id, icon: Icon }) => (
                <div key={id} className={styles.noteRow}>
                  <dt>
                    <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                    <span>{t(`packages.notes.${id}.title`)}</span>
                  </dt>
                  <dd>{t(`packages.notes.${id}.body`)}</dd>
                </div>
              ))}
            </dl>
            {/* <PricingExamples service={selected} /> */}
          </>
        )}
      </div>
    </section>
  );
}
