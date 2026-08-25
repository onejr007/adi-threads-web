import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADI Sosmed — Engine Otomasi Multi-Platform Social Media",
  description: "Otomatisasi posting, komentar, dan growth di Threads, X, Instagram, TikTok, dan lainnya. Satu dashboard untuk semua platform, ditenagai Ekosistem ADI & Protokol ADILANG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
      </head>
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased min-h-screen flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
