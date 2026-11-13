import "server-only";

import { blogPosts, getPublishedBlogPosts, type BlogPost } from "@/content/blog/posts";

/** Development is the only environment in which unpublished articles exist. */
export function getVisibleBlogPosts(): BlogPost[] {
  const published = getPublishedBlogPosts();
  if (process.env.NODE_ENV !== "development") return published;
  return [...blogPosts.filter(post => post.status === "draft" && !post.previewOnly), ...published];
}

export function getVisibleBlogPost(slug: string): BlogPost | undefined {
  const post = blogPosts.find(post => post.slug === slug);
  if (post?.status === "published" || process.env.NODE_ENV === "development") return post;
  return undefined;
}
