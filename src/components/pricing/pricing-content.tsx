"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Tabs } from "radix-ui";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { MetalButton } from "@/components/spectrumui/metal-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRate, getPackageBaseRate, packageAmount, packageMinimumAdjustment, packageServices, rateSections, type Copy, type Rate } from "./pricing-data";
import CustomBuilds from "./custom-builds";
import PackageCard from "./package-card";
import RulesNavigation from "./rules-navigation";
import rulesGrid from "./rules-grid.module.css";
import PricingHeader from "./pricing-header";

const tierNames = ["Basic", "Plus", "Pro"];

export default function PricingContent() {
  const t = useTranslations("Pricing");
  const locale = useLocale();
  const language = locale === "ko" ? "ko" : "en";
  const copy = (value: Copy) => value[language];
  const money = (amount: number) => new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
    style: "currency", currency: "KRW", maximumFractionDigits: 0,
  }).format(amount);
  const [serviceId, setServiceId] = useState(packageServices[0].id);
  const service = packageServices.find((item) => item.id === serviceId) ?? packageServices[0];
  const price = (rate: Rate) => {
    if (rate.amount === undefined) return t(`rate.${rate.mode}`);
    return `${money(rate.amount)}${rate.mode === "from" ? t("rate.from") : ""}${rate.unit ? ` / ${copy(rate.unit)}` : ""}`;
  };

  return (
    <main className="min-h-screen bg-background text-foreground [--pricing-gutter:1.25rem] sm:[--pricing-gutter:2rem] md:[--pricing-gutter:3rem] lg:[--pricing-gutter:4rem]">
      <PricingHeader />
      <div className="mx-auto max-w-[1920px] px-(--pricing-gutter) pt-2 pb-16 md:pt-4">

        <Tabs.Root defaultValue="packages">
          <Tabs.List aria-label={t("tabs.label")} className="mb-10 grid grid-cols-2 border-b border-foreground/20">
            {(["packages", "rules"] as const).map((tab) => (
              <Tabs.Trigger key={tab} value={tab} className="relative min-h-16 cursor-pointer px-3 py-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-tertiary data-[state=active]:bg-foreground/[0.04] data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-[-1px] data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground sm:text-base">
                {t(`tabs.${tab}`)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="packages" className="pt-2 outline-none sm:pt-4">
            <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center lg:gap-12">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{t("packages.title")}</h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground [word-break:keep-all]">{t("packages.description")}</p>
              </div>
              <div>
                <label htmlFor="pricing-service" className="mb-3 block text-sm font-medium">{t("packages.serviceLabel")}</label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger id="pricing-service" className="min-h-14 w-full cursor-pointer rounded-none border-foreground/20 bg-background px-4 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent data-pricing-service-select position="popper" className="rounded-none">
                    {packageServices.map((item) => <SelectItem key={item.id} value={item.id} className="min-h-10 cursor-pointer rounded-none">{copy(item.label ?? getRate(item.id).label)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-10 border-l-2 border-foreground/25 bg-foreground/[0.025] px-5 py-5 text-sm leading-7 text-muted-foreground sm:px-6">
              <p className="mb-2 font-medium text-foreground">{t("packages.draftLabel")}</p>
              <p className="max-w-5xl [word-break:keep-all]">{t(service.id === "homepage" ? "packages.homepageNote" : "packages.draftNote")}</p>
            </div>

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <h3 className="text-lg font-medium tracking-tight">{copy(service.label ?? getRate(service.id).label)}</h3>
              <p className="max-w-xl text-xs leading-6 text-muted-foreground">{copy(service.description)}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {service.tiers.map((tier, index) => (
                <PackageCard key={`${service.id}-${index}`} featured={index === 1}>
                  <div className="mb-6 flex items-center justify-between">
                    <h4 className="text-lg font-medium tracking-tight">{tier.title ? copy(tier.title) : tierNames[index]}</h4>
                    <span aria-hidden="true" className="absolute top-3 right-6 font-mono text-[10px] text-muted-foreground sm:right-8">0{index + 1}</span>
                  </div>
                  <p className="min-h-10 text-xs leading-5 text-muted-foreground">{copy(tier.summary)}</p>
                  <div className="mt-5 border-b border-foreground/10 pb-7">
                    <p className="mb-2 text-[10px] text-muted-foreground">{t(service.id === "homepage" ? "packages.packagePrice" : "packages.proposedPrice")}</p>
                    <p className="text-[clamp(28px,3vw,40px)] leading-none font-medium tracking-[-0.05em] tabular-nums">{money(packageAmount(service, tier))}</p>
                    <p className="mt-3 text-[11px] text-muted-foreground">{t("packages.priceUnit")}</p>
                  </div>
                  <ul className="my-7 space-y-3 text-xs leading-6">
                    {tier.scope.map((item) => <li key={item.en} className="flex items-start gap-2.5"><Check size={14} aria-hidden="true" className="mt-1 shrink-0 text-foreground/60" /><span>{copy(item)}</span></li>)}
                  </ul>
                  <div className="mt-auto">
                    <details className="mb-6 text-xs">
                      <summary className="cursor-pointer py-2 text-muted-foreground transition-colors hover:text-foreground">{t("packages.breakdown")}</summary>
                      <dl className="mt-2 space-y-2 border-l border-foreground/15 pl-3 text-[11px] leading-5 text-muted-foreground">
                        <div className="flex justify-between gap-3"><dt>{t("packages.base")}</dt><dd className="shrink-0 tabular-nums">{money(getPackageBaseRate(service, tier).amount!)}</dd></div>
                        {tier.extras.map((item) => <div key={item.id} className="flex justify-between gap-3"><dt>{copy(getRate(item.id).label)}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</dt><dd className="shrink-0 tabular-nums">{money(getRate(item.id).amount! * item.quantity)}</dd></div>)}
                        {packageMinimumAdjustment(service, tier) > 0 && <div className="flex justify-between gap-3"><dt>{t("packages.minimumAdjustment")}</dt><dd className="shrink-0 tabular-nums">{money(packageMinimumAdjustment(service, tier))}</dd></div>}
                      </dl>
                    </details>
                    <MetalButton asChild inverted wrapperClassName="w-full rounded-none" className="w-full gap-5 rounded-none text-xs">
                      <Link href={`/${locale}/connect`}>{t("packages.cta")}<ArrowUpRight size={14} aria-hidden="true" /></Link>
                    </MetalButton>
                  </div>
                </PackageCard>
              ))}
            </div>

            <div className="mt-8 grid gap-6 border-y border-foreground/10 py-6 text-xs leading-6 text-muted-foreground md:grid-cols-3">
              {(["scope", "costs", "translation"] as const).map((item) => <div key={item}><h3 className="mb-1 font-medium text-foreground">{t(`packages.notes.${item}.title`)}</h3><p>{t(`packages.notes.${item}.body`)}</p></div>)}
            </div>
            <CustomBuilds />
          </Tabs.Content>

          <Tabs.Content value="rules" className="outline-none">
            <div className="mb-9 max-w-2xl"><h2 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{t("rules.title")}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{t("rules.description")}</p></div>
            <div className={rulesGrid.grid}>
              <RulesNavigation label={t("rules.contents")} items={[
                { id: "pricing-calculation", label: t("rules.calculation") },
                ...rateSections.map((section) => ({ id: `pricing-${section.id}`, label: copy(section.title) })),
                { id: "pricing-principles", label: t("rules.principles") },
              ]} />
              <div className="min-w-0">
                <section id="pricing-calculation" className={`${rulesGrid.section} scroll-mt-36`}>
                  <h3 className="text-base font-medium">{t("rules.calculation")}</h3>
                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3 text-xs leading-6">
                    {(["base", "pages", "features", "languages", "design", "work"] as const).map((part, index) => <span key={part} className="inline-flex items-center gap-3">{index > 0 && <Plus size={12} aria-hidden="true" className="text-muted-foreground" />}<span>{t(`rules.formula.${part}`)}</span></span>)}
                  </div>
                  <p className="mt-5 border-t border-foreground/10 pt-4 text-xs leading-6 text-muted-foreground">{t("rules.calculationNote")}</p>
                </section>
                {rateSections.map((section) => (
                  <section key={section.id} id={`pricing-${section.id}`} className={`${rulesGrid.section} scroll-mt-36`}>
                    <h3 className="text-lg font-medium tracking-tight">{copy(section.title)}</h3>
                    {section.note && <p className="mt-2 text-xs leading-6 text-muted-foreground">{copy(section.note)}</p>}
                    <table className="mt-5 w-full table-fixed border-collapse text-left text-xs">
                      <caption className="sr-only">{copy(section.title)}</caption>
                      <colgroup><col className="w-[58%] sm:w-[68%]" /><col /></colgroup>
                      <thead><tr className="border-y border-foreground/20 bg-foreground/[0.025] text-[10px] text-muted-foreground"><th scope="col" className="px-3 py-3 font-medium sm:px-4">{t("rules.item")}</th><th scope="col" className="px-3 py-3 text-right font-medium sm:px-4">{t("rules.amount")}</th></tr></thead>
                      <tbody>{section.rows.map((rate) => <tr key={rate.id} className="border-b border-foreground/10 align-top"><th scope="row" className="px-3 py-4 font-normal leading-6 sm:px-4"><span className="font-medium">{copy(rate.label)}</span>{rate.detail && <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{copy(rate.detail)}</p>}</th><td className="px-3 py-4 text-right leading-6 tabular-nums sm:px-4">{price(rate)}</td></tr>)}</tbody>
                    </table>
                  </section>
                ))}
                <section id="pricing-principles" className={`${rulesGrid.section} scroll-mt-36`}>
                  <h3 className="text-lg font-medium">{t("rules.principles")}</h3>
                  <ul className="mt-4 space-y-3 text-xs leading-6 text-muted-foreground">{(["scope", "information", "custom", "adjustment"] as const).map((item) => <li key={item} className="flex gap-3"><span aria-hidden="true">—</span>{t(`rules.policy.${item}`)}</li>)}</ul>
                </section>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </main>
  );
}
