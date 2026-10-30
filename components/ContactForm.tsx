"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button, Checkbox, Field, Input, NativeSelect, Textarea } from "@chakra-ui/react";
import { useLang } from "@/lib/i18n";
import { sendInquiry } from "@/lib/contact/send";
import {
  BUDGETS,
  INQUIRY_TYPES,
  LIMITS,
  validateContact,
  type ErrorCode,
  type FieldErrors,
  type FieldName,
} from "@/lib/contact/schema";

type Values = {
  name: string;
  email: string;
  type: string;
  budget: string;
  message: string;
  consent: boolean;
  website: string;
};

const EMPTY: Values = {
  name: "",
  email: "",
  type: "",
  budget: "undecided",
  message: "",
  consent: false,
  website: "",
};

const FIELD_ORDER: FieldName[] = ["name", "email", "type", "budget", "message", "consent"];

const controlStyles = {
  bg: "rgba(255,255,255,0.03)",
  borderColor: "rgba(245,245,245,0.18)",
  color: "#f5f5f5",
  rounded: "lg",
  _placeholder: { color: "rgba(245,245,245,0.35)" },
  _hover: { borderColor: "rgba(245,245,245,0.35)" },
  _focusVisible: {
    borderColor: "#7cc4ff",
    boxShadow: "0 0 0 1px #7cc4ff, 0 0 18px rgba(47,123,255,0.35)",
    outline: "none",
  },
  _invalid: { borderColor: "#ff5a72", boxShadow: "0 0 0 1px #ff5a72" },
} as const;

const labelStyles = {
  color: "rgba(245,245,245,0.85)",
  fontSize: "sm",
  letterSpacing: "0.06em",
  display: "flex",
  alignItems: "center",
  minH: "6",
} as const;

export default function ContactForm() {
  const { lang, dict } = useLang();
  const c = dict.contact;
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (attempted) {
      const r = validateContact(next);
      setErrors(r.ok ? {} : r.errors);
    }
  };

  const message = (field: FieldName, code?: ErrorCode) => {
    if (!code) return null;
    const e = c.errors;
    switch (code) {
      case "required":
        if (field === "consent") return e.consent;
        if (field === "type") return e.requiredSelect;
        return e.required;
      case "invalid":
        return field === "email" ? e.invalidEmail : e.invalid;
      case "tooLong":
        return e.tooLong.replace("{max}", String(LIMITS[field as keyof typeof LIMITS] ?? ""));
      case "tooShort":
        return e.tooShort.replace("{min}", String(LIMITS.messageMin));
    }
  };

  const focusFirstError = (errs: FieldErrors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    setSubmitError(null);

    const r = validateContact(values);
    if (!r.ok) {
      setErrors(r.errors);
      focusFirstError(r.errors);
      return;
    }
    setErrors({});
    setStatus("sending");

    // honeypot filled: a bot — show success without sending anything
    const result = values.website.trim() ? ({ ok: true } as const) : await sendInquiry(r.data, lang);
    if (result.ok) {
      setStatus("sent");
      setValues(EMPTY);
      setAttempted(false);
      return;
    }
    setSubmitError(c.submitErrors[result.reason]);
    setStatus("idle");
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-nexora-blue/15 text-2xl text-nexora-glow shadow-[0_0_24px_rgba(47,123,255,0.35)]">
          ✓
        </span>
        <h3 className="font-serifJa text-2xl tracking-wide text-white">{c.successTitle}</h3>
        <p className="text-sm leading-7 text-white/70">{c.successBody}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm text-nexora-glow underline-offset-4 hover:underline"
        >
          {c.again}
        </button>
      </div>
    );
  }

  const sending = status === "sending";
  // both badges share one box size so required and optional labels have equal height
  const badge = "ml-2 inline-flex h-5 items-center rounded-full border px-2 text-[10px] leading-none tracking-wider";
  const req = <span className={`${badge} border-transparent bg-nexora-red/15 text-[#ff8a9b]`}>{c.required}</span>;
  const opt = <span className={`${badge} border-white/15 text-white/45`}>{c.optional}</span>;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative flex flex-col gap-6" aria-busy={sending}>
      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field.Root invalid={!!errors.name} required>
          <Field.Label {...labelStyles}>
            {c.fields.name}
            {req}
          </Field.Label>
          <Input
            name="name"
            size="lg"
            autoComplete="name"
            maxLength={LIMITS.name}
            placeholder={c.placeholders.name}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            {...controlStyles}
          />
          <Field.ErrorText>{message("name", errors.name)}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.email} required>
          <Field.Label {...labelStyles}>
            {c.fields.email}
            {req}
          </Field.Label>
          <Input
            name="email"
            type="email"
            size="lg"
            autoComplete="email"
            inputMode="email"
            maxLength={LIMITS.email}
            placeholder={c.placeholders.email}
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            {...controlStyles}
          />
          <Field.ErrorText>{message("email", errors.email)}</Field.ErrorText>
        </Field.Root>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field.Root invalid={!!errors.type} required>
          <Field.Label {...labelStyles}>
            {c.fields.type}
            {req}
          </Field.Label>
          <NativeSelect.Root size="lg">
            <NativeSelect.Field
              name="type"
              value={values.type}
              onChange={(e) => set("type", e.target.value)}
              {...controlStyles}
            >
              <option value="" disabled>
                {c.selectPlaceholder}
              </option>
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {c.types[t]}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator color="rgba(245,245,245,0.6)" />
          </NativeSelect.Root>
          <Field.ErrorText>{message("type", errors.type)}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.budget}>
          <Field.Label {...labelStyles}>
            {c.fields.budget}
            {opt}
          </Field.Label>
          <NativeSelect.Root size="lg">
            <NativeSelect.Field
              name="budget"
              value={values.budget}
              onChange={(e) => set("budget", e.target.value)}
              {...controlStyles}
            >
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {c.budgets[b]}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator color="rgba(245,245,245,0.6)" />
          </NativeSelect.Root>
          <Field.ErrorText>{message("budget", errors.budget)}</Field.ErrorText>
        </Field.Root>
      </div>

      <Field.Root invalid={!!errors.message} required>
        <Field.Label {...labelStyles}>
          {c.fields.message}
          {req}
        </Field.Label>
        <Textarea
          name="message"
          size="lg"
          rows={7}
          maxLength={LIMITS.message}
          placeholder={c.placeholders.message}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          resize="vertical"
          {...controlStyles}
        />
        <div className="flex w-full items-start justify-between gap-4">
          <Field.ErrorText>{message("message", errors.message)}</Field.ErrorText>
          <span className="ml-auto shrink-0 pt-1 text-xs tabular-nums text-white/40">
            {values.message.length} / {LIMITS.message}
          </span>
        </div>
      </Field.Root>

      <Field.Root invalid={!!errors.consent}>
        <Checkbox.Root
          name="consent"
          checked={values.consent}
          onCheckedChange={(e) => set("consent", e.checked === true)}
          colorPalette="blue"
          alignItems="flex-start"
          gap="3"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control borderColor="rgba(245,245,245,0.35)" mt="0.5">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label color="rgba(245,245,245,0.8)" fontSize="sm" lineHeight="1.7" fontWeight="normal">
            {c.consent}
          </Checkbox.Label>
        </Checkbox.Root>
        <Field.ErrorText>{message("consent", errors.consent)}</Field.ErrorText>
      </Field.Root>

      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-[#ff5a72]/40 bg-[#ff5a72]/10 px-4 py-3 text-sm leading-6 text-[#ffb3bf]"
        >
          {submitError}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          loading={sending}
          loadingText={c.sending}
          rounded="full"
          px="10"
          bg="#e81c3c"
          color="white"
          letterSpacing="0.08em"
          _hover={{ bg: "#ff3653", boxShadow: "0 0 24px rgba(232,28,60,0.45)" }}
          _focusVisible={{ outline: "2px solid #7cc4ff", outlineOffset: "3px" }}
        >
          {c.submit}
        </Button>
      </div>
    </form>
  );
}
