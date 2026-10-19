# Works Portfolio — Analysis & Capture Notes

Last re-analyzed 2026-10-19. Source: the owner's list of delivered client sites (77 after ADDICT was removed on 2026-10-19 at the owner's request). Each site was loaded in headless Chrome to detect its real tech stack and SEO setup, capture its first view (FV), and collect the title, meta description and headings used to write its description.

Canonical data: [`lib/works.json`](../lib/works.json) has `slug`, `name`, `url`, `category`, `tech[]`, `seo[]`, `desc.{ja,en}` (3 sentences each), plus optional capture hints (`wait`, `viewport`, `preStorage`).

## Inventory by category

| Key | JA / EN label | Count | Notes |
|---|---|---|---|
| `ec` | EC・ブランド / E-Commerce & Brands | 19 | 13 Shopify stores, 1 headless Shopify (De-glu), plus brand sites (Wacoal, CANMAKE, CHIFURE, Benza Block) and FANCL Online |
| `corporate` | コーポレート | 14 | incl. staffing companies (Woman Staff, Mirai Jinzai, Bruder), StarBoard, Smile Days |
| `driving` | 自動車学校 | 7 | |
| `lp` | LP | 6 | Tokyu Livable is captured at 390×844 (SP-only) |
| `recruit` | 採用サイト | 6 | |
| `medical` | 医療・福祉 | 6 | |
| `other` | その他 | 5 | eyewear (Enfant, Aigan), photo studios, Miss Galaxy |
| `realestate` | 不動産 | 4 | |
| `school` | スクール・教育 | 3 | Noda Kamada, Rivets Pop, Senri Kinran University |
| `health` | フィットネス | 3 | |
| `food` | フード | 2 | |
| `animal` | ペット | 2 | |

Categories corrected after re-analysis (2026-10-19):

| Site | Was | Now | Why |
|---|---|---|---|
| BONIQ | food | ec | It is a Shopify store |
| Senri Kinran University | other | school | University admissions site |
| StarBoard | school | corporate | Interactive-whiteboard maker, not a school |
| Smile Days | other | corporate | Music production company |
| Bruder | recruit | corporate | Staffing company's corporate site |
| FANCL | other | ec | FANCL Online store |

## Detected stack (77 sites)

- **Platforms:** WordPress 46, Shopify 13, headless Shopify + Next.js on Vercel 1 (De-glu), STUDIO (Nuxt/Vue) 1 (Smile Days), Vue.js used in 3.
- **JS libraries:** jQuery 64, Swiper 38, Slick 24, Splide 9, GSAP 6 (with ScrollTrigger on most), Bootstrap 6, Lenis 3, Tailwind CSS 1, plus Barba.js, Alpine.js, AOS and Fancybox where present.
- **SEO:** meta description 73, XML sitemap 71, OGP 69, Twitter Card 57, canonical 50, JSON-LD structured data 47, All in One SEO 9, hreflang 7.

Corrections to the original annotations: Smile Days is built with **STUDIO** (generator `Studio.Design`, rendered by Nuxt/Vue), not Next.js. wacoal.jp is a brand site, not a Shopify store. De-glu runs on Next.js (`x-powered-by: Next.js`) with Shopify as a headless backend.

## Pipeline

1. `node scripts/analyze-sites.mjs [--only slugs]` loads each site and writes `scripts/site-analysis.json`. It records window globals (jQuery, GSAP, Swiper, Next/Nuxt, Shopify, etc.), loaded script and style URLs, WordPress theme and plugins, SEO tags, JSON-LD types, `/sitemap.xml` reachability, and headings.
2. `python3 scripts/derive-stack.py [--digest]` turns the raw signals into the `tech` and `seo` badges in `lib/works.json`. `--digest` prints a per-site content summary to use when writing descriptions.
3. `node scripts/capture-fv.mjs [--only slugs]` captures FV screenshots at 1440×900 into `public/works/<category>/<slug>.jpg`, with per-site waits and video-frame forcing.

The descriptions in `desc` are written by hand from the digest, and re-running the scripts does not overwrite them.

## Known issues found during analysis

- **saiseikai.gr.jp has an expired SSL certificate** (`ERR_CERT_DATE_INVALID`). It was analyzed with certificate checks off (`IGNORE_CERT=1 NODE_TLS_REJECT_UNAUTHORIZED=0`). Worth telling the client.
- The womanstaff FV is a crossfading carousel, so the shot may catch a mid-fade frame.
- STUDIO, Shopify and Next.js sites don't expose a WordPress-style SEO plugin, so SEO there is detected from the tags alone.
