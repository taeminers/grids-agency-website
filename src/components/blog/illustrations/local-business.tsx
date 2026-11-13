import "server-only";

import Image from "next/image";
import { Globe2, Instagram } from "lucide-react";
import type { BlogIllustrationProps } from "@/content/blog/illustrations";
import IllustrationGradient from "./illustration-gradient";
import styles from "./local-business.module.css";

export default function LocalBusinessIllustration({ variant = "article" }: BlogIllustrationProps) {
  return <figure className={styles.illustration} role="img" data-blog-illustration="local-business" data-variant={variant}
    aria-label="웹사이트, Google, 네이버, Instagram과 네이버 지도. 고객이 우리 가게를 발견하는 다섯 가지 온라인 접점.">
    {variant === "article" && <IllustrationGradient className={styles.shader} />}
    <div className={styles.icons} aria-hidden="true">
      <div className={`${styles.tile} ${styles.website}`}><Globe2 strokeWidth={1.5} /></div>
      <div className={`${styles.tile} ${styles.google}`}><Image src="/images/organizations/google.svg" alt="" width={56} height={57} /></div>
      <div className={`${styles.tile} ${styles.naver}`}><Image src="/icons/integrations/naver.svg" alt="" width={56} height={56} /></div>
      <div className={`${styles.tile} ${styles.instagram}`}><span><Instagram strokeWidth={1.7} /></span></div>
      <div className={`${styles.tile} ${styles.map}`}><Image src="/icons/integrations/naver-map.png" alt="" width={64} height={64} /></div>
    </div>
  </figure>;
}
