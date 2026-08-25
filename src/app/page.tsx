"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "./lp.css";

const platforms = [
  { name: "Threads", status: "live" },
  { name: "X / Twitter", status: "live" },
  { name: "Instagram", status: "dev" },
  { name: "TikTok", status: "dev" },
  { name: "Facebook", status: "dev" },
  { name: "LinkedIn", status: "dev" },
];

const demoPosts = [
  {
    mode: "post_biasa",
    label: "Postingan Biasa",
    text: "Kabar gembira: hari ini kami baru saja meluncurkan fitur auto-scheduling yang diminta banyak pengguna. Cek dashboard kamu sekarang.",
    platform: "threads",
  },
  {
    mode: "post_multi_thread",
    label: "Utasan Bersambung",
    text: "1/4 — Ada 3 mitos tentang otomasi social media yang perlu kita luruskan. Banyak yang bilang: otomasi = spam. Itu tidak benar.",
    platform: "threads",
  },
  {
    mode: "post_biasa_image",
    label: "Postingan + Gambar",
    text: "Behind the scenes: ini yang terjadi di ADI HQ tiap kali kami deploy fitur baru. Tim engineering sudah bekerja 18 jam nonstop.",
    platform: "threads",
  },
  {
    mode: "post_soft_selling_adiplay",
    label: "Soft Sell — ADI Play",
    text: "Kalau kamu mencari cara untuk tracking performa konten tanpa ribet, coba ADI Play. Bukan cuma analytics, tapi gameplay yang bikin kamu tetap konsisten.",
    platform: "threads",
    link: "https://play.myadi.my.id",
  },
  {
    mode: "post_soft_selling_adinews",
    label: "Soft Sell — ADI News",
    text: "Berita dunia kreator digital bertambah cepat. ADI News membantu kamu tetap update tanpa harus scroll feed seharian. Auto-curated, human-edited.",
    platform: "threads",
    link: "https://news.myadi.my.id",
  },
  {
    mode: "post_copy_paste_viral",
    label: "Remix Viral",
    text: "Viral thread hari ini ngomongin produktivitasRemote. Poinnya: bukan soal tools, tapi sistem. Alasan kami build ADI Engine exactly for this.",
    platform: "threads",
  },
];

const liveStats = [
  { label: "Kirim terekam (24j)", value: 1247, suffix: "" },
  { label: "Akun aktif", value: 83, suffix: "" },
  { label: "Engagement rata-rata", value: 4.2, suffix: "%" },
  { label: "Uptime engine", value: 99.97, suffix: "%" },
];

const features = [
  { title: "Multi-platform agent", desc: "Satu agent mengelola Threads dan X dari satu dashboard; Instagram, TikTok, Facebook, dan LinkedIn menyusul.", meta: "threads · x" },
  { title: "Pola posting manusiawi", desc: "Jeda acak antar kiriman, ritme mengikuti jam aktif audiens — bukan tembakan bot tiap jam tepat.", meta: "anti-spam" },
  { title: "Kompresi prompt ADILANG", desc: "Prompt dipadatkan sebelum ke LLM teks; biaya API turun sampai 80% tanpa menurunkan kualitas konten.", meta: "hemat kuota" },
  { title: "Cross-post otomatis", desc: "Satu konten disesuaikan bentuknya per platform lalu dikirim berurutan sesuai jadwal siar.", meta: "1 → banyak" },
  { title: "Mesin engagement", desc: "Balas komentar, kejar thread relevan, rawat komunitas — dengan kuota harian yang terkontrol.", meta: "10x/hari gratis" },
  { title: "Analitik terpadu", desc: "Kinerja tiap kiriman, pertumbuhan pengikut, dan riwayat versi konten dalam satu layar.", meta: "satu layar" },
];

const demoTimes = ["06:12", "08:47", "11:03", "13:26", "16:58", "19:41"];

type Toast = { id: number; text: string; type: "success" | "info" | "warn" };

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [liveCounter, setLiveCounter] = useState(1247);

  const addToast = useCallback((text: string, type: Toast["type"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adi_saas_token");
    if (token) {
      fetch(`/api/v1/threads/user/quota?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success" && data.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }

    (window as any).onHCaptchaSuccess = (token: string) => setHcaptchaToken(token);
    (window as any).onHCaptchaExpired = () => setHcaptchaToken("");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter((c) => c + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const runDemo = useCallback(() => {
    setDemoRunning(true);
    setDemoStep(0);
    addToast("Demo dimulai: engine connecting...", "info");

    const delays = [800, 1800, 2800, 4200, 5600, 7200];
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setDemoStep(i + 1);
        const post = demoPosts[i];
        if (i === 0) addToast(`Menggali thread relevan untuk niche kamu...`, "info");
        if (i === 1) addToast(`Ditemukan 3 topik panas. Memilih yang paling engage...`, "info");
        if (i === 2) addToast(`Konten siap. Mode: ${post.label}`, "info");
        if (i === 3) addToast(`Mengirim ke Threads API...`, "info");
        if (i === 4) addToast(`Postingan terkirim! ID: ${Math.random().toString(36).slice(2, 10).toUpperCase()}`, "success");
        if (i === 5) {
          addToast(`Siklus selesai. Menunggu 2 jam sebelum posting berikutnya.`, "success");
          setTimeout(() => setDemoRunning(false), 600);
        }
      }, delay);
    });
  }, [addToast]);

  const triggerOAuth = (provider: string) => {
    let token = hcaptchaToken;
    if (!token && (window as any).hcaptcha) token = (window as any).hcaptcha.getResponse();
    if (!token) {
      alert(`Verifikasi hCaptcha terlebih dahulu sebelum login ${provider.toUpperCase()}.`);
      return;
    }
    window.location.href = `/api/v1/threads/auth/oauth/${provider}?_t=${Date.now()}&captcha_token=${encodeURIComponent(token)}`;
  };

  const submitAuthForm = async (e: React.FormEvent) => {
    e.preventDefault();
    let token = hcaptchaToken;
    if (!token && (window as any).hcaptcha) token = (window as any).hcaptcha.getResponse();
    if (!token) {
      alert("Harap verifikasi hCaptcha terlebih dahulu!");
      return;
    }
    const endpoint = authTab === "register" ? "/api/v1/threads/auth/register" : "/api/v1/threads/auth/login";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, captcha_token: token }),
      });
      const data = await res.json();
      if (data.status === "success" || data.session_token) {
        localStorage.setItem("adi_saas_token", data.session_token);
        setCurrentUser(data.user);
        setShowAuthModal(false);
        window.location.href = "/dashboard";
      } else {
        alert("Auth Gagal: " + (data.message || "Error"));
      }
    } catch (err) {
      alert("Gagal menghubungi server auth");
    }
  };

  return (
    <div className="lp-root">
      {/* TOASTS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="lp-toast"
            style={{
              borderLeftColor:
                t.type === "success" ? "#3f6212" : t.type === "warn" ? "#a16207" : "var(--accent)",
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* MASTHEAD */}
      <nav className="sticky top-0 z-40 border-b lp-hairline" style={{ background: "var(--paper)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="lp-serif text-xl font-semibold tracking-tight whitespace-nowrap">
            ADISosmed
          </Link>
          <span className="hidden md:block lp-kicker flex-1 text-center">
            Mesin kehadiran sosial media · aio ekosistem adi
          </span>
          <div className="flex items-center gap-4 whitespace-nowrap">
            {currentUser ? (
              <>
                {currentUser.email === "chilooks91@gmail.com" && (
                  <Link href="/admin" className="lp-mono text-xs uppercase tracking-[0.14em] lp-link" style={{ color: "var(--accent)" }}>
                    Admin
                  </Link>
                )}
                <Link href="/tickets" className="lp-mono text-xs uppercase tracking-[0.14em] lp-link">
                  Tiket
                </Link>
                <Link href="/dashboard" className="lp-mono text-xs uppercase tracking-[0.14em] lp-link">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthTab("login"); setShowAuthModal(true); }} className="lp-mono text-xs uppercase tracking-[0.14em] lp-link cursor-pointer">
                  Masuk
                </button>
                <button onClick={() => { setAuthTab("register"); setShowAuthModal(true); }} className="lp-mono text-xs uppercase tracking-[0.14em] px-4 py-2 cursor-pointer" style={{ background: "var(--ink)", color: "var(--paper)" }}>
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pt-20 pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8">
            <p className="lp-kicker mb-8">
              Mesin siar harian <strong>· {liveCounter.toLocaleString()} kiriman bulan ini</strong>
            </p>
            <h1 className="lp-serif lp-headline">
              Hadir setiap hari,
              <br />
              <em>tanpa buka aplikasinya.</em>
            </h1>
            <p className="lp-body text-lg leading-relaxed mt-8 max-w-xl" style={{ color: "var(--ink-soft)" }}>
              ADISosmed menjaga akun sosial media Anda tetap hidup: posting
              terjadwal, komentar yang dijawab, thread relevan yang dikejar —
              dengan ritme yang terbaca manusiawi, bukan tembakan bot.
            </p>
            <div className="flex flex-wrap items-center gap-5 mt-10">
              <button
                onClick={() => {
                  if (currentUser) window.location.href = "/dashboard";
                  else { setAuthTab("register"); setShowAuthModal(true); }
                }}
                className="lp-btn"
              >
                Mulai gratis — 10x/hari
              </button>
              <button onClick={runDemo} disabled={demoRunning} className="lp-btn lp-btn-ghost">
                {demoRunning ? "Siklus berjalan…" : "Jalankan siklusnya"}
              </button>
            </div>

            {/* Platform: daftar mono, tanda † untuk yang masih dev */}
            <p className="lp-mono text-xs mt-12 leading-relaxed" style={{ color: "var(--ink-faint)" }}>
              {platforms.map((p, i) => (
                <span key={p.name}>
                  <span style={{ color: p.status === "live" ? "var(--ink)" : undefined }}>{p.name}</span>
                  {p.status === "dev" && "†"}
                  {i < platforms.length - 1 && "  ·  "}
                </span>
              ))}
            </p>
            <p className="lp-mono text-[10px] mt-1" style={{ color: "var(--ink-faint)" }}>
              † sedang dibangun
            </p>
          </div>

          {/* Panel jadwal siar */}
          <aside className="lg:col-span-4">
            <div className="lp-panel">
              <div className="lp-panel-inner">
                <p className="lp-kicker mb-5">Lembar siar hari ini</p>
                <ol className="space-y-3">
                  {demoPosts.slice(0, 5).map((post, i) => (
                    <li key={post.mode} className="flex items-baseline gap-3">
                      <span className="lp-mono text-xs" style={{ color: "var(--accent)" }}>{demoTimes[i]}</span>
                      <span className="lp-body italic truncate">{post.label}</span>
                    </li>
                  ))}
                </ol>
                <p className="lp-mono text-[11px] leading-relaxed mt-6 pt-4 border-t lp-hairline" style={{ color: "var(--ink-faint)" }}>
                  Jeda antar kiriman diacak. Engine berhenti otomatis bila
                  kuota harian habis — akun Anda tidak pernah terlihat seperti spam.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* STATISTIK: baris kawat, bukan kartu */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 mt-20 border-t border-b lp-hairline">
          {liveStats.map((s, i) => (
            <div key={i} className={`py-6 px-4 text-center ${i > 0 ? "sm:border-l lp-hairline" : ""}`}>
              <div className="lp-serif text-3xl font-medium">
                {i === 0 ? liveCounter.toLocaleString() : s.value}{s.suffix}
              </div>
              <div className="lp-kicker mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section className="px-6 py-24" style={{ background: "var(--paper-deep)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <h2 className="lp-serif text-3xl sm:text-4xl font-medium tracking-tight max-w-lg leading-tight">
              Satu siklus, enam mode <em>kirim.</em>
            </h2>
            <div className="flex items-center gap-3">
              <span
                className="lp-tag lp-mono"
                style={{ color: demoRunning ? "var(--accent)" : "var(--ink-faint)" }}
              >
                {demoRunning ? "● live" : "○ idle"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kiri: daftar mode */}
            <div>
              {demoPosts.map((post, i) => (
                <div key={post.mode} className="flex items-baseline gap-4 py-3 border-t last:border-b lp-hairline">
                  <span className="lp-mono text-xs shrink-0" style={{ color: demoStep > i ? "var(--accent)" : "var(--ink-faint)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <span className="lp-body italic">{post.label}</span>
                    {demoStep > i && <span className="lp-mono text-[9px] uppercase tracking-widest ml-3" style={{ color: "var(--accent)" }}>selesai</span>}
                  </div>
                  <span className="hidden sm:block lp-toc-dots flex-1" />
                  <span className="hidden lg:block lp-body text-xs truncate max-w-[220px]" style={{ color: "var(--ink-faint)" }}>
                    {post.text.split(".")[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* Kanan: kliping feed */}
            <div className="space-y-3">
              {demoPosts.map((post, i) => {
                const isActive = demoStep === i + 1;
                const isDone = demoStep > i + 1;
                return (
                  <article
                    key={post.mode}
                    className={`lp-clip ${isActive ? "lp-clip-active" : isDone ? "lp-clip-done" : "lp-clip-idle"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="lp-mono text-[10px] tracking-wider" style={{ color: "var(--ink-faint)" }}>
                        @adi_agent · {demoTimes[i]} WIB
                      </span>
                      <span className="ml-auto">
                        {isActive && (
                          <span className="lp-tag lp-mono animate-pulse" style={{ color: "var(--accent)" }}>mengirim</span>
                        )}
                        {isDone && (
                          <span className="lp-tag lp-mono" style={{ color: "#3f6212" }}>terkirim</span>
                        )}
                      </span>
                    </div>
                    <p className="lp-body text-sm leading-relaxed">{post.text}</p>
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noreferrer" className="lp-mono text-[11px] lp-link inline-block mt-2">
                        {post.link}
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FITUR: baris editorial, tanpa ikon dekoratif */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="lp-serif text-3xl sm:text-4xl font-medium tracking-tight mb-12 max-w-xl leading-tight">
            Yang dikerjakan mesin ini <em>setiap hari.</em>
          </h2>
          <div>
            {features.map((f) => (
              <div key={f.title} className="lp-row">
                <span className="lp-mono text-xs" style={{ color: "var(--accent)" }}>—</span>
                <h3 className="lp-serif italic text-xl">{f.title}</h3>
                <p className="lp-row-desc lp-body leading-relaxed max-w-xl" style={{ color: "var(--ink-soft)" }}>
                  {f.desc}
                </p>
                <span className="lp-mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap" style={{ color: "var(--ink-faint)" }}>
                  {f.meta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 border-t pt-12 lp-hairline">
          {[
            { num: "01", title: "Hubungkan akun", desc: "OAuth sekali klik. Token disimpan terenkripsi end-to-end." },
            { num: "02", title: "Atur strategi", desc: "Pilih niche, gaya bahasa, dan frekuensi siar harian." },
            { num: "03", title: "Biarkan berjalan", desc: "Engine posting dan engaged 24/7; Anda cukup memantau." },
          ].map((step) => (
            <div key={step.num}>
              <div className="lp-mono text-sm mb-3" style={{ color: "var(--accent)" }}>{step.num}</div>
              <h3 className="lp-serif italic text-2xl mb-2">{step.title}</h3>
              <p className="lp-body text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA: blok tinta inversi */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center px-8 py-16" style={{ background: "var(--ink)", color: "var(--paper)" }}>
          <h2 className="lp-serif text-3xl sm:text-4xl font-medium tracking-tight">
            Akun yang jarang post, jarang diingat.
          </h2>
          <p className="lp-body mt-4" style={{ color: "#b9b19e" }}>
            Gratis 10x posting dan 10x komentar setiap hari. Tanpa kartu kredit,
            setup dua menit.
          </p>
          <div className="mt-8">
            <button
              onClick={() => {
                if (currentUser) window.location.href = "/dashboard";
                else { setAuthTab("register"); setShowAuthModal(true); }
              }}
              className="lp-btn"
              style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--paper)" }}
            >
              Mulai sekarang — gratis
            </button>
          </div>
        </div>
      </section>

      {/* COLOPHON */}
      <footer className="border-t lp-hairline px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="lp-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ink-faint)" }}>
            ADISosmed · bagian dari ekosistem ADI
          </p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="lp-mono text-[11px] uppercase tracking-[0.16em] lp-link">Dashboard</Link>
            <Link href="/tickets" className="lp-mono text-[11px] uppercase tracking-[0.16em] lp-link">Tiket</Link>
            <a href="https://myadi.my.id" target="_blank" rel="noreferrer" className="lp-mono text-[11px] uppercase tracking-[0.16em] lp-link">Ekosistem ADI</a>
          </div>
          <p className="lp-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ink-faint)" }}>
            © 2026 Bagas Adi Pratama S,Kom.
          </p>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center lp-overlay p-4">
          <div className="w-full max-w-md relative" style={{ background: "var(--paper-deep)", border: "1px solid var(--ink)", boxShadow: "8px 8px 0 0 rgba(33,29,21,0.25)" }}>
            <button onClick={() => setShowAuthModal(false)} aria-label="Tutup" className="absolute top-3 right-4 text-xl leading-none cursor-pointer" style={{ color: "var(--ink-faint)" }}>
              ×
            </button>
            <div className="m-1.5 p-7 space-y-6" style={{ border: "1px solid var(--line)" }}>
              <div className="flex gap-6 border-b lp-hairline pb-3">
                <button onClick={() => setAuthTab("register")} className={`lp-body italic text-base cursor-pointer ${authTab === "register" ? "" : ""}`} style={authTab === "register" ? { color: "var(--accent)", textDecoration: "underline", textDecorationColor: "var(--accent)", textUnderlineOffset: 5 } : { color: "var(--ink-faint)" }}>
                  Daftar baru
                </button>
                <button onClick={() => setAuthTab("login")} className="lp-body italic text-base cursor-pointer" style={authTab === "login" ? { color: "var(--accent)", textDecoration: "underline", textDecorationColor: "var(--accent)", textUnderlineOffset: 5 } : { color: "var(--ink-faint)" }}>
                  Masuk sesi
                </button>
              </div>

              <div className="space-y-2.5">
                <button onClick={() => triggerOAuth("google")} className="lp-btn lp-btn-ghost lp-btn-plain w-full cursor-pointer">
                  Lanjutkan dengan Google
                </button>
                <button onClick={() => triggerOAuth("github")} className="lp-btn lp-btn-ghost lp-btn-plain w-full cursor-pointer">
                  Lanjutkan dengan GitHub
                </button>
              </div>

              <div className="relative text-center border-b lp-hairline py-1">
                <span className="px-2 lp-kicker relative -top-3" style={{ background: "var(--paper-deep)" }}>
                  atau dengan password
                </span>
              </div>

              <form onSubmit={submitAuthForm} className="space-y-6">
                {authTab === "register" && (
                  <div>
                    <label className="lp-kicker block mb-1">Nama lengkap</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Bagas Adi" className="lp-field" />
                  </div>
                )}
                <div>
                  <label className="lp-kicker block mb-1">Alamat email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@domain.com" className="lp-field" />
                </div>
                <div>
                  <label className="lp-kicker block mb-1">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="lp-field" />
                </div>

                <div className="p-4 space-y-2" style={{ border: "1px solid var(--line)", background: "var(--paper)" }}>
                  <label className="block lp-kicker">Verifikasi keamanan hCaptcha</label>
                  <div className="flex justify-center my-2 min-h-[78px]">
                    <div className="h-captcha" data-sitekey="169e06e6-008a-4592-a63a-8e6874786af0" data-callback="onHCaptchaSuccess" data-expired-callback="onHCaptchaExpired"></div>
                  </div>
                </div>

                <button type="submit" className="lp-btn w-full justify-center">
                  {authTab === "register" ? "Daftar akun gratis (10x/hari)" : "Masuk ke dashboard"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
