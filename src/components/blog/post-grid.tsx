import "server-only";

import Link from "@/components/navigation/page-navigation";
import type { BlogPost } from "@/content/blog/posts";
import BlogPostCover from "./post-cover";
import styles from "./post-grid.module.css";

export function BlogPostGrid({ posts, locale, previewSlots = 0 }: {
  posts: readonly BlogPost[];
  locale: string;
  previewSlots?: number;
}) {
  // Empty cards are design aids, never public posts or clickable destinations.
  const placeholders = process.env.NODE_ENV === "development" ? Math.max(0, previewSlots - posts.length) : 0;
  return <ul className={styles.grid} data-blog-grid="index">
    {posts.map(post => <li key={post.slug}>
      <Link href={`/${post.locale}/blog/${post.slug}`} className={styles.card}>
        <div className={styles.cover}>
          <BlogPostCover post={post} sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) calc(100vw - 320px), (max-width: 1599px) 34vw, 560px" />
        </div>
        <div className={styles.copy}>
          <div className={styles.details}>
            <span className={styles.category} lang={post.locale}>{post.category}</span>
            {post.status === "published" &&
            <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
                year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Seoul",
              }).format(new Date(post.publishedAt))}</time>}
          </div>
          <h3 lang={post.locale}>{post.title}</h3>
          <p lang={post.locale}>{post.summary}</p>
        </div>
      </Link>
    </li>)}
    {Array.from({ length: placeholders }, (_, index) => <li key={`placeholder-${index}`} className={styles.placeholder} aria-hidden="true">
      <div className={styles.cover} />
      <div className={styles.placeholderCopy}>
        <span className={styles.categoryLine} />
        <span className={styles.titleLine} /><span className={styles.titleLine} />
        <span className={styles.bodyLine} /><span className={styles.bodyLine} />
      </div>
    </li>)}
  </ul>;
}
