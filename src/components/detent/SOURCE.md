# Detent Halo

Installed using `npx shadcn@latest add https://detentui.com/r/halo --yes`.

Source: https://detentui.com/r/halo (Detent, Halo bands).

Local adaptation: surface and line tokens are scoped as `--halo-surface` and `--halo-line` instead of importing Detent's global theme. The component's default outer radius follows the site's card token; the full-width archive hero overrides it to zero. Original bands, palette, and pointer response are retained. Reduced motion uses the site’s reactive preference hook so changes to the setting take effect immediately. The archive disables click-to-cycle palettes.
