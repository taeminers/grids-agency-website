import "server-only";

import type { ComponentType } from "react";

// Explicit imports keep article code on the server and make missing files a
// build error. Add one entry here when registering a new custom article.
const articleLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  "local-business-online-checklist": () => import("./articles/local-business-online-checklist"),
  "before-your-website-project": () => import("./articles/before-your-website-project"),
};

export async function getBlogArticle(slug: string) {
  // Own-key check also rejects inherited keys such as "constructor".
  if (!Object.hasOwn(articleLoaders, slug)) return undefined;
  return (await articleLoaders[slug]()).default;
}
