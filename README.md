# Grids Agency Website

A cinematic, high-performance web experience for Grids Agency, built with Next.js, Three.js, and advanced GSAP animations.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com), [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **3D Engine**: [Three.js](https://threejs.org), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [React Three Drei](https://github.com/pmndrs/drei)
- **Animations**: [GSAP](https://gsap.com), [Framer Motion](https://www.framer.com/motion)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app)
- **Primitives**: [Radix UI](https://www.radix-ui.com)

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app/`: Modern Next.js App Router pages and layouts.
- `src/components/`: Modular UI components, organized by feature.
- `messages/`: Localization files for multi-language support.
- `public/`: Static assets, including shaders and 3D models.

## Key Features

- **Cinematic UI**: Immersive visual storytelling through advanced GSAP scroll sequences.
- **3D Visualizations**: Integrated React Three Fiber scenes for interactive 3D elements.
- **Interactive Shaders**: Performance-tuned WebGL shaders for ambient movement and background effects.
- **Multilingual Support**: Scalable i18n architecture using `next-intl`.
- **Responsive Systems**: Cross-device optimization ensuring fluid motion across breakpoints.

## Updating pricing

Edit the amounts in [`quotation-rules.md`](src/components/knowledge/quotation-rules.md), then run:

```bash
npm run pricing:sync
```

This generates `src/components/pricing/quotation-rates.generated.json`, which supplies the rates for both quotation tables and package cards in Korean and English. Package totals include the documented base rate, each add-on quantity, and the applicable minimum engagement fee. If a minimum increases a total, the card's price breakdown shows that adjustment.

The sync also runs automatically before `npm run dev` and `npm run build`. If the dev server is already running, run `npm run pricing:sync` after editing the document; Next.js will pick up the generated file change. Commit both the document and generated JSON together.

```bash
npm run pricing:check  # Read-only: fail if generated rates are stale or the document is invalid
npm run pricing:test   # Parser, synchronization, and package-calculation tests
```

Keep the existing headings, labels, and price notation (`원`, `+`, `~`, and units), using positive whole-won amounts with optional thousands separators. Missing, duplicate, malformed, or unmapped prices stop the sync without replacing the previous generated file. The VAT example must satisfy supply amount + VAT = total.

This synchronizes numeric rates, not service descriptions or package scopes. Adding/renaming services, changing a rate from paid to included/custom, or changing included page counts requires updating the mappings in `scripts/sync-pricing.mjs` and the reviewed bilingual copy/scopes in `src/components/pricing/pricing-data.ts`. Do not edit the generated JSON directly.

## Deployment

The project is optimized for production builds.

```bash
npm run build
npm run start
```

For deployment instructions, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
