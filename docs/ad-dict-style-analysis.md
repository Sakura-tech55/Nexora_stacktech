# ad-dict.co.jp — Technical Style Analysis

Analyzed 2026-10-08 from the live site (HTML + `style.css` + `fonts.css` + deobfuscated `app.bundle.min.js`).

---

## 1. Platform & Build

| Layer | What they use |
|---|---|
| CMS | WordPress, custom theme `addict` (based on HTML5 Blank) |
| JS | **One webpack bundle** (`app.bundle.min.js`, ~416 KB) — all libraries + custom modules |
| CSS | `style.css` (~178 KB, compiled from SCSS, BEM-ish) + `fonts.css` (~280 KB, subset `@font-face` rules) |
| Forms | Contact Form 7 |
| Analytics | GA4 via gtag |

### Libraries inside the bundle (no GSAP!)
- **Lenis** — smooth scrolling (desktop only)
- **Swup** + plugins: **Parallel** (old & new page in DOM simultaneously), **JS** (custom WAAPI transition), **Head**, **Preload** — SPA-style page transitions
- **BudouX** (Google) — smart Japanese line-breaking (`<wbr>` insertion)
- Everything else is **hand-written vanilla JS**: `requestAnimationFrame` scroll handlers, `IntersectionObserver`, and the **Web Animations API** (`element.animate()`). No GSAP, no ScrollTrigger, no Three.js.

---

## 2. CSS Architecture

### Naming convention
- Section blocks lowercase: `.hero`, `.story`, `.solution`, `.service`, `.news`, `.footer`
- Elements camelCase after `__`: `.story__sticky`, `.footer__ctaColBodyTxt` (nesting flattened into the name)
- Modifiers: `--`: `.hero__reflect--top`, `.logos__row--b`
- **Reusable components are Capitalized**: `.Btn`, `.Icon`, `.Heading`, `.News`, `.Bg`, `.Overlay`, `.Form`, `.Pagination`
- State classes: `.is-active`, `.is-inview`, `.is-show`, `.is-onLight`, `.splash-is-on`, `.splashed`
- JS hooks are `data-*` attributes (`data-peel`, `data-orbit`, `data-story-col="0"`, `data-pulse-cardio-inview`…), never styling classes. IDs prefixed `js-` (`#js-header-drawer`).

### Fluid vw-based sizing (the key layout decision)
Almost **every dimension is in vw**, computed from two design comps:
- Desktop comp = **1728 px** wide → `16px ⇒ 0.9259259259vw` (16/1728×100)
- Mobile comp = **393 px** wide → `14px ⇒ 3.5623409669vw` (14/393×100)

Only **two breakpoints**: `@media (max-width:1024px)` (mobile/tablet, ~580 rules) and `(min-width:1025px)`. The site scales perfectly proportionally at any width — this is why it feels like a poster. The splash counter uses `clamp()` as the exception.

### Typography
| Font | Role |
|---|---|
| **Cormorant Infant** (self-hosted woff2, preloaded) | Large Latin serif display (counter, EN headings) |
| **AddictMincho** (custom/licensed JP mincho, heavily subset via `unicode-range`) | Japanese display serif |
| **Noto Sans JP** | Body text |
| **Bodoni Moda** | Small accents |

`font-feature-settings:"palt"` for JP proportional metrics; `fonts.css` is pure `@font-face` subsets; display fonts `rel=preload`-ed.

### Color / texture
- Dark base `#121212`, off-white `#f5f5f5`, accent red `#e81c3c`
- A fixed `.Bg` layer behind everything: **noise texture image at `opacity:.4`** + a "nami" (wave) background image — this grain-over-everything is a big part of the look.
- Easing signatures used everywhere:
  - `cubic-bezier(0.75, 0, 0.2, 1)` — the "house easing" (splash exit, page transitions, drawers)
  - `cubic-bezier(0.4, 0.4, 0, 1)` — hovers
  - `cubic-bezier(0.16, 1, 0.3, 1)` — ease-out-quint-ish for reveals
- Only 4 CSS `@keyframes` total (`logosScroll`, `logosScrollRev`, `fvScrollBeat`, `hamburgerBeat`) — everything else is WAAPI or rAF-driven inline styles.

---

## 3. Page Skeleton (home)

```
body.home
├─ .splash (loader: 3-digit odometer counter + %)      [data-splash]
├─ .splash__veil (black fade layer)                    [data-splash-veil]
└─ .wrapper
   ├─ .skipLink / .a11y-selection (custom focus ring)
   ├─ .Bg (fixed noise + wave texture)
   ├─ header.header (logo / nav / hamburger / drawer / .Overlay)
   ├─ main#main                       ← swup container
   │  ├─ .hero
   │  │  ├─ .hero__media: canvas.hero__reflect--top, video.hero__video(webm, data-src lazy),
   │  │  │                canvas.hero__band, canvas.hero__reflect--bottom
   │  │  ├─ .hero__blur (6 divs = progressive blur)
   │  │  ├─ section.fv (headline + news ticker + scroll indicator)
   │  │  └─ section.wwd [data-peel] ("what we do" intro)
   │  ├─ section.story    [data-story]        — pinned image-wall → logo zoom-through
   │  ├─ section.logos    [data-logo-light]   — 2 opposite CSS marquees
   │  ├─ section.solution [data-orbit][data-peel] — pinned flying-bars scene
   │  ├─ section.numbers  — stat list, pulse-cardio reveal
   │  ├─ section.service  [data-service-stack][data-peel] — pinned slide stack
   │  ├─ section.oneview  [data-peel] — auto image cross-fade (3s)
   │  └─ section.news
   └─ footer.footer (bg video, CTA cols, sitemap, [data-burst-inview] logo)
```

---

## 4. Animation Systems (in execution order)

### 4.1 Splash / loader (once per session)
- Guard: `sessionStorage("splashed")` + `prefers-reduced-motion` → skip entirely.
- Scroll locked by `preventDefault` on `wheel`/`touchmove`.
- **Odometer counter**: 3 digit columns; each is a `.splash__strip` filled with repeated `0–9` divs; JS sets `translateY(-N * 0.72em)` per digit. Progress 0→100 over **3000 ms** with ease-in-out-quad, hundreds/tens/units move at their own rates (true odometer behavior).
- At 100: number does a quick **blur pulse** (WAAPI: blur 0→4px→0, 320 ms), hero videos `play()`.
- **Exit (1500 ms, cubic-bezier(.75,0,.2,1))**, three simultaneous WAAPI animations:
  - splash: `translateY(0 → -100%)` + `blur(0→6px)` + opacity 1→.85
  - `.wrapper`: `translateY(8vh) scale(0.82) blur(12px) brightness(0.5)` → identity (transform-origin `50% 50vh`)
  - veil: opacity 0→.3→0
- Same choreography is reused for **page transitions** (see 4.9) — strong motif consistency.

### 4.2 Hero video + canvas reflections
- `<video>` has `data-src`; real src injected after `window.load` via `requestIdleCallback` (poster AVIF is `rel=preload fetchpriority=high`).
- On mobile layout (≤1024px) the video sits in a 16/9 band; **two `<canvas>` elements above and below draw the current video frame** (one vertically flipped via `ctx.setTransform(1,0,0,-1,0,h)`) with gradient `mask-image` fade-outs → a mirrored-reflection effect. Painted per frame via `requestVideoFrameCallback`, gated by an IntersectionObserver.
- **Progressive blur footer of the hero**: 6 stacked `div`s, each with a `backdrop-filter: blur(0.5 → 10px)` and a strip-shaped `mask: linear-gradient(...)` — blur strength ramps down the image. Pure CSS, very reusable trick.

### 4.3 "Peel" section entrances (`data-peel`)
Scroll-linked (rAF on scroll, no IO), progress = section top traveling from viewport bottom to 60% height, eased `1-(1-x)^3`:
`scale 0.94→1`, `blur 8→0px`, `brightness 0.75→1`, opacity ramp; `transform-origin: center top`; styles cleared when progress ≥ .999 (removes `will-change`).

### 4.4 Story section (the signature piece)
- Outer `section.story` is tall; `.story__sticky` is `position:sticky` (pin).
- Image wall: **4 columns desktop / 3 mobile** (rebuilt on resize from a collected src list), each column's content **duplicated ×2** for seamless wrap.
- Scroll progress `p = -rect.top / (sectionH - stickyH)`:
  - Columns translate vertically `(direction[i] * 1500px * speed[i] * p) % colHalfHeight` — alternating directions, per-column speeds → parallax collage with infinite wrap.
  - A giant **SVG-masked "ADDICT" wordmark** (`#storyAddictLetters` inside `<mask>`, noise texture `<image>` showing through) scales from huge down (`translate(864 540) scale(...)`) — the camera appears to pull back out of the letters during the first 50% of scroll, then fades out.
  - At p≈0.68→1 a veil + centered `.Heading` + button fade in (`pointer-events` toggled by opacity).
- Perf: IO gates the whole handler (`v = isIntersecting`), rAF-throttled scroll, recalc on `resize` and `fonts.ready`.

### 4.5 Logos marquee
Pure CSS: `.logos__track { width:max-content; animation: logosScroll 60s linear infinite }`, second row `reverse`. Items duplicated in markup for the loop.

### 4.6 Solution / "orbit" section (`data-orbit`)
Pinned (sticky) scroll-scrubbed scene, all math hand-rolled in JS:
- Two elongated bar elements (`.solution__deco span`) fly along **lerped diagonal paths with a sine arc** (`y -= 0.22*viewportH * sin(π·t)`), rotating up to ±180°, blurring in/out at the edges.
- **Collision detection**: when the two bars come within `0.6 × barWidth` of each other → `.is-touching` class (visual flare).
- Two text cards (`data-orbit-text`) fade in/out in fixed progress windows (e.g. 0.18–0.52 and 0.46–0.92).
- Background images driven by CSS custom properties set from JS: `--bg-y` (+100%→-100% slide) and `--bg-opacity`.
- Entirely separate choreography for mobile (`data-orbit-sp` stage, images sliding vertically instead).
- Reduced-motion: static final poses set once.

### 4.7 Text reveal — "pulse cardio" (`data-pulse-cardio-inview`)
The heading/text entrance used all over the site. Children (`data-pulse-cardio-child`) are pre-set to `opacity:.5; filter:blur(10px)`, then on IO entry (`threshold:.2`, `rootMargin:0 0 -10%`) each child plays a WAAPI keyframe track (**2260 ms**, 150 ms stagger):
```
blur(10)/op .5 → sharp at 8% → tiny blur(2px) dip at 11.5% → sharp
```
i.e. a quick snap-into-focus with a "heartbeat" after-pulse. Headings at page load wait for `document.fonts.ready`.

### 4.8 Other micro-systems
- `data-inview` → adds `.is-inview` (CSS handles e.g. grayscale→color on images).
- **Burst** (`data-burst-inview`, footer logo): WAAPI `opacity 0 / blur 10 / scale .98 → scale 1.01 overshoot → 1`, 900 ms.
- **Service stack** (`data-service-stack`): pinned section; scroll drives a horizontal slide track with "hold" segments per slide; active slide's `data-name/catch/desc/url` swapped into the info panel with a fade class (`service__fade`). rAF + IO gated.
- **Oneview**: 3 tiles, each with 2 stacked layers; every 3 s the next image (list in `data-images` JSON) is preloaded into the hidden layer, then `.is-show` toggles → cross-fade rotator.
- **Numbers**: pulse-cardio on the stat items (count-up is not JS — the numbers are static).
- **Header logo contrast swap**: IO whose rootMargin is collapsed to the logo's exact y-line; when any `[data-logo-light]` section crosses it → `.is-onLight` on the logo (desktop only).
- **Icon component**: the red arrow is pure CSS — a rotated square + two borders; hover slides it via a **registered custom property** `@property --icon-x { syntax:"<length>" }` so the variable itself transitions. Typed variants: `.type-newtab`, `.type-under`, `.type-togle`.
- Buttons: `overflow:clip` container, bg/color swap `0.4s cubic-bezier(.4,.4,0,1)`.
- Accordions: full ARIA controller class (role, aria-expanded, `inert`, measured `scrollHeight` height animation, hover-to-open variant, enabled/disabled by breakpoint `acc-sp-only`).

### 4.9 Page transitions (Swup)
- Swup **Parallel plugin** keeps outgoing `main.is-previous-container` and incoming `main` in the DOM together.
- Custom JS-plugin animation (1500 ms, `cubic-bezier(.75,0,.2,1)`), mirror of the splash exit:
  - old main: `translateY(-100%)` + blur(6px) + opacity .85, with scroll offset compensated via `top:-scrollY`
  - new main: `translateY(8%) scale(.82) blur(12px) brightness(.5)` → identity, plus an additive scale "bounce" (1→.96→.98→1, `composite:"add"`)
  - a generated `.pageTransition__veil` div pulses opacity 0→.4→0
  - the footer is temporarily `position:fixed` and translated up alongside
- `/contact`, `/form`, `/privacy-policy` are excluded (full page load, `data-no-swup`).
- After each swap, all section modules re-mount against the new `main` (the code keeps an array of mount functions returning cleanup functions — a tiny lifecycle framework).

### 4.10 Smooth scroll
`new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false })` — **desktop only** (skipped when ≤1024 px or reduced-motion). Own rAF loop. Anchor clicks intercepted → `lenis.scrollTo(target)`. Drawer uses `data-lenis-prevent`.

---

## 5. Performance & Accessibility patterns worth copying

- Every scroll handler: `{ passive:true }` + rAF throttle + `AbortController` cleanup + IO gating when offscreen.
- `will-change` set just-in-time and **removed** when animation settles.
- Video & footer video lazy via `data-src` + `requestIdleCallback`; AVIF poster preloaded; fonts preloaded; `fonts.css` loaded with `media="print" onload="this.media='all'"` trick (+ noscript fallback).
- **Every module has a `prefers-reduced-motion` branch** (static end-state).
- Skip link, custom roving focus ring (`.a11y-selection`), ARIA accordions, `inert`, semantic sections.
- BudouX + `wbr` + `word-break:keep-all` for natural Japanese line breaks.
- Session-gated splash so repeat navigation isn't punished.

---

## 6. Rebuild recipe for the portfolio

Minimum stack (no WordPress needed):
1. **Vite + vanilla TS + SCSS**, one bundle, same two-breakpoint vw system (pick your own comp widths and generate vw values via an SCSS function: `math.div(px, 1728) * 100vw`).
2. **Lenis** (desktop only) + a tiny module-mount lifecycle (array of `(root) => cleanup` functions).
3. **Swup + @swup/parallel-plugin + @swup/js-plugin + @swup/preload-plugin + @swup/head-plugin** for the page transitions — or skip SPA transitions entirely for a single-page portfolio and reuse the splash-exit choreography only.
4. Reimplement in order of impact-per-effort:
   - pulse-cardio text reveal (WAAPI + IO) — cheap, used everywhere
   - peel section entrance (rAF scroll) — cheap
   - splash odometer + exit — medium
   - progressive-blur hero + noise overlay — cheap (pure CSS)
   - logos marquee — trivial
   - story pinned image wall + mask zoom — the big one; `position:sticky` + rAF progress math
   - orbit scene — only if you want a hero set piece; the math is self-contained
5. Easings to keep: `cubic-bezier(.75,0,.2,1)` (transitions), `cubic-bezier(.4,.4,0,1)` (hover), `cubic-bezier(.16,1,.3,1)` (reveals). Durations: 1500 ms (page-level), 2260 ms (text), 400 ms (hover).

### ⚠️ What NOT to copy as-is
Copying the compiled CSS/JS, their custom **AddictMincho** font files, noise/wave textures, the ADDICT wordmark SVG, photos or copy would be redistributing ADDICT Inc.'s copyrighted/licensed assets. Rebuild the *techniques* above with your own markup, fonts (e.g. Shippori Mincho / Zen Old Mincho as free JP-mincho stand-ins for AddictMincho, Cormorant Infant itself is OFL and fine), your own textures and imagery.
