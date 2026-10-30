/* Contact form validation, shared by the browser form and the API route. */

export const INQUIRY_TYPES = ["web", "ec", "app", "system", "ai", "other"] as const;
export const BUDGETS = ["undecided", "lt30", "30to100", "100to300", "gt300"] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];
export type Budget = (typeof BUDGETS)[number];

export type ContactInput = {
  name: string;
  email: string;
  type: InquiryType;
  budget: Budget;
  message: string;
  consent: boolean;
};

export type FieldName = keyof ContactInput;
export type ErrorCode = "required" | "tooLong" | "tooShort" | "invalid";
export type FieldErrors = Partial<Record<FieldName, ErrorCode>>;

export const LIMITS = {
  name: 80,
  email: 254,
  messageMin: 10,
  message: 4000,
} as const;

/* Deliberately strict: no quoted local parts, comments or display names. The
   address becomes the Reply-To of the forwarded e-mail, so anything exotic is refused. */
const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,24}$/;

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Single-line value: control characters and line breaks removed, whitespace collapsed. */
export function cleanLine(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

/** Multi-line value: control characters removed except newlines and tabs. */
export function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").replace(CONTROL_CHARS, "").trim();
}

export function validateContact(
  raw: unknown
): { ok: true; data: ContactInput } | { ok: false; errors: FieldErrors } {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = cleanLine(src.name);
  if (!name) errors.name = "required";
  else if (name.length > LIMITS.name) errors.name = "tooLong";

  const email = cleanLine(src.email);
  if (!email) errors.email = "required";
  else if (email.length > LIMITS.email) errors.email = "tooLong";
  else if (!EMAIL_RE.test(email)) errors.email = "invalid";

  const type = cleanLine(src.type);
  if (!type) errors.type = "required";
  else if (!(INQUIRY_TYPES as readonly string[]).includes(type)) errors.type = "invalid";

  const budget = cleanLine(src.budget) || "undecided";
  if (!(BUDGETS as readonly string[]).includes(budget)) errors.budget = "invalid";

  const message = cleanText(src.message);
  if (!message) errors.message = "required";
  else if (message.length < LIMITS.messageMin) errors.message = "tooShort";
  else if (message.length > LIMITS.message) errors.message = "tooLong";

  if (src.consent !== true) errors.consent = "required";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name,
      email,
      type: type as InquiryType,
      budget: budget as Budget,
      message,
      consent: true,
    },
  };
}
