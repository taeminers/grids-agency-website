export type BlogImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type BlogAuthor = {
  name: string;
  type: "Organization" | "Person";
  url?: string;
};

type BlogPostInfo = {
  slug: string;
  locale: "ko";
  title: string;
  summary: string;
  category: string;
  topic: BlogTopic;
  /** Estimated reading time; review when the article's copy changes. */
  readingMinutes: number;
  author: BlogAuthor;
  cover?: BlogImage;
};

export const blogTopics = ["business", "web-app", "ai"] as const;
export type BlogTopic = (typeof blogTopics)[number];

export type BlogPost = BlogPostInfo &
  (
    | {
        status: "draft";
        previewLayout?: "wireframe";
        previewOnly?: true;
        publishedAt?: never;
        updatedAt?: never;
      }
    | { status: "published"; publishedAt: string; updatedAt?: string }
  );

export const defaultBlogAuthor: BlogAuthor = {
  name: "GRIDS AGENCY",
  type: "Organization",
};

// Metadata only: never import article components into this module.
// A draft has no publication date. Add the real date when publishing it.
export const blogPosts: readonly BlogPost[] = [
  {
    slug: "local-business-online-checklist",
    locale: "ko",
    title: "고객이 늘지 않는 이유? 고객의 눈으로 우리 업체를 확인해 보세요.",
    summary:
      "고객이 우리 업체를 발견하고, 비교하고, 선택하는 과정을 살펴봅니다. 여섯 가지 질문으로 우리 업체의 온라인 접점을 점검해 보세요.",
    category: "비즈니스 가이드",
    topic: "business",
    readingMinutes: 4,
    author: defaultBlogAuthor,
    status: "draft",
  },
  {
    slug: "before-your-website-project",
    locale: "ko",
    title: "웹사이트 제작, 견적 전에 정리할 세 가지",
    summary:
      "페이지 수보다 먼저 생각해야 할 것은 비즈니스의 목표입니다. 첫 상담을 더 구체적으로 만드는 세 가지 질문을 정리했습니다.",
    category: "웹사이트 가이드",
    topic: "web-app",
    readingMinutes: 3,
    author: defaultBlogAuthor,
    status: "draft",
    previewLayout: "wireframe",
    previewOnly: true,
  },
];

/** Use this collection for public listings, homepage cards and discovery feeds. */
export function getPublishedBlogPosts(): BlogPost[] {
  return blogPosts
    .filter((post) => post.status === "published")
    .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!));
}
