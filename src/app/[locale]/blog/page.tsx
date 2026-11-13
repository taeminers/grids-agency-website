import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/container";
import Link from "@/components/navigation/page-navigation";
import { BlogPostGrid } from "@/components/blog/post-grid";
import { blogTopics, getPublishedBlogPosts } from "@/content/blog/posts";
import { getVisibleBlogPosts } from "@/lib/blog";
import styles from "@/components/blog/listing.module.css";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ topic?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog.index" });
  return {
    title: `${t("title")} — GRIDS AGENCY`,
    description: t("description"),
    robots: getPublishedBlogPosts().length ? undefined : { index: false, follow: false },
  };
}

export default async function BlogIndexPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const posts = getVisibleBlogPosts();
  const { topic: requestedTopic } = await searchParams;
  const topic = blogTopics.find(value => value === requestedTopic);
  const visiblePosts = topic ? posts.filter(post => post.topic === topic) : posts;
  const currentTopic = topic ? t(`topics.${topic}`) : t("topics.all");
  return <main className={styles.page}>
    <Container innerClassName={styles.layout}>
      <aside className={styles.sidebar}>
        <header className={styles.indexHeader}>
          <h1>{t("index.heading")}<span>{t("index.headingSecondary")}</span></h1>
        </header>
        <nav className={styles.topics} aria-label={t("topics.label")}>
          <Link href={`/${locale}/blog`} scroll={false} aria-current={!topic ? "page" : undefined}>
            <span>{t("topics.all")}</span>
          </Link>
          {blogTopics.map(value => <Link key={value} href={`/${locale}/blog?topic=${value}`} scroll={false} aria-current={topic === value ? "page" : undefined}>
            <span>{t(`topics.${value}`)}</span>
          </Link>)}
        </nav>
        {locale === "en" && <p className={styles.languageNote}>{t("index.koreanNote")}</p>}
      </aside>
      <section className={styles.gallery} aria-labelledby="blog-gallery-heading">
        <h2 id="blog-gallery-heading" className="sr-only">{currentTopic}</h2>
        {visiblePosts.length ? <BlogPostGrid posts={visiblePosts} locale={locale} previewSlots={!topic && posts.some(post => post.status === "draft") ? 2 : 0} /> : <div className={styles.empty}>
          <h3>{t(topic ? "index.emptyTopicTitle" : "index.emptyTitle")}</h3>
          <p>{t(topic ? "index.emptyTopicDescription" : "index.emptyDescription")}</p>
        </div>}
      </section>
    </Container>
  </main>;
}
