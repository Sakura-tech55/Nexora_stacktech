/* Capture first-view (FV) screenshots of portfolio works.
 * Usage: node scripts/capture-fv.mjs [--only slug1,slug2]
 * Output: public/works/<category>/<slug>.jpg + scripts/capture-report.json
 */
import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const works = JSON.parse(readFileSync(path.join(ROOT, "lib/works.json"), "utf8"));

const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > -1 ? new Set(process.argv[onlyArg + 1].split(",")) : null;

const CHROME = "/usr/bin/google-chrome";
const CONCURRENCY = 4;
const PC = { width: 1440, height: 900 };
const SP = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

const queue = works.filter((w) => !only || only.has(w.slug));
const report = [];

async function capture(browser, work) {
  const page = await browser.newPage();
  try {
    const vp = work.viewport === "sp" ? SP : PC;
    await page.setViewport(vp);
    await page.setUserAgent(
      work.viewport === "sp"
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
    );
    if (work.preStorage) {
      const entries = work.preStorage;
      await page.evaluateOnNewDocument((kv) => {
        try {
          for (const [k, v] of Object.entries(kv)) sessionStorage.setItem(k, v);
        } catch {}
      }, entries);
    }
    await page.goto(work.url, { waitUntil: "networkidle2", timeout: 60000 });
    // let splash screens / entrance animations finish
    await new Promise((r) => setTimeout(r, work.wait ?? 6000));
    // nudge one scroll tick and back, some sites only reveal FV content after first scroll
    await page.evaluate(() => { window.scrollTo(0, 1); window.scrollTo(0, 0); });
    // force hero videos to present a frame
    await page.evaluate(async () => {
      const vids = Array.from(document.querySelectorAll("video"));
      for (const v of vids) {
        try {
          v.muted = true;
          if (v.readyState < 2) v.load();
          await v.play().catch(() => {});
          if (v.duration && isFinite(v.duration)) v.currentTime = Math.min(1, v.duration / 2);
        } catch {}
      }
    });
    await new Promise((r) => setTimeout(r, 1500));

    const dir = path.join(ROOT, "public/works", work.category);
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${work.slug}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 78 });
    report.push({ slug: work.slug, ok: true });
    console.log(`ok   ${work.slug}`);
  } catch (err) {
    report.push({ slug: work.slug, ok: false, error: String(err).slice(0, 200) });
    console.log(`FAIL ${work.slug}: ${String(err).slice(0, 120)}`);
  } finally {
    await page.close().catch(() => {});
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--hide-scrollbars",
    "--lang=ja-JP",
    "--font-render-hinting=none",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const w = queue.shift();
    if (w) await capture(browser, w);
  }
});
await Promise.all(workers);
await browser.close();

writeFileSync(path.join(ROOT, "scripts/capture-report.json"), JSON.stringify(report, null, 2));
const fails = report.filter((r) => !r.ok);
console.log(`\ndone: ${report.length - fails.length}/${report.length} ok, ${fails.length} failed`);
if (fails.length) console.log("failed:", fails.map((f) => f.slug).join(", "));
