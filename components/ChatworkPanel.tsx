"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

export const CHATWORK_ID = "dfs32kr32";
export const CHATWORK_PROFILE_URL = `https://www.chatwork.com/${CHATWORK_ID}`;

/* Body of the Chatwork modal: how to send a contact request to the owner. */
export default function ChatworkPanel() {
  const { dict } = useLang();
  const cw = dict.contact.chatwork;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CHATWORK_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <p className="text-sm leading-7 text-white/65">{cw.body}</p>

      <ol className="mt-6 space-y-3 text-sm text-white/80">
        {cw.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-nexora-glow/40 font-serifEn text-xs text-nexora-glow">
              {i + 1}
            </span>
            <span className="pt-0.5 leading-6">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-7 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
        <span className="shrink-0 text-xs tracking-wider text-white/45">{cw.idLabel}</span>
        <code className="font-mono text-sm tracking-wider text-white">{CHATWORK_ID}</code>
        <button
          type="button"
          onClick={copy}
          className="ml-auto shrink-0 whitespace-nowrap rounded-full border border-solid border-white/20 px-3 py-1 text-xs text-white/75 transition-colors hover:border-white/50 hover:text-white"
          aria-live="polite"
        >
          {copied ? cw.copied : cw.copy}
        </button>
      </div>

      <a
        href={CHATWORK_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-nexora-blue px-6 py-3.5 text-sm tracking-wider text-white shadow-[0_0_24px_rgba(47,123,255,0.35)] transition-all hover:bg-[#4a8dff] hover:shadow-[0_0_36px_rgba(47,123,255,0.55)]"
      >
        {cw.open}
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
          ↗
        </span>
      </a>
    </div>
  );
}
