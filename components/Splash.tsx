"use client";

import { useEffect, useRef, useState } from "react";
import { VisuallyHidden } from "@chakra-ui/react";
import { useLang } from "@/lib/i18n";

/* Loading splash
 * 1. centered odometer counts 0 → 100 while a blue band fills the bottom edge,
 *    its glowing head travelling left → right
 * 2. counter and band fade, then "NEXORA" flies toward the viewer one letter
 *    at a time, each letter dissolving as it passes
 * 3. the splash collapses to a blue line at the vertical center and the page
 *    expands into view behind it
 */

const DURATION_COUNT = 2400;
const LETTER_DURATION = 1050;
const LETTER_STAGGER = 120;
const DURATION_REVEAL = 1300;
const EASE_HOUSE = "cubic-bezier(0.75, 0, 0.2, 1)";
const WORD = "NEXORA";

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Strip() {
  return (
    <div className="absolute left-0 top-0 w-full will-change-transform" data-splash-strip>
      {Array.from({ length: 11 }).flatMap((_, rep) =>
        Array.from({ length: 10 }).map((_, d) => (
          <div key={`${rep}-${d}`} className="block h-[0.72em] text-center leading-[0.72em]">
            {d}
          </div>
        ))
      )}
    </div>
  );
}

export default function Splash() {
  const { lang } = useLang();
  const [active, setActive] = useState(true);
  const [percent, setPercent] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = () => {
      document.body.classList.remove("splash-is-on");
      document.body.classList.add("splashed");
      window.dispatchEvent(new Event("splash:done"));
      setActive(false);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Only skip repeat visits in production, so every reload shows the splash while developing.
    const skipRepeat = process.env.NODE_ENV === "production";
    if ((skipRepeat && sessionStorage.getItem("splashed")) || reduced) {
      done();
      return;
    }
    document.body.classList.add("splash-is-on");
    window.scrollTo(0, 0);

    const root = rootRef.current;
    const counter = counterRef.current;
    const num = numRef.current;
    const bar = barRef.current;
    const fill = fillRef.current;
    const word = wordRef.current;
    const line = lineRef.current;
    const wrapper = document.querySelector<HTMLElement>(".wrapper");
    if (!root || !counter || !num || !bar || !fill || !word || !line || !wrapper) {
      done();
      return;
    }

    const strips = Array.from(root.querySelectorAll<HTMLElement>("[data-splash-strip]"));
    const letters = Array.from(word.querySelectorAll<HTMLElement>("[data-letter]"));
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("wheel", prevent, { passive: false });
    document.addEventListener("touchmove", prevent, { passive: false });

    const setDigit = (el: HTMLElement, v: number) => {
      el.style.transform = `translateY(${-0.72 * v}em)`;
    };
    let lastShown = -1;
    const setProgress = (value: number) => {
      const n = Math.max(0, Math.min(value, 100));
      setDigit(strips[0], Math.min(Math.max((n - 90) / 10, 0), 1));
      setDigit(strips[1], n / 10);
      setDigit(strips[2], n);
      fill.style.width = `${n}%`;
      const rounded = Math.floor(n);
      if (rounded !== lastShown && rounded % 10 === 0) {
        lastShown = rounded;
        setPercent(rounded);
      }
    };

    /* the page waits, dimmed and slightly enlarged, behind the splash */
    wrapper.style.transformOrigin = "50% 50vh";
    wrapper.style.willChange = "transform, filter, opacity";
    wrapper.style.transform = "scale(1.08)";
    wrapper.style.filter = "blur(12px) brightness(0.45)";

    let cancelled = false;

    const count = () =>
      new Promise<void>((resolve) => {
        let start: number | null = null;
        const tick = (t: number) => {
          if (cancelled) return;
          if (start === null) start = t;
          const p = Math.min((t - start) / DURATION_COUNT, 1);
          setProgress(100 * easeInOutSine(p));
          if (p < 1) requestAnimationFrame(tick);
          else {
            setProgress(100);
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });

    const run = async () => {
      setProgress(0);
      await count();
      if (cancelled) return;
      await wait(120);

      /* 1 → 2: counter pulses, then counter + band fade away */
      await num
        .animate(
          [
            { opacity: 1, filter: "blur(0px)", offset: 0, easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
            { opacity: 0.6, filter: "blur(4px)", offset: 0.5625, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
            { opacity: 1, filter: "blur(0px)", offset: 1 },
          ],
          { duration: 320, fill: "both" }
        )
        .finished.catch(() => {});
      if (cancelled) return;

      const fadeOut: Keyframe[] = [
        { opacity: 1, filter: "blur(0px)", transform: "scale(1)" },
        { opacity: 0, filter: "blur(10px)", transform: "scale(0.94)" },
      ];
      counter.animate(fadeOut, { duration: 450, easing: "cubic-bezier(0.55, 0, 0.45, 1)", fill: "forwards" });
      await bar
        .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: "forwards" })
        .finished.catch(() => {});
      if (cancelled) return;

      /* 2: NEXORA — each letter comes forward out of the depth, then passes and dissolves */
      word.style.visibility = "visible";
      const letterAnims = letters.map((el, i) =>
        el.animate(
          [
            {
              opacity: 0,
              transform: "translateZ(-700px)",
              filter: "blur(18px)",
              offset: 0,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
            { opacity: 1, transform: "translateZ(0px)", filter: "blur(0px)", offset: 0.4 },
            {
              opacity: 1,
              transform: "translateZ(40px)",
              filter: "blur(0px)",
              offset: 0.62,
              easing: "cubic-bezier(0.7, 0, 0.84, 0)",
            },
            { opacity: 0, transform: "translateZ(520px)", filter: "blur(16px)", offset: 1 },
          ],
          { duration: LETTER_DURATION, delay: i * LETTER_STAGGER, fill: "both" }
        )
      );
      const lettersTotal = LETTER_DURATION + (letters.length - 1) * LETTER_STAGGER;
      await wait(lettersTotal - 380);
      if (cancelled) return;

      /* 3: splash collapses to a blue line at center, page expands behind it */
      root.animate(
        [{ clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(50% 0% 50% 0%)" }],
        { duration: DURATION_REVEAL, easing: EASE_HOUSE, fill: "forwards" }
      );
      line.animate(
        [
          { opacity: 0, transform: "scaleX(0.2)", offset: 0 },
          { opacity: 1, transform: "scaleX(1)", offset: 0.62 },
          { opacity: 0, transform: "scaleX(1)", offset: 1 },
        ],
        { duration: DURATION_REVEAL + 250, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "forwards" }
      );
      const wrapperAnim = wrapper.animate(
        [
          { transform: "scale(1.08)", filter: "blur(12px) brightness(0.45)" },
          { transform: "scale(1)", filter: "blur(0px) brightness(1)" },
        ],
        { duration: DURATION_REVEAL + 200, easing: EASE_HOUSE, fill: "both" }
      );
      wrapper.style.transform = "";
      wrapper.style.filter = "";

      await Promise.all([
        wrapperAnim.finished.catch(() => {}),
        ...letterAnims.map((a) => a.finished.catch(() => {})),
      ]);
      wrapperAnim.cancel();
      wrapper.style.willChange = "";
      wrapper.style.transformOrigin = "";
      if (cancelled) return;
      // Marked only once the sequence has fully played: React StrictMode mounts this
      // effect twice in development, and marking it up front skipped the second mount.
      sessionStorage.setItem("splashed", "true");
      done();
    };

    run();

    return () => {
      cancelled = true;
      document.body.classList.remove("splash-is-on");
      document.removeEventListener("wheel", prevent);
      document.removeEventListener("touchmove", prevent);
      wrapper.style.transform = "";
      wrapper.style.filter = "";
      wrapper.style.willChange = "";
      wrapper.style.transformOrigin = "";
    };
  }, []);

  if (!active) return null;

  return (
    <>
      <div
        ref={rootRef}
        data-splash
        className="fixed inset-0 z-[9990] overflow-hidden bg-ink-900 text-[#f5f5f5]"
      >
        <VisuallyHidden role="status" aria-live="polite">
          {lang === "ja" ? `読み込み中 ${percent}%` : `Loading ${percent}%`}
        </VisuallyHidden>

        {/* ambient blue haze */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_50%,rgba(47,123,255,0.12),transparent_70%)]"
        />

        {/* centered counter */}
        <div ref={counterRef} aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-end">
            <div
              ref={numRef}
              className="inline-flex font-serifEn text-[clamp(84px,17vw,240px)] font-medium leading-none tracking-[-0.02em] [filter:drop-shadow(0_0_28px_rgba(47,123,255,0.35))]"
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="relative inline-block h-[0.72em] w-[0.55em] overflow-hidden">
                  <Strip />
                </div>
              ))}
            </div>
            <span className="mb-[0.06em] ml-[0.18em] font-serifEn text-[clamp(20px,2.4vw,34px)] font-medium text-nexora-glow/80">
              %
            </span>
          </div>
        </div>

        {/* NEXORA letter sequence */}
        <div
          ref={wordRef}
          aria-hidden="true"
          className="invisible absolute inset-0 flex items-center justify-center [perspective:900px]"
        >
          <div className="flex font-serifEn text-[clamp(64px,13vw,190px)] font-semibold leading-none tracking-[0.14em] [transform-style:preserve-3d]">
            {WORD.split("").map((ch, i) => (
              <span
                key={i}
                data-letter
                className="inline-block opacity-0 [text-shadow:0_0_28px_rgba(124,196,255,0.55),0_0_80px_rgba(47,123,255,0.35)]"
              >
                {ch}
              </span>
            ))}
          </div>
        </div>

        {/* bottom progress band */}
        <div ref={barRef} aria-hidden="true" className="absolute inset-x-0 bottom-0">
          <div className="flex items-end justify-between px-[clamp(16px,3vw,48px)] pb-3 font-serifEn text-[clamp(10px,0.9vw,13px)] tracking-[0.3em] text-white/45">
            <span>LOADING</span>
            <span>NEXORA — PORTFOLIO</span>
          </div>
          <div className="relative h-[6px] w-full bg-white/[0.06]">
            <div
              ref={fillRef}
              className="absolute inset-y-0 left-0 w-0 bg-gradient-to-r from-nexora-deep via-nexora-blue to-nexora-glow shadow-[0_0_14px_rgba(47,123,255,0.85),0_0_36px_rgba(47,123,255,0.45)]"
            >
              {/* light sweeping left → right across the filled band */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/5 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
              </div>
              {/* glowing head riding the leading edge */}
              <span className="absolute right-0 top-1/2 h-[12px] w-[12px] -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_14px_5px_rgba(124,196,255,0.95),0_0_48px_18px_rgba(47,123,255,0.7)]" />
              <span className="absolute bottom-0 right-0 h-[140px] w-[260px] translate-x-1/2 translate-y-1/2 animate-glow-pulse rounded-full bg-nexora-blue/30 blur-[48px]" />
            </div>
          </div>
        </div>
      </div>

      {/* blue line left behind when the splash collapses to center */}
      <div
        ref={lineRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-1/2 z-[9991] h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-nexora-glow to-transparent opacity-0 shadow-[0_0_18px_2px_rgba(47,123,255,0.8)]"
      />
    </>
  );
}
