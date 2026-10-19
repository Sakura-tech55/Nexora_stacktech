/* Analyze each portfolio site's tech stack, SEO setup and content.
 * Usage: node scripts/analyze-sites.mjs [--only slug1,slug2]
 * Output: scripts/site-analysis.json
 */
import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const OUT = path.join(ROOT, "scripts/site-analysis.json");
const works = JSON.parse(readFileSync(path.join(ROOT, "lib/works.json"), "utf8"));

const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > -1 ? new Set(process.argv[onlyArg + 1].split(",")) : null;
const queue = works.filter((w) => !only || only.has(w.slug));
const results = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

async function probe(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    const text = res.ok ? await res.text() : "";
    return res.ok && /<(urlset|sitemapindex)/i.test(text);
  } catch {
    return false;
  }
}

async function analyze(browser, work) {
  const page = await browser.newPage();
  const scriptUrls = new Set();
  page.on("response", (r) => {
    const t = r.request().resourceType();
    if (t === "script" || t === "stylesheet") scriptUrls.add(r.url());
  });
  try {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(work.url, { waitUntil: process.env.WAIT || "networkidle2", timeout: 90000 });
    await new Promise((r) => setTimeout(r, 4000));

    const data = await page.evaluate(() => {
      const w = window;
      const html = document.documentElement.outerHTML;
      const meta = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null;
      const ver = (v) => (typeof v === "string" ? v : null);

      const globals = {
        jquery: w.jQuery ? ver(w.jQuery.fn?.jquery) ?? "yes" : null,
        slick: !!(w.jQuery && w.jQuery.fn && w.jQuery.fn.slick),
        gsap: w.gsap ? ver(w.gsap.version) ?? "yes" : (w.TweenMax ? "TweenMax" : null),
        scrollTrigger: !!(w.ScrollTrigger || (w.gsap && w.gsap.core && w.gsap.plugins && w.gsap.plugins.scrollTrigger)),
        swiper: !!w.Swiper || !!document.querySelector(".swiper, .swiper-container, swiper-container"),
        splide: !!w.Splide || !!document.querySelector(".splide"),
        lenis: !!w.Lenis || !!w.lenis || document.documentElement.classList.contains("lenis"),
        three: !!w.THREE,
        aos: !!w.AOS || !!document.querySelector("[data-aos]"),
        barba: !!w.barba,
        swup: !!w.swup,
        vue: !!(w.Vue || w.__VUE__ || document.querySelector("[data-v-app]") || /data-v-[0-9a-f]{8}/.test(html)),
        nuxt: !!(w.__NUXT__ || w.$nuxt || document.getElementById("__nuxt")),
        next: !!(w.__NEXT_DATA__ || document.getElementById("__next") || w.next),
        react: !!(document.querySelector("[data-reactroot]") || w.React || w.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.size),
        alpine: !!w.Alpine,
        shopify: !!w.Shopify,
        lottie: !!(w.lottie || w.bodymovin || document.querySelector("lottie-player, dotlottie-player")),
        pixi: !!w.PIXI,
        locomotive: !!w.LocomotiveScroll || !!document.querySelector("[data-scroll-container]"),
        scrollReveal: !!w.ScrollReveal,
        animejs: !!w.anime,
        particles: !!(w.particlesJS || w.tsParticles),
        vivus: !!w.Vivus,
        rellax: !!w.Rellax,
        simpleParallax: !!w.simpleParallax,
        luxy: !!w.luxy,
        fancybox: !!(w.Fancybox || (w.jQuery && w.jQuery.fancybox)),
        lightbox: !!w.lightbox,
        typekit: !!w.Typekit || /use\.typekit\.net|fontplus|typesquare/i.test(html),
        gtag: !!w.gtag || /gtag\/js\?id=G-/.test(html),
        gtm: !!w.google_tag_manager || /googletagmanager\.com\/gtm\.js/.test(html),
        fbq: !!w.fbq,
        clarity: !!w.clarity,
        recaptcha: !!w.grecaptcha,
        canvas: document.querySelectorAll("canvas").length,
        video: document.querySelectorAll("video").length,
      };

      const ld = [];
      document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
        try {
          const j = JSON.parse(s.textContent || "");
          const collect = (o) => {
            if (!o || typeof o !== "object") return;
            if (Array.isArray(o)) return o.forEach(collect);
            if (o["@type"]) ld.push(Array.isArray(o["@type"]) ? o["@type"].join("/") : o["@type"]);
            if (o["@graph"]) collect(o["@graph"]);
          };
          collect(j);
        } catch {}
      });

      const imgs = Array.from(document.images);
      const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();

      return {
        finalUrl: location.href,
        generator: meta('meta[name="generator"]'),
        wp: /\/wp-content\/|\/wp-includes\//.test(html),
        wpTheme: (html.match(/\/wp-content\/themes\/([^/"'?]+)/) || [])[1] || null,
        wpPlugins: Array.from(new Set((html.match(/\/wp-content\/plugins\/([^/"'?]+)/g) || []).map((m) => m.split("/").pop()))).slice(0, 20),
        shopifyCdn: /cdn\.shopify\.com|\/cdn\/shop\//.test(html),
        shopifyTheme: w.Shopify?.theme?.name ?? null,
        nextAssets: /\/_next\/static\//.test(html),
        nuxtAssets: /\/_nuxt\//.test(html),
        studio: /studio\.design|STUDIO/.test(meta('meta[name="generator"]') || "") || /storage\.googleapis\.com\/studio-/.test(html),
        wix: /wix\.com|_wixCssVars|wixstatic/.test(html),
        globals,
        seo: {
          lang: document.documentElement.lang || null,
          title: document.title,
          description: meta('meta[name="description"]'),
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
          ogTitle: meta('meta[property="og:title"]'),
          ogImage: meta('meta[property="og:image"]'),
          twitter: meta('meta[name="twitter:card"]'),
          robots: meta('meta[name="robots"]'),
          hreflang: document.querySelectorAll('link[rel="alternate"][hreflang]').length,
          jsonLd: Array.from(new Set(ld)),
          h1: Array.from(document.querySelectorAll("h1")).map(text).filter(Boolean).slice(0, 3),
          h1Count: document.querySelectorAll("h1").length,
          imgCount: imgs.length,
          imgAltRatio: imgs.length ? +(imgs.filter((i) => (i.getAttribute("alt") || "").trim()).length / imgs.length).toFixed(2) : null,
          viewport: !!document.querySelector('meta[name="viewport"]'),
          breadcrumb: !!document.querySelector('[class*="breadcrumb"], nav[aria-label*="breadcrumb" i]'),
        },
        content: {
          h2: Array.from(document.querySelectorAll("h2")).map(text).filter((t) => t && t.length < 80).slice(0, 10),
          nav: Array.from(document.querySelectorAll("header nav a, header a, nav a")).map(text).filter((t) => t && t.length < 30).slice(0, 20),
          lead: text(document.querySelector("main") || document.body).slice(0, 600),
        },
      };
    });

    const origin = new URL(data.finalUrl).origin;
    const sitemap =
      (await probe(origin + "/sitemap.xml")) ||
      (await probe(origin + "/wp-sitemap.xml")) ||
      (await probe(origin + "/sitemap_index.xml"));

    const assets = Array.from(scriptUrls);
    const assetHits = (re) => assets.some((u) => re.test(u));
    data.assets = {
      gsap: assetHits(/gsap|TweenMax|ScrollTrigger/i),
      swiper: assetHits(/swiper/i),
      slick: assetHits(/slick/i),
      splide: assetHits(/splide/i),
      lenis: assetHits(/lenis/i),
      three: assetHits(/three(\.module)?(\.min)?\.js/i),
      aos: assetHits(/aos(\.min)?\.(js|css)/i),
      jquery: assetHits(/jquery/i),
      vue: assetHits(/vue(\.global|\.runtime|\.min)?\.js/i),
      bootstrap: assetHits(/bootstrap/i),
      tailwind: assetHits(/tailwind/i),
      fontawesome: assetHits(/font-?awesome/i),
      googleFonts: assetHits(/fonts\.googleapis\.com/i),
      cf7: assetHits(/contact-form-7/i),
      yoast: assetHits(/wordpress-seo|yoast/i),
      allInOneSeo: assetHits(/all-in-one-seo/i),
    };
    data.seo.sitemap = sitemap;
    results[work.slug] = { ok: true, ...data };
    console.log(`ok   ${work.slug}`);
  } catch (err) {
    results[work.slug] = { ok: false, error: String(err).slice(0, 200) };
    console.log(`FAIL ${work.slug}: ${String(err).slice(0, 100)}`);
  } finally {
    await page.close().catch(() => {});
  }
}

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: [...(process.env.IGNORE_CERT ? ["--ignore-certificate-errors"] : []), "--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--lang=ja-JP"],
});

const workers = Array.from({ length: 5 }, async () => {
  while (queue.length) {
    const w = queue.shift();
    if (w) await analyze(browser, w);
  }
});
await Promise.all(workers);
await browser.close();

writeFileSync(OUT, JSON.stringify(results, null, 2));
const fails = Object.entries(results).filter(([, r]) => !r.ok);
console.log(`\ndone: ${Object.keys(results).length - fails.length} ok, ${fails.length} failed`);
if (fails.length) console.log("failed:", fails.map(([s]) => s).join(","));
