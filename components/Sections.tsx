"use client";

import { useLang } from "@/lib/i18n";
import worksData from "@/lib/works.json";

const WORKS_COUNT = worksData.length;

/* ---------- About ---------- */
export function About() {
  const { dict } = useLang();
  return (
    <section className="about" id="about" data-peel>
      <div className="about__inner">
        <div className="Heading" data-pulse-cardio-inview>
          <p className="Heading__en" data-pulse-cardio-child>{dict.about.en}</p>
          <h2 className="Heading__ja" data-pulse-cardio-child>{dict.about.ja}</h2>
        </div>
        <div className="about__body" data-pulse-cardio-inview>
          <p className="about__lead" data-pulse-cardio-child>{dict.about.lead}</p>
          {dict.about.body.map((p, i) => (
            <p className="about__txt" data-pulse-cardio-child key={i}>{p}</p>
          ))}
        </div>
      </div>
      <div className="about__strengths">
        <p className="about__strengthsLabel">{dict.about.strengthsLabel}</p>
        <div className="about__strengthsList">
          {dict.about.strengths.map((s, i) => (
            <article className="Strength" key={s.en} data-inview style={{ transitionDelay: `${i * 90}ms` }}>
              <p className="Strength__num">{String(i + 1).padStart(2, "0")}</p>
              <p className="Strength__en">{s.en}</p>
              <h3 className="Strength__ttl">{s.title}</h3>
              <p className="Strength__desc">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Services ---------- */
const SERVICE_EN = [
  "UI / UX DESIGN",
  "WEB PRODUCTION",
  "LARGE-SCALE EC & CLOUD",
  "SYSTEMS & WEB APPS",
  "MOBILE APPS",
  "GENERATIVE AI",
];

export function Services() {
  const { dict } = useLang();
  return (
    <section className="services" id="services" data-peel>
      <div className="services__head">
        <div className="Heading" data-pulse-cardio-inview>
          <p className="Heading__en" data-pulse-cardio-child>{dict.services.en}</p>
          <h2 className="Heading__ja" data-pulse-cardio-child>{dict.services.ja}</h2>
        </div>
      </div>
      <div className="services__list">
        {dict.services.items.map((item, i) => (
          <article className="Service" key={SERVICE_EN[i]} data-inview style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
            <p className="Service__num">{String(i + 1).padStart(2, "0")}</p>
            <p className="Service__en">{SERVICE_EN[i]}</p>
            <h3 className="Service__ttl">{item.title}</h3>
            <p className="Service__desc">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Tech marquee ---------- */
const STACK_A = [
  "TypeScript", "React", "Next.js", "Vue.js", "Node.js", "PHP",
  "WordPress", "Shopify", "Tailwind CSS", "GSAP", "MySQL", "PostgreSQL",
];
const STACK_B = [
  "AWS", "Docker", "Swift", "Kotlin", "Flutter", "React Native",
  "Firebase", "Python", "OpenAI API", "LangChain", "RAG", "Figma",
];

function Track({ items }: { items: string[] }) {
  return (
    <div className="marquee__track">
      {[0, 1].flatMap((rep) =>
        items.map((t, i) => (
          <span className="marquee__item" key={`${rep}-${i}`} aria-hidden={rep === 1}>
            {t}<i aria-hidden="true">◆</i>
          </span>
        ))
      )}
    </div>
  );
}

export function TechMarquee() {
  return (
    <section className="marquee" aria-label="Technology stack">
      <div className="marquee__row marquee__row--a"><Track items={STACK_A} /></div>
      <div className="marquee__row marquee__row--b"><Track items={STACK_B} /></div>
    </section>
  );
}

/* ---------- Numbers ---------- */
export function Numbers() {
  const { dict } = useLang();
  return (
    <section className="numbers" data-peel>
      <div className="numbers__head" data-pulse-cardio-inview>
        <h2 className="numbers__headEn" data-pulse-cardio-child>{dict.numbers.en}</h2>
      </div>
      <div className="numbers__list" data-pulse-cardio-inview>
        {dict.numbers.items.map((n, i) => (
          <div className="numbers__item" key={i} data-pulse-cardio-child>
            <p className="numbers__num">
              {n.num === "WORKS" ? WORKS_COUNT : n.num}
              <span className="numbers__unit">{n.unit}</span>
            </p>
            <div className="numbers__txt">
              <p className="numbers__label">{n.label}</p>
              <p className="numbers__sub">{n.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  const { dict } = useLang();
  return (
    <footer className="footer" id="contact">
      <div className="footer__cta">
        <div className="Heading" data-pulse-cardio-inview>
          <p className="Heading__en" data-pulse-cardio-child>{dict.footer.ctaEn}</p>
          <h2 className="Heading__ja" data-pulse-cardio-child>{dict.footer.lead}</h2>
        </div>
        <p className="footer__txt" data-pulse-cardio-inview>
          <span data-pulse-cardio-child>{dict.footer.body}</span>
        </p>
        <div className="Btn">
          <a href="mailto:nobu.web.work@gmail.com">
            <p>{dict.footer.btn}</p>
            <span className="Icon" aria-hidden="true"><span /></span>
          </a>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__logo" data-burst-inview>NEXORA</p>
        <p className="footer__copy">{dict.footer.copy}</p>
      </div>
    </footer>
  );
}
