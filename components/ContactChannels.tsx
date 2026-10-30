"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useLang } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";
import ChatworkPanel from "@/components/ChatworkPanel";

type Channel = "mail" | "chatwork";

const ICONS: Record<Channel, { src: string; alt: string }> = {
  mail: { src: "/icons/gmail.svg", alt: "Gmail" },
  chatwork: { src: "/icons/chatwork.png", alt: "Chatwork" },
};

/* Brand logo in a rotating brand-colour ring; styles in globals.scss (contact channels). */
function ChannelIcon({ channel, size }: { channel: Channel; size: "lg" | "sm" }) {
  return (
    <span className={`ch-icon${size === "sm" ? " ch-icon--sm" : ""}`} data-channel={channel}>
      <span className="ch-icon__glow" aria-hidden="true" />
      <span className="ch-icon__ring" aria-hidden="true" />
      {size === "lg" && <span className="ch-icon__ripple" aria-hidden="true" />}
      <span className="ch-icon__tile">
        <img src={ICONS[channel].src} alt={ICONS[channel].alt} />
      </span>
    </span>
  );
}

function ChannelModal({
  channel,
  open,
  onClose,
  title,
  eyebrow,
  closeLabel,
  children,
}: {
  channel: Channel;
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow: string;
  closeLabel: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size={{ base: "full", md: channel === "mail" ? "xl" : "md" }}
      placement="center"
      scrollBehavior="inside"
      motionPreset="slide-in-bottom"
      lazyMount
    >
      <Portal>
        <Dialog.Backdrop bg="rgba(8,8,10,0.72)" backdropFilter="blur(10px)" />
        {/* data-lenis-prevent: wheel events over the modal must not scroll the page behind it */}
        <Dialog.Positioner data-lenis-prevent>
          <Dialog.Content
            bg="#151515"
            color="#f5f5f5"
            borderWidth="1px"
            borderColor="rgba(245,245,245,0.12)"
            rounded={{ base: "none", md: "2xl" }}
            // the "full" size on mobile sets a full-height minimum that the md size doesn't reset
            minH={{ base: "100dvh", md: "auto" }}
            boxShadow="0 30px 80px rgba(0,0,0,0.6)"
          >
            <Dialog.Header px={{ base: "6", md: "9" }} pt={{ base: "7", md: "9" }} pb="2">
              <div className="flex items-center gap-4">
                <ChannelIcon channel={channel} size="sm" />
                <div>
                  <p
                    className={`font-serifEn text-[11px] tracking-[0.28em] ${
                      channel === "mail" ? "text-[#ff5a72]" : "text-nexora-glow"
                    }`}
                  >
                    {eyebrow}
                  </p>
                  <Dialog.Title asChild>
                    <h3 className="mt-1 font-serifJa text-xl font-medium tracking-wide text-white md:text-2xl">{title}</h3>
                  </Dialog.Title>
                </div>
              </div>
            </Dialog.Header>
            <Dialog.Body px={{ base: "6", md: "9" }} pt="5" pb={{ base: "10", md: "9" }}>
              {children}
            </Dialog.Body>
            <Dialog.CloseTrigger asChild top="4" insetEnd="4">
              <CloseButton
                size="sm"
                aria-label={closeLabel}
                color="rgba(245,245,245,0.8)"
                rounded="full"
                _hover={{ bg: "rgba(255,255,255,0.08)", color: "white" }}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default function ContactChannels() {
  const { dict } = useLang();
  const c = dict.contact;
  const [open, setOpen] = useState<Channel | null>(null);

  const channels: { id: Channel; eyebrow: string; title: string; sub: string }[] = [
    { id: "mail", eyebrow: "E-MAIL", title: c.channels.mailTitle, sub: c.channels.mailSub },
    { id: "chatwork", eyebrow: "CHATWORK", title: c.channels.chatworkTitle, sub: c.channels.chatworkSub },
  ];

  // feeds the card's pointer-following spotlight
  const trackPointer = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div className="mx-auto mt-[clamp(36px,4vw,64px)] w-[min(920px,calc(100%-48px))]">
      <p className="mb-5 text-center text-xs tracking-[0.2em] text-white/45">{c.channels.label}</p>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {channels.map((ch) => (
          <button
            key={ch.id}
            type="button"
            aria-haspopup="dialog"
            data-channel={ch.id}
            onClick={() => setOpen(ch.id)}
            onPointerMove={trackPointer}
            className="ch-card"
          >
            <ChannelIcon channel={ch.id} size="lg" />
            <span className="min-w-0 flex-1">
              <span className="ch-card__eyebrow">{ch.eyebrow}</span>
              <span className="ch-card__title">{ch.title}</span>
              <span className="ch-card__sub">{ch.sub}</span>
            </span>
            <span className="ch-card__arrow" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <ChannelModal
        channel="mail"
        open={open === "mail"}
        onClose={() => setOpen(null)}
        eyebrow="E-MAIL"
        title={c.formTitle}
        closeLabel={c.close}
      >
        <p className="mb-7 text-sm leading-7 text-white/60">{c.formNote}</p>
        <ContactForm />
      </ChannelModal>

      <ChannelModal
        channel="chatwork"
        open={open === "chatwork"}
        onClose={() => setOpen(null)}
        eyebrow="CHATWORK"
        title={c.chatwork.title}
        closeLabel={c.close}
      >
        <ChatworkPanel />
      </ChannelModal>
    </div>
  );
}
