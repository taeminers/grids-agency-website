import "server-only";

import Image from "next/image";
import type { BlogPost } from "@/content/blog/posts";
import { getBlogIllustration } from "@/content/blog/illustrations";

/** The same custom illustration supplies the article hero and its card previews. */
export default async function BlogPostCover({ post, sizes }: { post: BlogPost; sizes: string }) {
  const Illustration = await getBlogIllustration(post.slug);
  if (Illustration) return <Illustration variant="thumbnail" />;
  if (post.cover) return <Image src={post.cover.src} alt={post.cover.alt} fill sizes={sizes} />;
  return null;
}
