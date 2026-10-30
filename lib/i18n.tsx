"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "ja" | "en";

const dictionaries = {
  ja: {
    nav: { about: "私について", services: "できること", works: "制作実績", contact: "お問い合わせ" },
    hero: {
      catch1: "信頼される体験を、",
      catch2: "設計から実装まで。",
      sub: "UXを軸にしたWebデザインから、モバイルアプリ、業務システム、AIソリューションまで。",
      role: "シニア・フルスタックエンジニア ／ Web・モバイル・AI",
      tagline: "UX Design / Web / Mobile Apps / Business Systems / Generative AI",
      scroll: "スクロール",
    },
    about: {
      en: "ABOUT",
      ja: "私について",
      lead: "美しさで惹きつけ、設計で成果を出す。",
      body: [
        "私が手がけるWebデザインの根幹にあるのは、無駄を削ぎ落とした洗練と、成果に直結する設計です。ユーザーの動線、可読性、離脱率の低減を設計段階から組み込み、訪れた人が迷わず、安心して行動できる——その信頼感までをプロダクトの品質と捉えています。",
        "プロジェクトの起点は、要件の深い分析です。クライアントの要望を表面的な仕様ではなく事業課題として捉え直し、技術的な選択肢、改善提案、想定リスクを具体的に提示したうえで合意を形成します。期待値を揃えてから着手するからこそ、求められる水準を上回る品質で、確実にリリースまで導くことができます。",
        "IT業界でWebサイト制作を専門とし、LP・コーポレートサイト・ECサイトを中心に100件以上の制作実績を有しています。AWSを基盤とした大規模ECサイトの開発では、リーダーとしてプロジェクトを牽引しました。",
        "直近5年間は、モバイルファーストのサイト制作に加え、Webアプリケーション、業務システム、iOS / Androidアプリ、AIソリューションの開発に注力しています。モバイルアプリと業務システムを中心に50件以上の開発実績を積み、生成AIを活用したチャットボットの開発や、中小規模の企業における業務効率化にも貢献してきました。",
      ],
      strengthsLabel: "STRENGTHS",
      strengths: [
        {
          en: "UX-DRIVEN DESIGN",
          title: "成果から逆算するUI設計",
          desc: "動線・可読性・離脱率を軸に、信頼感と安心感を生む洗練されたUIを設計します。",
        },
        {
          en: "REQUIREMENTS & ALIGNMENT",
          title: "要件分析と合意形成",
          desc: "要望を事業課題まで掘り下げ、提案とリスク提示を経て合意を形成してから着手します。",
        },
        {
          en: "LEADING AT SCALE",
          title: "大規模開発のリード",
          desc: "AWSを基盤とした大規模ECサイトの開発を、リーダーとして推進した経験があります。",
        },
        {
          en: "MOBILE & AI",
          title: "モバイル・AI開発",
          desc: "iOS / Androidアプリ、業務システム、生成AIチャットボットまで50件以上を開発しています。",
        },
      ],
    },
    services: {
      en: "SERVICES",
      ja: "できること",
      items: [
        { title: "UI / UXデザイン", desc: "動線・可読性・離脱率を設計段階から組み込み、信頼感と安心感を生む洗練されたUIをつくります。" },
        { title: "Web制作（LP・HP・EC）", desc: "LP・コーポレートサイト・ECサイトを100件以上。WordPress・Shopifyからフルスクラッチまで対応します。" },
        { title: "大規模EC・クラウド", desc: "AWSを基盤とした大規模ECサイトを、リーダーとして設計から開発・リリースまで推進します。" },
        { title: "業務システム・Webアプリ", desc: "要件を事業課題まで掘り下げ、現場で使われ続ける業務システムとWebアプリケーションを開発します。" },
        { title: "モバイルアプリ", desc: "iOS / Androidアプリとモバイルファーストのサイト制作。モバイル領域を中心に50件以上の開発実績があります。" },
        { title: "生成AI・業務効率化", desc: "生成AIを活用したチャットボットの開発や、ノーコード／ローコードも組み合わせた中小規模の業務効率化を支援します。" },
      ],
    },
    works: {
      en: "WORKS",
      ja: "制作実績",
      lead: "あらゆる業種に、最適な一手を。",
      all: "すべて",
      visit: "サイトを表示",
      techLabel: "使用技術",
      seoLabel: "SEO対策",
      close: "閉じる",
      categories: {
        lp: "LP",
        corporate: "コーポレート",
        recruit: "採用サイト",
        ec: "EC・ブランド",
        medical: "医療・福祉",
        school: "スクール・教育",
        driving: "自動車学校",
        realestate: "不動産",
        food: "フード",
        animal: "ペット",
        health: "フィットネス",
        other: "その他",
      } as Record<string, string>,
    },
    numbers: {
      en: "NUMBERS",
      items: [
        { num: "100", unit: "件以上", label: "Web制作実績", sub: "LP・コーポレート・ECサイト" },
        { num: "50", unit: "件以上", label: "アプリ・システム開発", sub: "モバイルアプリ・業務システム" },
        { num: "5", unit: "年", label: "モバイル・AI領域", sub: "モバイルファースト・生成AI" },
        { num: "WORKS", unit: "件", label: "公開中の制作事例", sub: "12カテゴリ・本サイトに掲載" },
      ],
    },
    contact: {
      formTitle: "メールで相談する",
      formNote: "内容を確認のうえ、ご入力いただいたメールアドレスへご連絡いたします。",
      required: "必須",
      optional: "任意",
      fields: {
        name: "お名前",
        email: "メールアドレス",
        type: "ご相談の種類",
        budget: "ご予算",
        message: "ご相談内容",
      },
      placeholders: {
        name: "山田 太郎",
        email: "you@example.com",
        message: "実現したいこと、現在の課題、ご希望の時期などをご記入ください。要件が固まっていなくても大丈夫です。",
      },
      selectPlaceholder: "選択してください",
      types: {
        web: "Web制作（LP・HP）",
        ec: "ECサイト",
        app: "モバイルアプリ",
        system: "業務システム・Webアプリ",
        ai: "生成AI・業務効率化",
        other: "その他",
      } as Record<string, string>,
      budgets: {
        undecided: "未定・相談したい",
        lt30: "〜30万円",
        "30to100": "30万〜100万円",
        "100to300": "100万〜300万円",
        gt300: "300万円〜",
      } as Record<string, string>,
      consent: "入力内容を、お問い合わせへの回答のためにのみ利用することに同意します（送信にはフォーム送信サービス FormSubmit を利用します）",
      submit: "送信する",
      sending: "送信中…",
      successTitle: "送信が完了しました",
      successBody: "お問い合わせありがとうございます。内容を確認のうえ、ご入力いただいたメールアドレスへご連絡いたします。",
      again: "別の内容を送信する",
      errors: {
        required: "入力してください",
        requiredSelect: "選択してください",
        consent: "ご同意のうえ送信してください",
        invalidEmail: "メールアドレスの形式をご確認ください",
        invalid: "選択内容をご確認ください",
        tooLong: "{max}文字以内でご入力ください",
        tooShort: "{min}文字以上でご記入ください",
      },
      submitErrors: {
        delivery_failed: "送信に失敗しました。時間をおいて再度お試しいただくか、Chatworkからご連絡ください。",
        network: "通信エラーが発生しました。接続をご確認のうえ再度お試しください。",
      } as Record<string, string>,
      chatwork: {
        title: "Chatworkで相談する",
        body: "Chatworkをお使いの方は、プロフィールページからコンタクト追加のリクエストをお送りください。承認後、チャットで直接ご相談いただけます。",
        steps: ["下のボタンからプロフィールページを開く", "Chatworkにログインする（アカウントがない場合は無料で登録できます）", "コンタクト追加のリクエストを送信する"],
        idLabel: "Chatwork ID",
        open: "Chatworkでリクエストを送る",
        copy: "IDをコピー",
        copied: "コピーしました",
      },
      channels: {
        label: "ご相談方法を選んでください",
        mailTitle: "メールで相談する",
        mailSub: "フォームに相談内容を入力して送信",
        chatworkTitle: "Chatworkで相談する",
        chatworkSub: "Chatwork ID：dfs32kr32",
      },
      close: "閉じる",
    },
    footer: {
      ctaEn: "CONTACT",
      ctaJa: "お問い合わせ",
      lead: "アイデアを、動くかたちに。",
      body: "新しいサイトやアプリの立ち上げ、既存システムの刷新、生成AIによる業務効率化。要件が固まる前の段階から、まずはお気軽にご相談ください。",
      copy: "© 2026 NEXORA — Senior Full-Stack Engineer",
    },
  },
  en: {
    nav: { about: "About", services: "Services", works: "Works", contact: "Contact" },
    hero: {
      catch1: "Trusted experiences,",
      catch2: "from design to code.",
      sub: "From UX-driven web design to mobile apps, business systems and AI solutions.",
      role: "Senior Full-Stack Engineer — Web, Mobile & AI",
      tagline: "UX Design / Web / Mobile Apps / Business Systems / Generative AI",
      scroll: "Scroll",
    },
    about: {
      en: "ABOUT",
      ja: "Who I am",
      lead: "Design that draws people in. Engineering that delivers results.",
      body: [
        "My web design work rests on two principles: refinement without excess, and structure that drives outcomes. I build user flow, readability and lower bounce rates into the design from the very first wireframe, so visitors can act without hesitation — and I treat the trust and reassurance they feel as part of the product's quality.",
        "Every project starts with a deep analysis of requirements. I reframe a client's requests as business problems rather than surface-level specs, then lay out concrete technical options, improvement proposals and foreseeable risks to reach a shared agreement before any build begins. Aligning expectations up front is what lets me deliver beyond the standard the client asked for — and ship reliably.",
        "I specialize in website production in the IT industry, with more than 100 projects delivered across landing pages, corporate sites and e-commerce. On a large-scale e-commerce platform built on AWS, I led the project as its team lead.",
        "For the past five years I have focused on mobile-first web production alongside web applications, business systems, iOS / Android apps and AI solutions — delivering more than 50 projects centered on mobile apps and business systems. I have also built chatbots powered by generative AI and helped small and mid-sized companies streamline their operations.",
      ],
      strengthsLabel: "STRENGTHS",
      strengths: [
        {
          en: "UX-DRIVEN DESIGN",
          title: "UI designed backward from results",
          desc: "Refined interfaces built around user flow, readability and bounce rate — designed to earn trust.",
        },
        {
          en: "REQUIREMENTS & ALIGNMENT",
          title: "Requirements analysis & consensus",
          desc: "I dig requests down to the business problem, then propose, flag risks and align before building.",
        },
        {
          en: "LEADING AT SCALE",
          title: "Leading large-scale builds",
          desc: "Led development of a large-scale e-commerce platform built on AWS as the project lead.",
        },
        {
          en: "MOBILE & AI",
          title: "Mobile & AI development",
          desc: "50+ projects across iOS / Android apps, business systems and generative-AI chatbots.",
        },
      ],
    },
    services: {
      en: "SERVICES",
      ja: "What I do",
      items: [
        { title: "UI / UX Design", desc: "User flow, readability and bounce rate built in from the start — refined interfaces that earn trust." },
        { title: "Web Production (LP / Corporate / EC)", desc: "100+ landing pages, corporate sites and online stores, from WordPress and Shopify to fully custom builds." },
        { title: "Large-scale EC & Cloud", desc: "Leading large-scale e-commerce platforms on AWS, from architecture through development and launch." },
        { title: "Business Systems & Web Apps", desc: "Requirements dug down to the business problem, delivered as systems and web apps teams keep using." },
        { title: "Mobile Apps", desc: "iOS / Android apps and mobile-first sites — 50+ projects delivered, centered on mobile." },
        { title: "Generative AI & Efficiency", desc: "Generative-AI chatbots and operational efficiency for small and mid-sized teams, combining no-code / low-code where it fits." },
      ],
    },
    works: {
      en: "WORKS",
      ja: "Selected works",
      lead: "The right move, for every industry.",
      all: "All",
      visit: "Visit the site",
      techLabel: "Tech Stack",
      seoLabel: "SEO",
      close: "Close",
      categories: {
        lp: "Landing Pages",
        corporate: "Corporate",
        recruit: "Recruiting",
        ec: "E-Commerce & Brands",
        medical: "Medical & Welfare",
        school: "Education",
        driving: "Driving Schools",
        realestate: "Real Estate",
        food: "Food",
        animal: "Pets",
        health: "Fitness",
        other: "Others",
      } as Record<string, string>,
    },
    numbers: {
      en: "NUMBERS",
      items: [
        { num: "100", unit: "+", label: "Websites delivered", sub: "LPs, corporate & e-commerce" },
        { num: "50", unit: "+", label: "Apps & systems built", sub: "Mobile apps & business systems" },
        { num: "5", unit: "yrs", label: "Focused on mobile & AI", sub: "Mobile-first & generative AI" },
        { num: "WORKS", unit: "", label: "Live case studies", sub: "12 categories, shown on this site" },
      ],
    },
    contact: {
      formTitle: "Send a message",
      formNote: "I'll review your message and reply to the e-mail address you provide.",
      required: "Required",
      optional: "Optional",
      fields: {
        name: "Name",
        email: "E-mail",
        type: "Type of inquiry",
        budget: "Budget",
        message: "Message",
      },
      placeholders: {
        name: "Taro Yamada",
        email: "you@example.com",
        message: "What you want to build, current challenges, preferred timeline — it's fine if requirements aren't final yet.",
      },
      selectPlaceholder: "Please select",
      types: {
        web: "Website (LP / corporate)",
        ec: "E-commerce",
        app: "Mobile app",
        system: "Business system / web app",
        ai: "Generative AI / efficiency",
        other: "Other",
      } as Record<string, string>,
      budgets: {
        undecided: "Undecided / let's discuss",
        lt30: "Up to ¥300k",
        "30to100": "¥300k – ¥1M",
        "100to300": "¥1M – ¥3M",
        gt300: "¥3M+",
      } as Record<string, string>,
      consent: "I agree that this information will be used only to respond to my inquiry (it is delivered through the form service FormSubmit)",
      submit: "Send message",
      sending: "Sending…",
      successTitle: "Message sent",
      successBody: "Thank you for reaching out. I'll review your message and reply to the e-mail address you provided.",
      again: "Send another message",
      errors: {
        required: "This field is required",
        requiredSelect: "Please select an option",
        consent: "Please agree before sending",
        invalidEmail: "Please check the e-mail format",
        invalid: "Please check your selection",
        tooLong: "Please keep it within {max} characters",
        tooShort: "Please write at least {min} characters",
      },
      submitErrors: {
        delivery_failed: "Sending failed. Please try again later, or reach out via Chatwork.",
        network: "A network error occurred. Please check your connection and try again.",
      } as Record<string, string>,
      chatwork: {
        title: "Talk on Chatwork",
        body: "If you use Chatwork, send a contact request from my profile page. Once accepted, we can talk directly in chat.",
        steps: ["Open my profile page with the button below", "Log in to Chatwork (signing up is free)", "Send a contact request"],
        idLabel: "Chatwork ID",
        open: "Send a request on Chatwork",
        copy: "Copy ID",
        copied: "Copied",
      },
      channels: {
        label: "Choose how to reach me",
        mailTitle: "Send an e-mail",
        mailSub: "Fill in the form and send your inquiry",
        chatworkTitle: "Talk on Chatwork",
        chatworkSub: "Chatwork ID: dfs32kr32",
      },
      close: "Close",
    },
    footer: {
      ctaEn: "CONTACT",
      ctaJa: "Get in touch",
      lead: "Let's turn ideas into working products.",
      body: "A new site or app, a legacy system overhaul, or streamlining work with generative AI — reach out even before your requirements are final.",
      copy: "© 2026 NEXORA — Senior Full-Stack Engineer",
    },
  },
} as const;

export type Dict = (typeof dictionaries)["ja"];

const LangContext = createContext<{ lang: Lang; dict: Dict; toggle: () => void }>({
  lang: "ja",
  dict: dictionaries.ja,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ja");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("lang");
      if (saved === "en" || saved === "ja") setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Persist only on an explicit toggle: persisting from an effect wrote the default
  // "ja" back to storage on mount, and React StrictMode then re-read that value.
  const toggle = () =>
    setLang((l) => {
      const next = l === "ja" ? "en" : "ja";
      try {
        window.localStorage.setItem("lang", next);
      } catch {}
      return next;
    });

  return (
    <LangContext.Provider value={{ lang, dict: dictionaries[lang] as Dict, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
