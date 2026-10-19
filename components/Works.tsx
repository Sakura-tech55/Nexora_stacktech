"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import worksData from "@/lib/works.json";

type Work = {
  slug: string;
  name: string;
  url: string;
  category: string;
  tech: string[];
  seo?: string[];
  desc?: { ja: string; en: string };
  viewport?: string;
};

const WORKS = worksData as Work[];

export const CATEGORY_ORDER = [
  "lp",
  "corporate",
  "recruit",
  "ec",
  "medical",
  "school",
  "driving",
  "realestate",
  "food",
  "animal",
  "health",
  "other",
] as const;

const shot = (w: Work) => `/works/${w.category}/${w.slug}.jpg`;

/* curated mix for the pinned wall */
const WALL_SLUGS = [
  "smiee", "herlipto", "cohina", "uzu", "anker",
  "freedom", "grandereverie", "saiseikai", "rikka-kdc", "noda-kamada",
  "kowapets", "boniq", "darich", "wacoal", "meglia-recruit",
  "bruder", "showa-ds", "t-balance", "amoretto", "fancl",
];
const WALL_IMAGES = WALL_SLUGS
  .map((s) => WORKS.find((w) => w.slug === s))
  .filter((w): w is Work => !!w)
  .map(shot);

const COL_DIRECTIONS = [1, -1, 1, -1];
const COL_SPEEDS = [0.8, 1.1, 0.7, 1.0];

/* Pinned image wall: 4 columns of work screenshots drift at different
 * speeds while a centered heading fades in over a veil near the end. */
function WorksWall() {
  const { dict } = useLang();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.querySelector<HTMLElement>(".wall__veil")!.style.opacity = "1";
      section.querySelector<HTMLElement>(".wall__center")!.style.opacity = "1";
      return;
    }

    const sticky = section.querySelector<HTMLElement>(".wall__sticky")!;
    const veil = section.querySelector<HTMLElement>(".wall__veil")!;
    const center = section.querySelector<HTMLElement>(".wall__center")!;
    const cols = Array.from(section.querySelectorAll<HTMLElement>("[data-wall-col]"));
    let range = 1;
    let halves: number[] = [];

    const measure = () => {
      range = Math.max(section.offsetHeight - sticky.clientHeight, 1);
      halves = cols.map((c) => c.scrollHeight / 2);
    };

    let inView = true;
    let rafId: number | null = null;

    const render = () => {
      if (!inView) return;
      const raw = -section.getBoundingClientRect().top / range;
      const p = Math.max(0, Math.min(raw, 1));
      const travel = 1500 * p;
      cols.forEach((col, i) => {
        const half = halves[i];
        if (!half) return;
        const off =
          (((COL_DIRECTIONS[i] ?? 1) * travel * (COL_SPEEDS[i] ?? 0.8)) % half + half) % half;
        col.style.translate = `0 ${-off}px`;
      });
      const reveal = Math.max(0, Math.min((p - 0.55) / 0.35, 1));
      const eased = reveal * reveal * (3 - 2 * reveal);
      veil.style.opacity = String(eased * 0.82);
      center.style.opacity = String(eased);
      center.style.pointerEvents = eased > 0.5 ? "auto" : "none";
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => { rafId = null; render(); });
    };

    const io = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) render();
    });
    io.observe(section);

    const ac = new AbortController();
    window.addEventListener("scroll", onScroll, { passive: true, signal: ac.signal });
    window.addEventListener("resize", () => { measure(); render(); }, { passive: true, signal: ac.signal });
    measure();
    render();

    return () => {
      ac.abort();
      io.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const perCol = Math.ceil(WALL_IMAGES.length / 4);

  return (
    <section className="wall" ref={sectionRef} aria-label="Works image wall">
      <div className="wall__sticky">
        <div className="wall__grid" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, col) => (
            <div className="wall__col" data-wall-col={col} key={col}>
              {[0, 1].flatMap((rep) =>
                WALL_IMAGES.slice(col * perCol, (col + 1) * perCol).map((src, i) => (
                  <div className="wall__img" key={`${rep}-${i}`}>
                    <img src={src} alt="" loading="lazy" decoding="async" />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
        <div className="wall__veil" aria-hidden="true" />
        <div className="wall__center">
          <div className="Heading">
            <p className="Heading__en">{dict.works.en}</p>
            <h2 className="Heading__ja">{dict.works.lead}</h2>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Expanded card (modal) */
function WorkModal({ work, onClose }: { work: Work; onClose: () => void }) {
  const { lang, dict } = useLang();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="WorkModal" role="dialog" aria-modal="true" aria-label={work.name} onClick={onClose}>
      <div className="WorkModal__card" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        <button type="button" className="WorkModal__close" onClick={onClose} aria-label={dict.works.close}>
          <span /><span />
        </button>
        <div className="WorkModal__thumb">
          <img src={shot(work)} alt={`${work.name} — first view`} decoding="async" />
        </div>
        <div className="WorkModal__body">
          <p className="WorkModal__cat">{dict.works.categories[work.category]}</p>
          <h3 className="WorkModal__ttl">{work.name}</h3>
          {work.desc && <p className="WorkModal__desc">{work.desc[lang]}</p>}
          <div className="WorkModal__tech">
            <p className="WorkModal__techLabel">{dict.works.techLabel}</p>
            <div className="WorkModal__techList">
              {work.tech.map((t) => (
                <span className="WorkModal__techItem" key={t}>{t}</span>
              ))}
            </div>
          </div>
          {work.seo && work.seo.length > 0 && (
            <div className="WorkModal__tech">
              <p className="WorkModal__techLabel">{dict.works.seoLabel}</p>
              <div className="WorkModal__techList">
                {work.seo.map((t) => (
                  <span className="WorkModal__techItem is-seo" key={t}>{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="WorkModal__foot">
            <a className="WorkModal__visit" href={work.url} target="_blank" rel="noopener noreferrer">
              <span>{dict.works.visit}</span>
              <span className="Icon type-newtab" aria-hidden="true"><span /></span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorksGrid() {
  const { lang, dict } = useLang();
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Work | null>(null);

  const close = useCallback(() => setSelected(null), []);

  const filtered = filter === "all" ? WORKS : WORKS.filter((w) => w.category === filter);
  const countOf = (cat: string) =>
    cat === "all" ? WORKS.length : WORKS.filter((w) => w.category === cat).length;

  return (
    <section className="works" id="works">
      <div className="works__head">
        <div className="Heading" data-pulse-cardio-inview>
          <p className="Heading__en" data-pulse-cardio-child>{dict.works.en}</p>
          <h2 className="Heading__ja" data-pulse-cardio-child>{dict.works.ja}</h2>
        </div>
      </div>

      <div className="works__filter" role="tablist" aria-label="Work categories">
        {["all", ...CATEGORY_ORDER].map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={filter === cat}
            className={`works__chip${filter === cat ? " is-active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "all" ? dict.works.all : dict.works.categories[cat]}
            <i>{countOf(cat)}</i>
          </button>
        ))}
      </div>

      <div className="works__grid" key={filter}>
        {filtered.map((w, i) => (
          <article
            className="Work"
            key={w.slug}
            style={{ animationDelay: `${Math.min(i % 9, 6) * 60}ms` }}
          >
            <button
              type="button"
              className="Work__open"
              onClick={() => setSelected(w)}
              aria-haspopup="dialog"
              aria-label={`${w.name} — ${dict.works.categories[w.category]}`}
            >
              <div className="Work__thumb">
                <img src={shot(w)} alt={`${w.name} — first view`} loading="lazy" decoding="async" />
              </div>
              <div className="Work__meta">
                <div className="Work__head">
                  <h3 className="Work__ttl">{w.name}</h3>
                  <span className="Icon" aria-hidden="true"><span /></span>
                </div>
                {w.desc && <p className="Work__desc">{w.desc[lang]}</p>}
                <p className="Work__cat">{dict.works.categories[w.category]}</p>
              </div>
            </button>
          </article>
        ))}
      </div>

      {selected && <WorkModal work={selected} onClose={close} />}
    </section>
  );
}

export default function Works() {
  return (
    <>
      <WorksWall />
      <WorksGrid />
    </>
  );
}
