# GRIDS design standards

These standards apply across the GRIDS website, including new pages and redesigns. Explicit user direction takes precedence.

## Card corners

**8px is the standard corner radius for outer cards and panels.** The Websites & Growth cards containing the Cobalt Louvre backgrounds are the visual reference.

The source of truth is `--site-card-radius: 8px` in `src/app/globals.css`.

- CSS modules: `border-radius: var(--site-card-radius)`.
- Tailwind: `rounded-[var(--site-card-radius)]`.
- Bottom sheets attached to the viewport edge: `rounded-t-[var(--site-card-radius)]`; leave bottom corners square.
- Use the same radius on desktop, tablet, and mobile. Do not increase it at larger breakpoints.
- Match clipping wrappers, borders, and animated border effects. Children should inherit the radius where they share the same edge.
- Libraries requiring a numeric radius, such as BorderBeam, must use `8` with a comment linking it to the token.

Applied examples: homepage Websites & Growth outer cards, Featured Work media and information cards, FAQ title card, archive gallery cards, archive disclosure card, and archive project sheet.

This is a card standard, not a universal radius reset. Preserve intentionally pill-shaped buttons and navigation, circular avatars, compact iOS-style notification banners (20px corners), device mockups, and the distinct UI inside fictional product previews. Small nested controls and thumbnails can retain their own proportionate geometry.

When adding or editing an outer card or panel on any route, use this token rather than choosing another literal radius or a generic `rounded-xl` / `rounded-2xl` utility. Verify the rendered corners and clipping at desktop and mobile sizes.

## Content containers

Use `Container` from `src/components/container.tsx` for page sections. It creates an outer `.site-gutter` wrapper and an inner `.site-container` wrapper. The **content cap excludes horizontal padding**: it is 1200px on ordinary screens and grows fluidly to 1440px on wide displays (`clamp(1200px, calc(100vw - 160px), 1440px)`).

| Viewport | Minimum gutter on each side | Section gap | Heading-to-content gap |
| --- | --- | --- | --- |
| Below 640px | 24px | 64px | 32px |
| 640–1023px | 32px | 80px | 40px |
| 1024–1439px | 32px | 96px | 48px |
| 1440px and above | 40px | 120px | 56px |

Source of truth: `--site-content-width`, `--site-gutter`, `--site-section-space`, and `--site-heading-space` in `src/app/globals.css`. Content stops growing at its responsive cap and is centered in the available viewport. Browser scrollbar space is excluded.

- Pass section positioning and vertical spacing through `className`; pass grids, flex layouts, and content styling through `innerClassName`.
- Use one gutter owner per section. Do not nest Containers or add horizontal padding to a Container's inner wrapper. Card interior padding is independent and remains appropriate.
- Standard sections, cards, and grids use the default size. `size="headline"` caps at 960px, `size="reading"` at 720px, and `size="showcase"` at 1440px. Use wider showcases only for an intentional visual composition.
- Full-bleed backgrounds, hero cubes, archive halo painting, and other decorative layers belong outside the content wrapper. Floating navigation keeps its compact island width but respects the shared minimum gutter.
- Product mockups retain their own internal layouts; their surrounding website sections use Container. The standalone `/dev/coin-preview` scene remains a full-viewport development canvas.
- CSS-only equivalents are `.site-gutter > .site-container`. Do not combine both classes on one element, because that subtracts gutters from the content cap.

## Section spacing

The incoming section owns the gap above it: use `.site-section` or `padding-block: var(--site-section-space) 0`. Do not also add bottom padding to the preceding standard section. Use `--site-heading-space` between section headings and content.

Homepage aliases in `home-spacing.module.css` build on these global tokens. The incoming gaps for Approach, Featured Work, and FAQ are twice the base section gap (128 / 160 / 192 / 240px across the four breakpoints). Offerings keeps the base gap at the top of the sheet. Heading-to-content spacing stays on the base heading scale. The intro retains its original centered, viewport-height stage and text-to-signature timing. After completion, the following sections form one continuous sheet that scrolls over it. This sheet has a subtle upper edge and 24px top corners as an intentional full-width surface exception; its inner cards still use 8px corners. Reduced motion uses normal document flow.

Keep intentional hero heights, navigation clearance, scroll-animation tracks, and the footer's viewport-based composition. These are layout behaviors, not extra section margins. Internal card spacing and typography remain local. When the FAQ heading stacks above its description, both align left.

## Spacing within sections

Home and Pricing share these internal spacing tokens. Keep them separate from the existing section-spacing contract above.

- `--site-heading-space`: heading to primary content (existing responsive 32–56px scale).
- `--site-heading-column-gap`: space between a heading and its adjacent description (1.5–3rem).
- `--site-card-gap`: sibling cards and carousel slides (1.5rem).
- `--site-stack-gap`: separate content groups, such as service tabs to their panel or pricing cards to scope notes (2–3rem).
- `--site-card-padding`: standard card interiors (1.25–2rem).
- `--site-copy-gap`: heading/body/action groups inside cards (1.5rem).
- `--site-detail-gap`: closely related details and list items (.75rem).

Use `rem`-based tokens for structural content spacing. `em` remains appropriate for text-relative inline logos and optical offsets. Preserve compact control geometry, accordion label alignment, product demo internals, hero clearance, and scroll-animation tracks; they do not need the same spacing as standalone cards. Do not increase section gaps to compensate for cramped card interiors.
