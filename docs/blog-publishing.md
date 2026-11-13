# Code-managed blog

## Checkpoint 1: article foundation

The blog uses a shared server-rendered header and individually authored React
article bodies. There is no CMS, database, live upload endpoint or browser editor.
Article changes become public only after a reviewed deployment.

- Local index: `http://localhost:3000/ko/blog`
- Local example: `http://localhost:3000/ko/blog/before-your-website-project`
- First real article draft: `http://localhost:3000/ko/blog/local-business-online-checklist`
- English index: `/en/blog`, reached through the existing language switch.
  Existing site routing resets direct English document visits to Korean. The
  English index labels its articles as Korean and links to Korean article URLs.
- The example is a **draft**. It is visible only with `NODE_ENV=development`, has
  no publication date, and has `noindex, nofollow` metadata. Draft and unknown
  article routes return 404 in production. An empty public index has `noindex`.
- The example currently sets `previewLayout: "wireframe"` for layout review:
  a gray illustration hero above placeholder title, metadata and body regions.
  Remove that property to preview its original custom article body. This option
  is available only to drafts; remove it before changing a post to published.
- The original example also has `previewOnly: true`: it remains available at its
  direct development URL but is omitted from listings. The real article draft
  now supplies the homepage and index preview. Remove `previewOnly` to list a
  reference draft; this flag is not permitted on published posts.

Checkpoint 2 adds the index grid, homepage section and navbar link. Canonical/
social metadata, structured data, sitemap/robots and the Search Console checklist
remain for checkpoint 3. Do not treat this foundation as SEO-complete or deploy
an article before that work is reviewed.

## Checkpoint 2: listing and homepage

- The blog index uses a sticky topic sidebar and a separate article gallery.
  Topics filter server-rendered articles using `?topic=business`, `web-app` or
  `ai`; the links also work without JavaScript. Empty topics show a short message.
  The visible UI omits counts, introductory copy and a duplicate gallery heading.
  Mobile places topics above the gallery.
  The gallery has two desktop columns, one at 768–1023px, two at 560–767px and
  one below 560px. Entries have a cover above category/date, title and summary,
  with no enclosing card border or shadow. Covers retain the standard 8px corners.
- The homepage section sits between Featured Work and FAQ, using the existing
  section spacing and container system. A tall title/navigation card sits on the
  left, with the newest two published posts stacked on the right. Each post has
  its category, title and author beside a cover area. Below 768px all cards stack
  vertically. Visual areas currently use neutral placeholders until assets exist.
- Both navbar variants include Blog, with the correct active state for the
  index and article routes. The homepage all-articles link opens the blog index.
- Homepage interactions remain in `HomeExperience`; the page composes the blog
  as a server-rendered slot. Article bodies remain separate from client code.
- Local development with no published posts shows the existing draft and gray,
  non-interactive layout cards (two index slots; two homepage article slots). These
  cards do not represent additional posts. Production never fills those slots.
- With no published posts, the production homepage section is omitted entirely;
  the navbar still opens an empty, noindex blog index. After publication, lists
  populate from the registry without editing the homepage. English UI labels
  the articles as Korean and links to their Korean URLs.

## Add an article

1. Create a server component under `src/content/blog/articles/`. The component
   renders the article **body only**; the route provides the shared header and
   `<article>`. Use real text in headings and paragraphs, not text inside images.
   Do not put `"use client"` on the article. Import small client components only
   where an interactive diagram or other widget actually needs them.
2. Register its explicit import in `src/content/blog/articles.ts`. The registry
   slug must match the import key. Missing files fail compilation; a missing
   loader renders a 404 rather than an empty article.
3. Add its metadata to `src/content/blog/posts.ts` with `status: "draft"`.
   The metadata file must never import a body component. This separation keeps
   custom article code out of homepage/card client bundles.

For a custom illustration below the article header, add a server component to
the optional `illustrationLoaders` registry in `src/content/blog/illustrations.ts`.
The same component supplies the article hero and homepage/index thumbnails.
Accept a `variant` of `article` or `thumbnail`; previews fit the card's dimensions
and use a static gradient, while the article keeps its shader. The cover in the
metadata is the fallback for posts without a custom illustration. Keep a raster
cover available separately when preparing social-sharing images.
The first article uses five icons: website, Google, Naver, Instagram and Naver Map.
Its small client shader uses the installed Paper mesh gradient, a capped render
resolution and visibility/reduced-motion handling. Local SVGs and the base CSS
gradient are present in the initial HTML and remain visible without WebGL or JS.
The Naver Map PNG is stored at `public/icons/integrations/naver-map.png`, sourced
from the official site's linked icon:
https://ssl.pstatic.net/static/maps/assets/icons/android-icon-512x512.png

```ts
{
  slug: "your-descriptive-url",
  locale: "ko",
  title: "실제 글 제목",
  summary: "이 글에서 독자가 얻을 수 있는 내용을 설명합니다.",
  category: "웹사이트 가이드",
  topic: "web-app", // business | web-app | ai; used by the index topic navigation.
  readingMinutes: 4, // Estimated reading time; review whenever the copy changes.
  author: defaultBlogAuthor,
  status: "draft",
  // Optional: put your own image in public/images/blog/ and supply its dimensions.
  // cover: { src: "/images/blog/your-cover.webp", alt: "이미지 내용 설명", width: 1600, height: 900 },
}
```

Use unique, stable lowercase URL slugs separated by hyphens. Do not use duplicate
slugs or built-in object keys. Published URLs should remain stable; arrange a
redirect before changing an existing published slug.

## Shared header, custom body

Article headers center the category chip and title without a visible summary.
Keep the summary in the registry for cards and SEO metadata. Below the illustration,
a 720px reading-width row places the author and white-on-black GRIDS mark on the
left and an estimated reading time on the right. Maintain `readingMinutes` with
the post's copy. Publication and optional update dates appear beneath that row
when present. Drafts do not display status labels or invented publication dates.

The following helpers are optional. Each article can also own its CSS module and
create a completely different body layout:

```tsx
import { BlogReading, BlogVisual, BlogCallout, BlogImage }
  from "@/components/blog/article-blocks";

export default function MyArticle() {
  return <>
    <BlogReading>
      <h2>첫 번째 소제목</h2>
      <p>독자가 자바스크립트 없이도 읽을 수 있는 실제 본문입니다.</p>
      <BlogCallout title="핵심 내용"><p>간단한 보충 설명입니다.</p></BlogCallout>
    </BlogReading>
    <BlogVisual size="headline">
      {/* Your own image, screenshot, chart or custom layout goes here. */}
    </BlogVisual>
  </>;
}
```

- `BlogReading`: owns responsive gutters and a 720px reading cap, with heading,
  paragraph, list and link styles.
- `BlogVisual`: owns gutters; `headline` caps at 960px, `standard` follows the
  responsive site cap, and `showcase` caps at 1440px.
- `BlogCallout`: inset note; place **inside** a reading/visual block.
- `BlogImage`: optimized image with explicit width, height, meaningful alt text
  and an optional caption; place inside a block. Override `sizes` when the image
  renders wider or narrower than the default 960px. Cover images are optional.
- Place reading/visual blocks as **siblings**, never inside another Container.
  Their parent supplies the gap. Outer cards/images use the global 8px radius.
- Use one page h1, then h2/h3 sections. Keep core content available without
  animations. Do not add body-level author/date headings that duplicate the header.

## Publish or update

After review and the completion of the SEO checkpoint:

1. Preview the draft locally on desktop and mobile. Confirm its text, links,
   headings, image rights/alt text and any factual or commercial claims.
2. Change `status` to `"published"` and add `publishedAt` using the **real**
   publication timestamp in ISO 8601 format, including the timezone. For example,
   use the actual date/time followed by `+09:00` for Korean local time. Do not
   copy an arbitrary date from the example or publish with a future timestamp.
3. For a meaningful later update, set `updatedAt` to that update's real timestamp.
   Keep the original `publishedAt`. Do not change dates just to appear recent.
4. Run the content checks, lint, TypeScript and production build. The production
   preview must expose published content and return 404 for remaining drafts.
5. Review, commit and deploy only when authorized. Publishing is not automatic
   when editing a file. The public listing and homepage use the published-only
   collection; discovery entries will use it after checkpoint 3 is complete.

Keep draft/example content unindexed and out of public feeds. Do not rely on a
hidden URL as access control. Never put secrets or private client information in
an article component or a repository asset, even in a draft.

## Checkpoint 1 verification — 2026-11-13

- Targeted ESLint, TypeScript and `git diff --check` passed.
- An isolated production build passed without changing the running development
  server. The existing site-wide `metadataBase` warning remains for checkpoint 3.
- Safari: checked 320, 390, 768, 1440 and 2560px widths, 200% text size,
  keyboard navigation, the English index and the full article without JavaScript.
  No horizontal overflow was observed; reading blocks remain capped at 720px.
- Production HTTP: the index renders its empty state in HTML and is `noindex`.
  The draft, unknown/inherited-key slugs, an untranslated draft URL and the draft
  with `?preview=true` returned 404 without the article title or body.
- The temporary production server was stopped. No push, deployment or public
  article publication was performed. Awaiting checkpoint 1 review.

## Checkpoint 2 verification — 2026-11-13

- Targeted ESLint, TypeScript, `git diff --check` and an isolated production
  build passed. The existing metadataBase warning is reserved for checkpoint 3.
- Safari verified both locales, the responsive listing, homepage section order,
  navbar spacing at tablet/desktop sizes, the mobile menu, active states,
  keyboard article navigation and server-rendered homepage cards without JS.
- Normal-motion Safari verified navigation back to Home, keyboard-triggered
  card reveals and navigation from the homepage to the index.
- Production HTTP verified the absent homepage blog section/placeholders,
  present navbar link, empty/noindex index and draft article 404. The article
  body's unique text was absent from browser JavaScript bundles.
- No deployment, push or article publication. Awaiting checkpoint 2 review.

## First article draft — 2026-11-13

**손님이 늘지 않는 이유? 우리 가게 온라인 점검 체크리스트**

- Based on the owner's supplied copy. It preserves the six checks, offline/
  online sign analogy and consultation action. The illustration remains a gray
  placeholder above the shared header, following the approved wireframe.
- Clarifies that MSIT's 2025 survey was released in June 2026 and covers
  October–December 2025 usage among 2,500 adults aged 19–69. Search 98.7% and
  place/map 96.8% describe platform use, not pre-visit searches by all customers.
- Clarifies that BrightLocal's 54% is a selected follow-up action after positive
  reviews in a multiple-response question, not measured visits by Korean users.
  Retains the US-versus-Korea qualification alongside the references.
- Source verification: [MSIT release and original attachment](https://www.korea.kr/briefing/pressReleaseView.do?newsId=156765009),
  [KDI summary](https://eiec.kdi.re.kr/policy/materialView.do?num=282149&pg=1&pp=20&topic=L),
  [BrightLocal 2026 survey and methodology](https://www.brightlocal.com/research/local-consumer-review-survey/).
  The official MSIT ODT attachment was read to confirm age, sample and period.
- Basic listing-cost claims checked against [Naver help](https://help.naver.com/service/30026/contents/20366?lang=ko)
  and [Google help](https://support.google.com/business/answer/2911778?hl=ko).
- Six native checkboxes are usable without JavaScript. There is no application
  persistence, submission or new tracking for checklist answers. CTA uses
  `/ko/connect`; the references have working local citation anchors.
- Safari checked 320–2560px, 200% text, keyboard use and reading/checking without
  JavaScript. ESLint, TypeScript and an isolated production build passed.
- Production HTTP: the article, its `?preview=true` variation and the original
  wireframe return 404; the production index stays empty. No publication date
  has been fabricated and no push/deployment has occurred. SEO checkpoint 3 and
  the final illustration are still pending.

## Reading navigation and article refinements

- The checklist keeps its glass surface and six native controls, with no visible
  title or icon above them. References use the original plain numbered list.
  Shared article body h2 headings use weight 700 at 18–22px; h3 headings use
  weight 650 at 1rem. Body copy uses 16px, weight 500, a dark neutral color and
  1.75 line height; strong text uses weight 650. Related sentences belong in the same paragraph rather
  than isolated one-line blocks. Paragraph margins remain .875rem; heading-to-copy
  spacing is 1.25rem, separate reading groups use 40–48px, and illustrations,
  charts and checklist panels use 2rem around them. Use concise headings without
  forced breaks.
- The first article opts into `ArticleTimeline` with stable section IDs and short
  labels. It includes each major heading plus the checklist region. Other custom
  articles can import it and provide their own `sections: { id, label }[]`.
- At 1280px and wider the timeline occupies the right margin, independently of
  the centered 720px reading column. It is sticky only within the article body.
  The rail sits 3–5rem beyond the reading column, with no visible heading.
  Tablets (768–1279px) get an inline two-column contents list. Below 768px the
  entire navigation is hidden and scroll-progress updates pause; resizing back
  to a larger viewport restores tracking at the current section.
- Each section has its own lightly tinted rectangle, separated by a narrow 4px
  gap. The filled colors form one continuous gradient from `--brand-sky` at the
  top to hot pink at the bottom, rather than restarting in each segment. A clip
  reveals the fixed gradient without compressing it. Completed sections remain
  filled; the current rectangle fills from top to bottom
  between its heading and the next one. The last rectangle tracks through the
  end of the article body. There is no shared outer track. A single cumulative
  spring preserves continuity when scrolling reverses; reduced motion settles
  immediately. A passive, frame-coalesced scroll listener updates the active
  link and progress, while resize observation recalculates section positions.
  Cleanup removes listeners and stops the spring.
- The article category is a compact, ice-blue chip using the shared 8px radius.
- Section links update the fragment, focus the target and scroll smoothly, with
  immediate navigation for reduced motion. Without JavaScript the native anchor
  links and checklist remain usable; only scroll tracking requires JavaScript.
- Safari verified all six active states, progress in both directions, right/inline
  layouts at 320–2560px, keyboard/hash navigation, 200% text and no-JS content.
  The prior moving marker passed normal-motion forward/reverse checks. The
  segmented indicator passed per-section partial/completed/upcoming checks,
  reverse scrolling, narrow gaps, keyboard links, responsive layout, ESLint and
  TypeScript. The prior article layout passed an isolated production build.
