import { getLocale, getTranslations } from "next-intl/server";
import Container from "@/components/container";
import Link from "@/components/navigation/page-navigation";
import styles from "./not-found-page.module.css";

/** Shared by root and localized 404 boundaries; copy stays in the initial HTML. */
export default async function NotFoundPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "NotFound" });
  return <main className={styles.page}>
    <Container innerClassName={styles.content}>
      <p className={styles.code} aria-hidden="true">404</p>
      <h1><span className="sr-only">404. </span>{t("subtitle")}<span>{t("subtitleSecondary")}</span></h1>
      <Link className={styles.action} href={`/${locale}`}>{t("cta")}</Link>
    </Container>
  </main>;
}
