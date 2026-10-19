import type { Metadata } from "next";
import { Cormorant_Infant, Noto_Sans_JP, Shippori_Mincho_B1 } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import { Provider } from "@/components/ui/provider";
import "./tailwind.css";
import "./globals.scss";

const cormorant = Cormorant_Infant({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

const mincho = Shippori_Mincho_B1({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mincho",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXORA | Senior Full-Stack Engineer — Web, Mobile & AI",
  description:
    "シニア・フルスタックエンジニアのポートフォリオ。UXを軸にしたWebデザイン・Web制作（LP・HP・EC）、AWSを基盤とした大規模EC、業務システム・Webアプリ、iOS / Androidアプリ、生成AIソリューションまで、要件分析から実装・リリースまでを一貫して手がけます。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`dark ${cormorant.variable} ${noto.variable} ${mincho.variable}`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body>
        <Provider>
          <LanguageProvider>{children}</LanguageProvider>
        </Provider>
      </body>
    </html>
  );
}
