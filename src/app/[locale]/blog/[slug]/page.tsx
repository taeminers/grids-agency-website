import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogArticleLayout } from "@/components/blog/article-layout";
import { BlogArticleWireframe } from "@/components/blog/article-wireframe";
import { getBlogArticle } from "@/content/blog/articles";
import { getBlogIllustration } from "@/content/blog/illustrations";
import { getVisibleBlogPost } from "@/lib/blog";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getVisibleBlogPost(slug);
  if (!post) notFound();
  return {
    title: `${post.title} — GRIDS AGENCY`,
    description: post.summary,
    robots: post.status === "draft" ? { index: false, follow: false } : undefined,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getVisibleBlogPost(slug);
  if (!post) notFound();
  // Do not serve Korean article bodies at duplicate English URLs.
  if (locale !== post.locale) redirect(`/${post.locale}/blog/${post.slug}`);
  if (post.status === "draft" && post.previewLayout === "wireframe") {
    return <BlogArticleWireframe post={post} />;
  }
  const [Article, Illustration] = await Promise.all([getBlogArticle(slug), getBlogIllustration(slug)]);
  if (!Article) notFound();
  return <BlogArticleLayout post={post} illustration={Illustration ? <Illustration /> : undefined}><Article /></BlogArticleLayout>;
}
