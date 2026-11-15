import "server-only";

import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import Container from "@/components/container";
import BrandLogo from "@/components/brand-logo";
import type { BlogPost } from "@/content/blog/posts";
import { BlogImage } from "./article-blocks";
import styles from "./blog.module.css";

export async function BlogArticleLayout({ post, children, illustration }: { post: BlogPost; children: ReactNode; illustration?: ReactNode }) {
  const t = await getTranslations({ locale: post.locale, namespace: "Blog" });
  return <main className={styles.page}>
    <article lang={post.locale} aria-labelledby="article-title">
      <Container size="reading">
        <header className={styles.articleHeader}>
          <p className={styles.category}>{post.category}</p>
          <h1 id="article-title">{post.title}</h1>
        </header>
      </Container>
      {(illustration || post.cover || post.status === "draft") && <Container className={styles.articleIllustration}>
        {illustration ?? (post.cover ? <BlogImage image={post.cover} priority sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1599px) 90vw, 1440px" />
          : <div className={styles.heroPlaceholder} role="img" aria-label={t("cards.illustration")}><span aria-hidden="true">{t("cards.illustration")}</span></div>)}
      </Container>}
      <Container size="reading" className={styles.articleMeta}>
        <div className={styles.byline}>
          <div className={styles.author}>
            <span className={styles.authorBadge} aria-hidden="true"><BrandLogo className={styles.authorMark} /></span>
            <span>{post.author.name}</span>
          </div>
          <p className={styles.readingTime}>{t("readingTime", { minutes: post.readingMinutes })}</p>
        </div>
      </Container>
      <div className={styles.articleBody} data-article-body>{children}</div>
    </article>
  </main>;
}
