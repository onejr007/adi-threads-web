import type { Metadata } from "next";
import { Fraunces, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Tipografi editorial keluarga ADI — dipakai halaman landing via .lp-*.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-body",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ADISosmed — Mesin Kehadiran Sosial Media Harian",
  description:
    "Akun Threads yang hadir setiap hari: posting, komentar, dan balasan dengan pola manusiawi. Gratis 10x posting & 10x komentar per hari.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`dark ${fraunces.variable} ${newsreader.variable} ${jetbrains.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
