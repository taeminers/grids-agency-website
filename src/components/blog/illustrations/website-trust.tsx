import "server-only";

import type { BlogIllustrationProps } from "@/content/blog/illustrations";
import BrandLogo from "@/components/brand-logo";
import IllustrationGradient from "./illustration-gradient";
import styles from "./website-trust.module.css";

export default function WebsiteTrustIllustration({ variant = "article" }: BlogIllustrationProps) {
  return <figure className={styles.illustration} role="img"
    aria-label="테라코타와 더스티 로즈, 아이보리가 부드럽게 어우러지는 입자 질감 배경과 중앙의 흰색 GRIDS 로고."
    data-blog-illustration="website-trust" data-variant={variant}>
    {variant === "article" && <IllustrationGradient className={styles.shader} treatment="soft-grain" />}
    <BrandLogo className={styles.logo} />
  </figure>;
}
