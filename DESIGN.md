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

## Homepage spacing

Homepage content sections share tokens in `src/components/home-spacing.module.css`:

- `--home-section-gap: clamp(4rem, 8vw, 8rem)` separates content sections.
- `--home-heading-gap: clamp(2rem, 4vw, 3.5rem)` separates a section heading from its content.
- At desktop widths (1024px and above), Featured Work and FAQ use a larger incoming gap of `clamp(8rem, 12vw, 12rem)`. Their mobile spacing stays on the shared base scale.
- The incoming section owns the top gap. Do not add bottom padding to the preceding section, which doubles the space.
- The full-height hero, pinned introduction, and footer retain their viewport-based layouts and animation distances.
- When the FAQ heading stacks above its description, both align left.
