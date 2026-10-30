/* Delivers a contact-form inquiry to the site owner's inbox through FormSubmit
 * (https://formsubmit.co): the visitor's browser posts the inquiry, and FormSubmit
 * forwards it by e-mail. No server, SMTP account or password is involved.
 *
 * One-time setup: the very first submission makes FormSubmit send an
 * "Activate Form" e-mail to CONTACT_EMAIL; until that link is clicked,
 * submissions are not forwarded.
 */
import type { Budget, ContactInput, InquiryType } from "./schema";

/** The inbox that receives every inquiry. */
export const CONTACT_EMAIL = "sakura.freetech@gmail.com";

/* After activation FormSubmit e-mails a random alias for the address; putting it in
   NEXT_PUBLIC_FORMSUBMIT_ID keeps the real address out of the page source. */
const FORM_ID = process.env.NEXT_PUBLIC_FORMSUBMIT_ID || CONTACT_EMAIL;
const ENDPOINT = `https://formsubmit.co/ajax/${FORM_ID}`;

/* The owner reads inquiries in Japanese, whatever language the visitor used. */
const TYPE_LABEL: Record<InquiryType, string> = {
  web: "Web制作（LP・HP）",
  ec: "ECサイト",
  app: "モバイルアプリ",
  system: "業務システム・Webアプリ",
  ai: "生成AI・業務効率化",
  other: "その他",
};

const BUDGET_LABEL: Record<Budget, string> = {
  undecided: "未定・相談したい",
  lt30: "〜30万円",
  "30to100": "30万〜100万円",
  "100to300": "100万〜300万円",
  gt300: "300万円〜",
};

export type SendResult = { ok: true } | { ok: false; reason: "delivery_failed" | "network" };

export async function sendInquiry(data: ContactInput, lang: "ja" | "en"): Promise<SendResult> {
  const payload = {
    _subject: `【NEXORA】お問い合わせ：${TYPE_LABEL[data.type]}（${data.name} 様）`,
    _template: "table",
    _captcha: "false",
    _replyto: data.email,
    お名前: data.name,
    メールアドレス: data.email,
    ご相談の種類: TYPE_LABEL[data.type],
    ご予算: BUDGET_LABEL[data.budget],
    ご相談内容: data.message,
    閲覧言語: lang === "ja" ? "日本語" : "English",
  };

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  const body = (await res.json().catch(() => null)) as { success?: string | boolean; message?: string } | null;
  // FormSubmit answers 200 with success "false" while the form still awaits activation
  if (res.ok && (body?.success === true || body?.success === "true")) return { ok: true };
  if (body?.message) console.warn("[contact] FormSubmit:", body.message);
  return { ok: false, reason: "delivery_failed" };
}
