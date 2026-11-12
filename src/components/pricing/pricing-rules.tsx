"use client";

import { useLocale, useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { rateSections, type Copy, type Rate } from "./pricing-data";
import RulesNavigation from "./rules-navigation";
import rulesGrid from "./rules-grid.module.css";

export default function PricingRules() {
  const t = useTranslations("Pricing");
  const locale = useLocale();
  const language = locale === "ko" ? "ko" : "en";
  const copy = (value: Copy) => value[language];
  const money = (amount: number) => new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
    style: "currency", currency: "KRW", maximumFractionDigits: 0,
  }).format(amount);
  const price = (rate: Rate) => {
    if (rate.amount === undefined) return t(`rate.${rate.mode}`);
    return `${money(rate.amount)}${rate.mode === "from" ? t("rate.from") : ""}${rate.unit ? ` / ${copy(rate.unit)}` : ""}`;
  };

  return (
    <section aria-labelledby="pricing-rules-title">
      <div className={rulesGrid.heading}>
        <h2 id="pricing-rules-title">{t("tabs.rules")}<span>{t("rules.headline")}</span></h2>
      </div>
      <div className={rulesGrid.grid}>
        <RulesNavigation label={t("rules.contents")} items={[
          { id: "pricing-calculation", label: t("rules.calculation") },
          ...rateSections.map(section => ({ id: `pricing-${section.id}`, label: copy(section.title) })),
          { id: "pricing-principles", label: t("rules.principles") },
        ]} />
        <div className={rulesGrid.sections}>
          <section id="pricing-calculation" className={`${rulesGrid.section} ${rulesGrid.calculation}`}>
            <h3>{t("rules.calculation")}</h3>
            <div className={rulesGrid.formula}>
              {(["base", "pages", "features", "languages", "design", "work"] as const).map((part, index) => (
                <span key={part} className={rulesGrid.formulaPart}>
                  {index > 0 && <Plus size={12} aria-hidden="true" />}
                  <span>{t(`rules.formula.${part}`)}</span>
                </span>
              ))}
            </div>
            <p className={rulesGrid.note}>{t("rules.calculationNote")}</p>
          </section>
          {rateSections.map(section => (
            <section key={section.id} id={`pricing-${section.id}`} className={rulesGrid.section}>
              <h3>{copy(section.title)}</h3>
              {section.note && <p className={rulesGrid.note}>{copy(section.note)}</p>}
              <table className={rulesGrid.table}>
                <caption className="sr-only">{copy(section.title)}</caption>
                <colgroup><col className={rulesGrid.itemColumn} /><col /></colgroup>
                <thead><tr>
                  <th scope="col">{t("rules.item")}</th>
                  <th scope="col">{t("rules.amount")}</th>
                </tr></thead>
                <tbody>{section.rows.map(rate => (
                  <tr key={rate.id}>
                    <th scope="row"><span className={rulesGrid.rateLabel}>{copy(rate.label)}</span>
                      {rate.detail && <p className={rulesGrid.rateDetail}>{copy(rate.detail)}</p>}
                    </th>
                    <td>{price(rate)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </section>
          ))}
          <section id="pricing-principles" className={rulesGrid.section}>
            <h3>{t("rules.principles")}</h3>
            <ul className={rulesGrid.principles}>
              {(["scope", "information", "custom", "adjustment"] as const).map(item => <li key={item}>{t(`rules.policy.${item}`)}</li>)}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
