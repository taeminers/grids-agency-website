import "server-only";

import type { ComponentType } from "react";

export type BlogIllustrationProps = { variant?: "article" | "thumbnail" };

// Keep visuals independent of article bodies so listings never import a post.
const illustrationLoaders: Record<string, () => Promise<{ default: ComponentType<BlogIllustrationProps> }>> = {
  "local-business-online-checklist": () => import("@/components/blog/illustrations/local-business"),
};

export async function getBlogIllustration(slug: string) {
  if (!Object.hasOwn(illustrationLoaders, slug)) return undefined;
  return (await illustrationLoaders[slug]()).default;
}
