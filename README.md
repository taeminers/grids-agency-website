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

## Deployment

The project is optimized for production builds.

```bash
npm run build
npm run start
```

For deployment instructions, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

