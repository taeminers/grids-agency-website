# Repository guidance

## Design authority

Use [apple-design](.agents/skills/apple-design/SKILL.md) as the sole skill for the homepage overhaul. Read it before design or implementation work; this file summarizes its application to GRIDS and does not replace it. Do not introduce other design skills unless the user changes this direction. Explicit user instructions take precedence.

For the navbar glass treatment, the user additionally requested [swiftui-liquid-glass](.agents/skills/swiftui-liquid-glass/SKILL.md). Apply its material, grouping, interaction, and fallback guidance as a web adaptation; its native SwiftUI APIs do not run in this Next.js project. Do not describe the web approximation as Apple's native renderer.

Apply its principles of purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, and delight. Translate those principles into a distinct GRIDS website with clear content and natural interactions.

## Current scope and workflow

- The homepage is being completely overhauled, one section at a time. The first focus is the hero.
- Finish and present the current section for review before moving to another section. Continue routine implementation and verification within the requested scope without asking for permission at each step.
- Treat the existing design as revisable. Make deliberate changes that serve the agreed direction; keep unrelated routes and sections intact.
- The pricing story between the hero and studio introduction has been removed from the homepage, including the “필요한 IT·AI 기술과 인재를, 합리적인 비용으로.” panel. Keep it removed unless requested otherwise.
- Build a working local version so layout, motion, and interaction can be evaluated together. Refine it from feedback before expanding the overhaul.

## Visual direction

- Make the purpose and next action immediately understandable. The hero should explain what GRIDS offers with a clear headline, concise supporting copy, and an obvious primary action.
- Aim for a calm, confident presentation through deliberate whitespace, alignment, typography, and contrast. Every element must have a clear role.
- Establish hierarchy through size, weight, line height, spacing, and grouping together. Avoid adding ornament to compensate for weak content or composition.
- Use size-specific tracking: carefully tightened display headings and comfortable body text. Check Korean line breaks and word wrapping independently from English.
- Use responsive type and spacing that accommodate text enlargement. Favor system fonts unless the brand or language needs justify a custom face.
- Use translucency and depth to clarify functional layers, such as floating navigation or sheets. Maintain legibility, avoid stacking light translucent surfaces, and provide solid fallbacks.
- Use consistent colors and shared tokens, with intentional light and dark treatments. Keep global token changes scoped because they affect other routes.

## Motion and interaction

- Give immediate press feedback on pointer-down; activate the action through the appropriate semantic click or keyboard behavior. Keep controls usable throughout transitions.
- Animate from the current visible state. Interactions must remain interruptible and reversible without jumps or waiting for an animation to finish.
- Prefer springs for direct manipulation and interactive movement. Start with no overshoot; add restrained bounce only when a gesture supplies momentum.
- For Motion or Framer Motion, a starting point is `type: "spring", bounce: 0, duration: 0.4`; tune by behavior. Physical damping ratios and library damping coefficients are different parameters.
- When implementing dragging, track the pointer continuously, preserve the grab offset, use pointer capture, and carry release velocity into the settling motion. Use momentum to choose the destination and progressive resistance at boundaries.
- Anchor overlays and transitions to their source. Keep entry and exit paths spatially consistent.
- Prefer `transform` and `opacity` for animation. Keep rendering work off the interaction path and stop unnecessary animation when it is not visible.
- Motion should explain change or provide useful feedback. Avoid artificial delays, forced viewing sequences, full-viewport moving backgrounds, and decorative looping movement that competes with content.

## Accessibility and responsive behavior

- Preserve semantic headings, links, buttons, accessible names, visible focus states, and keyboard operation. Core content and actions must remain available without completing an animation.
- Design for touch and keyboard as well as hover. Keep targets comfortable and ensure navigation remains predictable.
- Respect `prefers-reduced-motion`: replace large movement, parallax, and elastic effects with static states or brief fades.
- Respect `prefers-reduced-transparency` and `prefers-contrast` when using translucent materials; use more opaque backgrounds and clear boundaries where needed.
- Check narrow screens, enlarged text, long translations, and both themes. Avoid clipped copy, horizontal overflow, and controls hidden behind floating navigation.

## Repository conventions

- This project uses Next.js App Router, React, TypeScript, Tailwind CSS, and `next-intl`.
- Homepage composition lives in `src/app/[locale]/page.tsx`; its sections live in `src/components/`.
- Localized copy lives in `messages/ko.json` and `messages/en.json`. Keep equivalent changes aligned across locales and preserve locale-aware links.
- Shared styling and theme tokens live in `src/app/globals.css`.
- Prefer existing components and installed dependencies where they fit. Do not add a library merely for a small visual effect or put multiple animation systems in control of the same property.
- Preserve relevant analytics events and functional destinations when redesigning controls. Respect existing uncommitted work.

## Verification and handoff

- For code changes, run ESLint on changed files, `npx tsc --noEmit --incremental false` when types or component composition change, and `git diff --check`. Use a production build when the change warrants it.
- `npm run dev` and `npm run build` run pricing synchronization first. Inspect any generated changes and keep the final diff relevant to the task.
- For visual changes, inspect the running page at desktop and mobile sizes. Exercise affected interactions, keyboard focus, and reduced-motion behavior; check both locales and themes when affected.
- A type check or build does not establish visual quality. Report code checks and browser verification separately, and state any verification that could not be completed.
- In the handoff, explain what changed, how it serves the design, and what was verified. Keep the next iteration focused on the current section until the user advances the scope.
