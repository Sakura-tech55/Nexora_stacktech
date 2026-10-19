"use client";

import { useLang } from "@/lib/i18n";

export default function Hero() {
  const { dict } = useLang();

  return (
    <div className="hero" id="top">
      <div className="hero__media" aria-hidden="true">
        <img src="/images/hero/bg.jpg" alt="" className="hero__img" />
        <div className="hero__shade" />
        {/* progressive blur: stacked backdrop-filter strips */}
        <div className="hero__blur" aria-hidden="true">
          <div /><div /><div /><div /><div /><div />
        </div>
      </div>

      <section className="fv">
        <div className="fv__txt" data-pulse-cardio>
          <p className="fv__role" data-pulse-cardio-child>{dict.hero.role}</p>
          <h1 className="fv__catch">
            <span className="fv__catchLine" data-pulse-cardio-child>{dict.hero.catch1}</span>
            <span className="fv__catchLine" data-pulse-cardio-child>{dict.hero.catch2}</span>
          </h1>
          <p className="fv__sub" data-pulse-cardio-child>{dict.hero.sub}</p>
          <p className="fv__en" data-pulse-cardio-child>
            {dict.hero.tagline}
          </p>
        </div>
        <div className="fv__sd" aria-hidden="true">
          <span className="fv__sdTxt">{dict.hero.scroll}</span>
          <span className="fv__sdLine" />
        </div>
      </section>
    </div>
  );
}
