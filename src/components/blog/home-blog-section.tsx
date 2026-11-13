import "server-only";

import { getTranslations } from "next-intl/server";
import Container from "@/components/container";
import BrandLogo from "@/components/brand-logo";
import ConsultationLink from "@/components/consultation-link";
import Link from "@/components/navigation/page-navigation";
import { getPublishedBlogPosts } from "@/content/blog/posts";
import { getVisibleBlogPosts } from "@/lib/blog";
import BlogPostCover from "./post-cover";
import spacing from "@/components/home-spacing.module.css";
import styles from "./home-blog-section.module.css";

export default async function HomeBlogSection({ locale }: { locale: string }) {
  const published = getPublishedBlogPosts();
  const localPreview = process.env.NODE_ENV === "development" && published.length === 0;
  const posts = (localPreview ? getVisibleBlogPosts() : published).slice(0, 2);
  if (!posts.length) return null;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return <section id="blog" aria-labelledby="home-blog-heading" className={spacing.section}>
    <Container innerClassName={styles.layout}>
      <header className={styles.intro} data-scroll-reveal="surface">
        <h2 id="home-blog-heading" className={styles.title}>{t("home.heading")}<span>{t("home.headingSecondary")}</span></h2>
        <div className={styles.introFooter}>
          {locale === "en" && <p className={styles.languageNote}>{t("index.koreanNote")}</p>}
          <ConsultationLink href={`/${locale}/blog`} label={t("home.allPosts")} className={styles.allPosts} />
        </div>
      </header>
      <ul className={styles.articles} data-blog-grid="home">
        {posts.map(post => <li key={post.slug} data-scroll-reveal="surface">
          <Link href={`/${post.locale}/blog/${post.slug}`} className={styles.article}>
            <div className={styles.copy}>
              <p className={styles.category} lang={post.locale}>{post.category}</p>
              <h3 lang={post.locale}>{post.title}</h3>
              <div className={styles.author}>
                <span className={styles.authorBadge} aria-hidden="true"><BrandLogo className={styles.authorMark} /></span>
                <span>{post.author.name}</span>
              </div>
            </div>
            <div className={styles.image}>
              <BlogPostCover post={post} sizes="(max-width: 767px) 35vw, (max-width: 1599px) 24vw, 340px" />
            </div>
          </Link>
        </li>)}
        {localPreview && posts.length < 2 && <li className={styles.placeholder} aria-hidden="true" data-scroll-reveal="surface">
          <div className={styles.article}>
            <div className={styles.copy}>
              <span className={styles.categoryLine} />
              <div className={styles.titleLines}><span /><span /></div>
              <div className={styles.author}><span className={styles.avatar} /><span className={styles.authorLine} /></div>
            </div>
            <div className={styles.image} />
          </div>
        </li>}
      </ul>
    </Container>
  </section>;
}
