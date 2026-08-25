"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const features = [
  {
    icon: "fa-robot",
    title: "AI Agent Otonom",
    desc: "6 mode posting berjenjang yang bergilir otomatis: teks biasa, multi-thread, gambar, soft-sell ADI, dan remix viral.",
    color: "emerald",
  },
  {
    icon: "fa-shield-halved",
    title: "Stealth Protocol",
    desc: "Anti-detection engine dengan pola human-like, rate limit dinamis, dan proxy rotation. Akun tetap aman.",
    color: "cyan",
  },
  {
    icon: "fa-bolt",
    title: "ADILANG Compression",
    desc: "Protokol kompresi prompt IR khusus ADI. Hemat hingga 80% biaya token LLM tanpa mengurangi kualitas output.",
    color: "violet",
  },
  {
    icon: "fa-tower-broadcast",
    title: "Auto Cross-Post",
    desc: "Satu konten, beberapa platform. Otomatis cross-post ke Threads dan X (Twitter) dengan sekali klik.",
    color: "amber",
  },
  {
    icon: "fa-comments",
    title: "Engagement Otonom",
    desc: "Auto-reply komentar publik, scavenge thread relevan, dan bangun komunitas tanpa tangan.",
    color: "rose",
  },
  {
    icon: "fa-chart-line",
    title: "Analytics Real-time",
    desc: "Pantau performa posting, growth follower, dan engagement rate langsung dari dashboard.",
    color: "sky",
  },
];

const steps = [
  { num: "01", title: "Hubungkan Akun", desc: "Login dengan Google/GitHub atau email. One-click OAuth ke Meta Threads API." },
  { num: "02", title: "Atur Strategi", desc: "Pilih mode posting, frekuensi, dan niche. Atau biarkan AI yang menyesuaikan otomatis." },
  { num: "03", title: "Nonton & Skalakan", desc: "AI mulai posting, berkomentar, dan membangun audiens. Anda fokus pada bisnis." },
];

const stats = [
  { value: "50+", label: "Postingan/Hari", suffix: "" },
  { value: "80", label: "Hemat Token", suffix: "%" },
  { value: "99.9", label: "Uptime", suffix: "%" },
  { value: "24/7", label: "Otonom", suffix: "" },
];

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

    (window as any).onHCaptchaSuccess = (token: string) => {
      setHcaptchaToken(token);
    };
    (window as any).onHCaptchaExpired = () => {
      setHcaptchaToken("");
    };
  }, []);

  const triggerOAuth = (provider: string) => {
    let token = hcaptchaToken;
    if (!token && (window as any).hcaptcha) {
      token = (window as any).hcaptcha.getResponse();
    }
    if (!token) {
      alert(`Harap verifikasi hCaptcha terlebih dahulu sebelum login dengan ${provider.toUpperCase()}!`);
      return;
    }
    window.location.href = `/api/v1/threads/auth/oauth/${provider}?_t=${Date.now()}&captcha_token=${encodeURIComponent(token)}`;
  };

  const submitAuthForm = async (e: React.FormEvent) => {
    e.preventDefault();
    let token = hcaptchaToken;
    if (!token && (window as any).hcaptcha) {
      token = (window as any).hcaptcha.getResponse();
    }
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

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse-slow delay-300" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[140px] animate-pulse-slow delay-500" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* NAVBAR */}
      <nav className="relative w-full glass-panel border-b border-white/5 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl emerald-btn flex items-center justify-center font-black text-zinc-950 text-xl shadow-lg group-hover:scale-110 transition-transform">
              ⚡
              <div className="absolute inset-0 rounded-xl emerald-btn animate-pulse-ring opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide text-white">
                ADI <span className="text-emerald-400">THREADS</span>
              </span>
              <span className="block text-[9px] font-mono text-zinc-500 tracking-wider">
                AUTONOMOUS SOCIAL ENGINE
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                {currentUser.email === "chilooks91@gmail.com" && (
                  <Link
                    href="/admin"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all flex items-center"
                  >
                    <i className="fa-solid fa-crown mr-1.5"></i>Admin
                  </Link>
                )}
                <Link
                  href="/tickets"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 hover:bg-zinc-800/50 text-xs font-bold text-cyan-400 transition-all flex items-center"
                >
                  <i className="fa-solid fa-ticket mr-1.5"></i>Tiket
                </Link>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 hover:bg-zinc-800/50 text-xs font-bold text-emerald-400 transition-all flex items-center"
                >
                  <i className="fa-solid fa-gauge-high mr-1.5"></i>Dashboard
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setAuthTab("login"); setShowAuthModal(true); }}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => { setAuthTab("register"); setShowAuthModal(true); }}
                  className="px-4 py-2 text-xs font-bold text-white emerald-btn rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
                >
                  Coba Gratis
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-20 pb-16">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>ADI Engine v3.0 Active • Meta Threads Stealth Protocol</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] animate-fade-in-up delay-100">
            Otomasi Threads
            <br />
            <span className="text-gradient">Tanpa Batas, Tanpa Ribet</span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            AI Agent otonom pertama di Indonesia khusus Meta Threads. Posting, berkomentar, dan bangun audiens 24/7
            dengan 6 mode konten berjenjang. Hemat 80% token berkat protokol ADILANG.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-fade-in-up delay-300">
            <button
              onClick={() => {
                if (currentUser) window.location.href = "/dashboard";
                else { setAuthTab("register"); setShowAuthModal(true); }
              }}
              className="group px-8 py-4 rounded-2xl emerald-btn text-sm font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all flex items-center"
            >
              Mulai Gratis — 10x/Hari
              <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </button>
            <Link
              href="#features"
              className="px-8 py-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/50 hover:border-zinc-700/50 transition-all flex items-center"
            >
              <i className="fa-solid fa-play mr-2"></i>Lihat Cara Kerja
            </Link>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto animate-fade-in-up delay-400">
            {stats.map((stat, i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 space-y-1 hover:border-white/10 transition-colors">
                <div className="text-2xl sm:text-3xl font-extrabold text-gradient">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Semua yang kamu butuhkan,
              <br />
              <span className="text-gradient"> dalam satu engine</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Tidak perlu tools terpisah untuk scheduling, analytics, dan engagement.
              ADI Threads adalah all-in-one social automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const colorMap: any = {
                emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
                cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
                violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
                amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
                rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400",
                sky: "from-sky-500/20 to-sky-500/5 border-sky-500/20 text-sky-400",
              };
              return (
                <div
                  key={i}
                  className={`group relative p-6 rounded-3xl bg-gradient-to-br ${colorMap[f.color]} border backdrop-blur-xl hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="absolute inset-0 rounded-3xl animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-4">
                    <div className={`w-12 h-12 rounded-2xl bg-${f.color}-500/20 flex items-center justify-center text-lg`}>
                      <i className={`fa-solid ${f.icon}`}></i>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white mb-1.5">{f.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Mulai dalam
              <span className="text-gradient"> 3 langkah</span>
            </h2>
            <p className="text-zinc-400 text-sm">Tanpa konfigurasi rumit. Tanpa coding. Cuma klik dan jalan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="glass-panel rounded-3xl p-8 h-full hover:border-white/10 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-8xl font-black text-white/[0.02] leading-none select-none">
                    {step.num}
                  </div>
                  <div className="relative space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm">
                      {step.num}
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{step.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <i className="fa-solid fa-chevron-right text-zinc-700 text-xs"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass-panel rounded-[2rem] p-12 sm:p-16 text-center overflow-hidden glow-emerald">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px]" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl emerald-btn text-zinc-950 text-2xl font-black shadow-lg mx-auto">
                ⚡
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Siap otomatiskan Threads kamu?
              </h2>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto">
                Bergabung dengan ratusa pengguna yang sudah menggunakan ADI Threads untuk
                mengotomatisasi konten mereka. Gratis 10x posting per hari.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    if (currentUser) window.location.href = "/dashboard";
                    else { setAuthTab("register"); setShowAuthModal(true); }
                  }}
                  className="group px-8 py-4 rounded-2xl emerald-btn text-sm font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all flex items-center"
                >
                  Mulai Sekarang — Gratis
                  <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono">
                Tidak perlu kartu kredit • Setup 2 menit • Batas 10x/hari (gratis)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg emerald-btn flex items-center justify-center font-black text-zinc-950 text-sm">
              ⚡
            </div>
            <span className="text-xs font-bold text-zinc-500">
              ADI THREADS © 2025 — Autonomous Social Engine
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Dashboard</Link>
            <Link href="/tickets" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Tiket</Link>
            <a href="https://myadi.my.id" target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">ADI Ecosystem</a>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 space-y-5 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="flex border-b border-white/5 space-x-4 text-xs font-bold">
              <button
                onClick={() => setAuthTab("register")}
                className={`pb-2.5 transition-colors ${authTab === "register" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Daftar Baru
              </button>
              <button
                onClick={() => setAuthTab("login")}
                className={`pb-2.5 transition-colors ${authTab === "login" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Masuk Sesi
              </button>
            </div>

            {/* OAUTH BUTTONS */}
            <div className="space-y-2.5">
              <button
                onClick={() => triggerOAuth("google")}
                className="w-full py-3 rounded-xl bg-zinc-900/50 border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all"
              >
                <i className="fa-brands fa-google text-rose-400"></i>
                <span>Lanjutkan dengan Google</span>
              </button>
              <button
                onClick={() => triggerOAuth("github")}
                className="w-full py-3 rounded-xl bg-zinc-900/50 border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all"
              >
                <i className="fa-brands fa-github"></i>
                <span>Lanjutkan dengan GitHub</span>
              </button>
            </div>

            <div className="relative text-center border-b border-white/5 py-1">
              <span className="bg-zinc-950 px-2 text-[10px] text-zinc-600 relative -top-3">atau dengan password</span>
            </div>

            {/* MANUAL FORM */}
            <form onSubmit={submitAuthForm} className="space-y-3 text-xs">
              {authTab === "register" && (
                <div>
                  <label className="block text-zinc-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Bagas Adi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-zinc-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* MANDATORY HCAPTCHA */}
              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/30 space-y-2">
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verifikasi Keamanan hCaptcha</label>
                <div className="flex justify-center my-2 min-h-[78px]">
                  <div
                    className="h-captcha"
                    data-sitekey="169e06e6-008a-4592-a63a-8e6874786af0"
                    data-callback="onHCaptchaSuccess"
                    data-expired-callback="onHCaptchaExpired"
                  ></div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl emerald-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:opacity-95 transition-all"
              >
                {authTab === "register" ? "Daftar Akun Gratis (10x/Hari)" : "Masuk ke Dashboard"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
