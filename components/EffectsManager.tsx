"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* ============================================================
 * Animation engine — technique study of ad-dict.co.jp
 * (see docs/ad-dict-style-analysis.md). All original code.
 * - pulse-cardio : blur-snap text reveal with heartbeat after-pulse (WAAPI)
 * - peel         : scroll-linked section entrance (scale/blur/brightness)
 * - inview       : .is-inview class toggle (CSS handles the rest)
 * - burst        : overshoot pop-in for the footer logo
 * - lenis        : smooth scroll, desktop only
 * ========================================================== */

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- pulse cardio -------------------------------------------- */
const CARDIO_FRAMES: Keyframe[] = [
  { opacity: 0.5, filter: "blur(10px)", offset: 0, easing: "linear" },
  { opacity: 0.5, filter: "blur(10px)", offset: 0.044, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  { opacity: 1, filter: "blur(0px)", offset: 0.08, easing: "cubic-bezier(0.37, 0, 0.63, 1)" },
  { opacity: 0.92, filter: "blur(2px)", offset: 0.115, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  { opacity: 1, filter: "blur(0px)", offset: 1 },
];

function cardioChildren(el: HTMLElement): HTMLElement[] {
  const kids = Array.from(el.querySelectorAll<HTMLElement>("[data-pulse-cardio-child]"));
  return kids.length ? kids : [el];
}

function playCardio(el: HTMLElement, delay: number) {
  el.style.willChange = "opacity, filter";
  el.animate(CARDIO_FRAMES, { duration: 2260, delay, fill: "both" })
    .finished.then(() => { el.style.willChange = ""; })
    .catch(() => {});
}

/* ---- burst ----------------------------------------------------- */
const BURST_FRAMES: Keyframe[] = [
  { opacity: 0, filter: "blur(10px)", transform: "scale(0.98)", offset: 0, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  { opacity: 1, filter: "blur(0px)", transform: "scale(1.01)", offset: 0.5, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
  { opacity: 1, filter: "blur(0px)", transform: "scale(1)", offset: 1 },
];

/* ---- peel ------------------------------------------------------ */
function applyPeel(el: HTMLElement) {
  const vh = window.innerHeight;
  const raw = (vh - el.getBoundingClientRect().top) / (vh - 0.6 * vh);
  const p = Math.max(0, Math.min(1, raw));
  const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
  if (e >= 0.999) {
    el.style.transform = "";
    el.style.filter = "";
    el.style.opacity = "";
    el.style.willChange = "";
    return;
  }
  const scale = 0.94 + (1 - 0.94) * e;
  const blur = 8 * (1 - e);
  const bright = 0.75 + 0.25 * e;
  el.style.willChange = "transform, filter, opacity";
  el.style.transform = `translate3d(0,0,0) scale(${scale})`;
  el.style.filter = `blur(${blur}px) brightness(${bright})`;
  el.style.opacity = String(0.6 + 0.4 * e);
}

export default function EffectsManager() {
  /* Lenis smooth scroll — desktop only */
  useEffect(() => {
    if (reduced() || window.matchMedia("(max-width: 1024px)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let rafId = 0;
    const raf = (t: number) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(url.hash.slice(1));
      if (target) { e.preventDefault(); lenis.scrollTo(target); }
    };
    document.addEventListener("click", onClick);
    return () => { cancelAnimationFrame(rafId); document.removeEventListener("click", onClick); lenis.destroy(); };
  }, []);

  /* pulse-cardio / inview / burst / peel */
  useEffect(() => {
    if (reduced()) {
      document
        .querySelectorAll<HTMLElement>("[data-inview]")
        .forEach((el) => el.classList.add("is-inview"));
      return;
    }

    const observers: IntersectionObserver[] = [];

    /* hero headings: wait for splash + fonts */
    const heroTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-pulse-cardio]"));
    heroTargets.forEach((el) => cardioChildren(el).forEach((c) => {
      c.style.opacity = "0.5";
      c.style.filter = "blur(10px)";
    }));
    const playHero = () => {
      const run = () => heroTargets.forEach((el, i) =>
        cardioChildren(el).forEach((c, j) => {
          c.style.opacity = "";
          c.style.filter = "";
          playCardio(c, 600 + 150 * i + 150 * j);
        })
      );
      if (document.fonts?.ready) document.fonts.ready.then(run);
      else run();
    };
    if (document.body.classList.contains("splashed")) playHero();
    else window.addEventListener("splash:done", playHero, { once: true });

    /* scroll-triggered cardio */
    const inviewCardio = Array.from(
      document.querySelectorAll<HTMLElement>("[data-pulse-cardio-inview]")
    );
    inviewCardio.forEach((el) => cardioChildren(el).forEach((c) => {
      c.style.opacity = "0.5";
      c.style.filter = "blur(10px)";
    }));
    if (inviewCardio.length) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (!en.isIntersecting) return;
          cardioChildren(en.target as HTMLElement).forEach((c, i) => {
            c.style.opacity = "";
            c.style.filter = "";
            playCardio(c, 150 * i);
          });
          io.unobserve(en.target);
        }),
        { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
      );
      inviewCardio.forEach((el) => io.observe(el));
      observers.push(io);
    }

    /* .is-inview toggler */
    const inviewEls = Array.from(document.querySelectorAll<HTMLElement>("[data-inview]"));
    if (inviewEls.length) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-inview");
          io.unobserve(en.target);
        }),
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
      );
      inviewEls.forEach((el) => io.observe(el));
      observers.push(io);
    }

    /* burst */
    const burstEls = Array.from(document.querySelectorAll<HTMLElement>("[data-burst-inview]"));
    burstEls.forEach((el) => {
      el.style.opacity = "0";
      el.style.filter = "blur(10px)";
      el.style.transform = "scale(0.98)";
    });
    if (burstEls.length) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          el.style.opacity = "";
          el.style.filter = "";
          el.style.transform = "";
          el.style.willChange = "opacity, filter, transform";
          el.animate(BURST_FRAMES, { duration: 900, fill: "both" })
            .finished.then(() => { el.style.willChange = ""; })
            .catch(() => {});
          io.unobserve(el);
        }),
        { threshold: 0.4 }
      );
      burstEls.forEach((el) => io.observe(el));
      observers.push(io);
    }

    /* peel */
    const peelEls = Array.from(document.querySelectorAll<HTMLElement>("[data-peel]"));
    peelEls.forEach((el) => { el.style.transformOrigin = "center top"; });
    let rafId: number | null = null;
    const runPeel = () => peelEls.forEach(applyPeel);
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => { rafId = null; runPeel(); });
    };
    const ac = new AbortController();
    if (peelEls.length) {
      window.addEventListener("scroll", onScroll, { passive: true, signal: ac.signal });
      window.addEventListener("resize", onScroll, { passive: true, signal: ac.signal });
      runPeel();
    }

    return () => {
      ac.abort();
      if (rafId !== null) cancelAnimationFrame(rafId);
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("splash:done", playHero);
    };
  }, []);

  return null;
}
