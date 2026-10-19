"""Derive tech-stack and SEO badges for each work from scripts/site-analysis.json
and write them back into lib/works.json (fields: tech, seo).

Usage: python3 scripts/derive-stack.py [--digest]
  --digest  also print a compact content digest per site (title/description/headings)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKS = ROOT / "lib/works.json"
ANALYSIS = ROOT / "scripts/site-analysis.json"


def derive(a):
    g, s, ast = a["globals"], a["seo"], a["assets"]
    gen = (a.get("generator") or "").lower()
    plugins = set(a.get("wpPlugins") or [])
    tech = []

    headless = (g["next"] or a["nextAssets"]) and a["shopifyCdn"] and not g["shopify"]
    if headless:
        tech += ["Next.js", "React", "Shopify (Headless)", "Vercel"]
    elif g["shopify"] or a["shopifyCdn"]:
        tech += ["Shopify", "Liquid"]
    elif a["wp"]:
        tech += ["WordPress", "PHP"]
    if g["next"] or a["nextAssets"]:
        tech += ["Next.js", "React"]
    elif g["react"]:
        tech.append("React")
    if g["nuxt"] or a["nuxtAssets"]:
        tech += ["Nuxt", "Vue.js"]
    elif g["vue"] or ast["vue"]:
        tech.append("Vue.js")
    if a.get("studio"):
        tech.insert(0, "STUDIO")
    if a.get("wix"):
        tech.append("Wix")

    tech += ["HTML5", "CSS3", "JavaScript"]

    if g["jquery"] or ast["jquery"]:
        tech.append("jQuery")
    if g["gsap"] or ast["gsap"]:
        tech.append("GSAP")
        if g["scrollTrigger"]:
            tech.append("ScrollTrigger")
    if g["swiper"] or ast["swiper"]:
        tech.append("Swiper")
    if g["slick"] or ast["slick"]:
        tech.append("Slick")
    if g["splide"] or ast["splide"]:
        tech.append("Splide")
    if g["lenis"] or ast["lenis"]:
        tech.append("Lenis")
    if g["three"] or ast["three"]:
        tech.append("Three.js")
    if g["aos"] or ast["aos"]:
        tech.append("AOS")
    if g["barba"]:
        tech.append("Barba.js")
    if g["swup"]:
        tech.append("Swup")
    if g["locomotive"]:
        tech.append("Locomotive Scroll")
    if g["lottie"]:
        tech.append("Lottie")
    if g["alpine"]:
        tech.append("Alpine.js")
    if g["pixi"]:
        tech.append("PixiJS")
    if g["fancybox"]:
        tech.append("Fancybox")
    if ast["bootstrap"]:
        tech.append("Bootstrap")
    if ast["tailwind"]:
        tech.append("Tailwind CSS")
    if g["canvas"]:
        tech.append("Canvas")
    if ast["cf7"] or "contact-form-7" in plugins:
        tech.append("Contact Form 7")
    if g["typekit"]:
        tech.append("Web Fonts")
    if g["gtag"]:
        tech.append("Google Analytics 4")
    if g["gtm"]:
        tech.append("Google Tag Manager")

    seo = []
    if "all in one seo" in gen or "aioseo" in gen or ast["allInOneSeo"] or "all-in-one-seo-pack" in plugins:
        seo.append("All in One SEO")
    if "yoast" in gen or ast["yoast"] or "wordpress-seo" in plugins:
        seo.append("Yoast SEO")
    if s.get("description"):
        seo.append("Meta Description")
    if s.get("canonical"):
        seo.append("Canonical")
    if s.get("ogTitle"):
        seo.append("OGP")
    if s.get("twitter"):
        seo.append("Twitter Card")
    if s.get("jsonLd"):
        seo.append("JSON-LD")
    if s.get("sitemap"):
        seo.append("XML Sitemap")
    if s.get("hreflang"):
        seo.append("hreflang")
    if s.get("breadcrumb"):
        seo.append("Breadcrumbs")

    # dedupe, keep order
    seen = set()
    tech = [t for t in tech if not (t in seen or seen.add(t))]
    return tech, seo


def main():
    works = json.loads(WORKS.read_text())
    analysis = json.loads(ANALYSIS.read_text())
    digest = "--digest" in sys.argv

    for w in works:
        a = analysis.get(w["slug"])
        if not a or not a.get("ok"):
            print("SKIP", w["slug"])
            continue
        w["tech"], w["seo"] = derive(a)
        if digest:
            s, c = a["seo"], a["content"]
            print(f"\n## {w['slug']} [{w['category']}] {w['url']}")
            print("tech:", ", ".join(w["tech"]))
            print("seo :", ", ".join(w["seo"]) or "-", "| ld:", ",".join(s.get("jsonLd") or []) or "-",
                  "| theme:", a.get("wpTheme") or a.get("shopifyTheme") or "-")
            print("T:", (s.get("title") or "")[:110])
            print("D:", (s.get("description") or "")[:200])
            print("H1:", " / ".join(s.get("h1") or [])[:120])
            print("H2:", " / ".join(c.get("h2") or [])[:240])

    WORKS.write_text(json.dumps(works, ensure_ascii=False, indent=2) + "\n")
    print("\nwrote", WORKS)


if __name__ == "__main__":
    main()
