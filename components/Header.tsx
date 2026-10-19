"use client";

import { useLang } from "@/lib/i18n";

export default function Header() {
  const { lang, dict, toggle } = useLang();

  return (
    <header className="header">
      <div className="header__logo">
        <a href="#top" aria-label="NEXORA — top">NEXORA</a>
      </div>
      <nav className="header__nav" aria-label="Main">
        <ul className="header__navList">
          <li><a href="#about">{dict.nav.about}</a></li>
          <li><a href="#services">{dict.nav.services}</a></li>
          <li><a href="#works">{dict.nav.works}</a></li>
        </ul>
      </nav>
      <div className="header__cta">
        <button
          type="button"
          className="header__lang"
          onClick={toggle}
          aria-label={lang === "ja" ? "Switch to English" : "日本語に切り替える"}
        >
          <span className={lang === "ja" ? "is-active" : ""}>JA</span>
          <span className="header__langSep" aria-hidden="true">/</span>
          <span className={lang === "en" ? "is-active" : ""}>EN</span>
        </button>
        <a href="#contact" className="header__contact">
          <span>{dict.nav.contact}</span>
          <span className="Icon" aria-hidden="true"><span /></span>
        </a>
      </div>
    </header>
  );
}
