"use client";

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import type { ReactNode } from "react";

const config = defineConfig({
  // app/globals.scss owns the reset and base element styles. The preflight is scoped to
  // a selector that never matches rather than turned off: with `preflight: false` Chakra
  // emits an empty `@layer reset` that runs into the next rule, and the browser then
  // drops the whole base layer — including the keyframes dialogs need to close.
  preflight: { scope: "[data-chakra-preflight]" },
  cssVarsPrefix: "ck",
  globalCss: {
    // revert-layer cancels Chakra's default base styles, so the page looks exactly as
    // app/globals.scss and the browser defaults make it (e.g. body's "palt" still inherits)
    "*": { fontFeatureSettings: "revert-layer" },
    html: { colorPalette: "blue", color: "revert-layer", bg: "revert-layer", lineHeight: "revert-layer" },
    "*::placeholder, *[data-placeholder]": { color: "revert-layer" },
    "*::selection": { bg: "revert-layer" },
  },
  theme: {
    tokens: {
      colors: {
        nexora: {
          ink: { value: "#121212" },
          text: { value: "#f5f5f5" },
          muted: { value: "#a2a2a2" },
          red: { value: "#e81c3c" },
          blue: { value: "#2f7bff" },
          glow: { value: "#7cc4ff" },
        },
      },
      fonts: {
        heading: { value: "var(--font-mincho), serif" },
        body: { value: "var(--font-noto), sans-serif" },
        mono: { value: "var(--font-cormorant), serif" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);

export function Provider({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
