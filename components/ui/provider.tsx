"use client";

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import type { ReactNode } from "react";

const config = defineConfig({
  // app/globals.scss owns the reset and base element styles
  preflight: false,
  cssVarsPrefix: "ck",
  globalCss: {
    html: { colorPalette: "blue" },
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
