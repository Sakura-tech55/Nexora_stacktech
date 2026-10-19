# NEXORA — Portfolio

Portfolio site of a senior full-stack engineer (web, mobile & AI), built with **Next.js 14 (App Router) + TypeScript + SCSS + Tailwind CSS + Chakra UI**.

Covers: UI/UX design, web production (LP / corporate / EC), large-scale EC on AWS, business systems and web apps, iOS / Android apps, and generative-AI solutions — with 77 delivered works across 12 categories.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Features

- **JA / EN language toggle** — React context (`lib/i18n.tsx`), persisted to `localStorage`, default Japanese.
- **Splash loader** (Tailwind) — centered odometer 0→100 %, a blue progress band along the bottom whose glowing head travels left → right, then "NEXORA" flies toward the viewer letter by letter and the splash collapses to a blue center line as the first view expands. Session-gated, with an aria-live status (Chakra `VisuallyHidden`).
- **Styling stack** — SCSS design system + Tailwind CSS v3 (preflight off) + Chakra UI v3 (preflight off, dark theme tokens).
- **Smooth scroll** — Lenis (`lerp: 0.1`), desktop only, with anchor interception.
- **"Pulse cardio" text reveal** — blur-snap heading entrance with a heartbeat after-pulse (Web Animations API + IntersectionObserver, 150 ms stagger).
- **Peel section entrances** — scroll-linked scale/blur/brightness ramp (rAF, passive listeners).
- **Pinned works wall** — sticky section with 4 image columns drifting at different speeds/directions, veil + centered heading fade-in.
- **Progressive blur hero** — 6 stacked `backdrop-filter` strips with gradient masks.
- **Tech marquees** — two opposite-direction CSS marquees of the stack.
- **Burst logo** — overshoot pop-in on the footer wordmark.
- **Fluid vw design system** — all sizes derived from two comps (desktop 1728 px / mobile 393 px), single 1024 px breakpoint, noise texture overlay.
- `prefers-reduced-motion` fallbacks throughout.

Animation techniques are an original reimplementation inspired by the analysis in [`docs/ad-dict-style-analysis.md`](docs/ad-dict-style-analysis.md).

## Works data

- `lib/works.json` — 77 delivered client sites (name, URL, category, tech stack), 12 categories.
- `public/works/<category>/<slug>.jpg` — first-view screenshots of each site, captured with `scripts/capture-fv.mjs` (puppeteer-core + system Chrome). See [docs/works-portfolio-analysis.md](docs/works-portfolio-analysis.md).
- The Works section renders a filterable category grid (chips with counts) linking to the live sites, and the pinned wall uses a curated mix of the screenshots.

## Images

Hero background from [Unsplash](https://unsplash.com) (Unsplash License), under `public/images/hero/`.

## Structure

```
app/            layout, page, globals.scss (design system), tailwind.css
components/     Splash, EffectsManager, Header, Hero, Works, Sections
components/ui/  Chakra UI provider (system config, dark theme tokens)
lib/i18n.tsx    JA/EN dictionaries + context
public/images/  categorized stock photos
docs/           style analysis reference
```
