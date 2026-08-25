"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const platforms = [
  { name: "Threads", icon: "fa-brands fa-threads", color: "text-zinc-200", status: "live" },
  { name: "X / Twitter", icon: "fa-brands fa-x-twitter", color: "text-zinc-200", status: "live" },
  { name: "Instagram", icon: "fa-brands fa-instagram", color: "text-zinc-400", status: "dev" },
  { name: "TikTok", icon: "fa-brands fa-tiktok", color: "text-zinc-400", status: "dev" },
  { name: "Facebook", icon: "fa-brands fa-facebook", color: "text-zinc-400", status: "dev" },
  { name: "LinkedIn", icon: "fa-brands fa-linkedin", color: "text-zinc-400", status: "dev" },
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
  { label: "Postingan terekam (24j)", value: 1247, suffix: "" },
  { label: "Akun aktif", value: 83, suffix: "" },
  { label: "Engagement rate rata-rata", value: 4.2, suffix: "%" },
  { label: "Uptime engine", value: 99.97, suffix: "%" },
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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-emerald-500/30">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-violet-500/8 rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* TOASTS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-in-right px-4 py-3 rounded-2xl border backdrop-blur-xl text-xs font-semibold shadow-2xl ${
              t.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : t.type === "warn"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-zinc-900/80 border-zinc-700/50 text-zinc-300"
            }`}
          >
            {t.type === "success" && <i className="fa-solid fa-check mr-2"></i>}
            {t.type === "warn" && <i className="fa-solid fa-triangle-exclamation mr-2"></i>}
            {t.type === "info" && <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>}
            {t.text}
          </div>
        ))}
      </div>

      {/* NAVBAR */}
      <nav className="relative z-40 w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl emerald-btn flex items-center justify-center text-zinc-950 text-lg font-black shadow-lg group-hover:scale-105 transition-transform">
              <span className="relative z-10">⚡</span>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide text-white block leading-tight">
                ADI <span className="text-emerald-400">SOSMED</span>
              </span>
              <span className="text-[9px] font-mono text-zinc-500 tracking-widest block">
                MULTI-PLATFORM ENGINE
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.email === "chilooks91@gmail.com" && (
                  <Link href="/admin" className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all">
                    Admin
                  </Link>
                )}
                <Link href="/tickets" className="px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 text-xs font-bold text-cyan-400 hover:bg-zinc-800/50 transition-all">
                  Tiket
                </Link>
                <Link href="/dashboard" className="px-3.5 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 text-xs font-bold text-emerald-400 hover:bg-zinc-800/50 transition-all">
                  Dashboard
                </Link>
              </div>
            ) : (
              <>
                <button onClick={() => { setAuthTab("login"); setShowAuthModal(true); }} className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
                  Masuk
                </button>
                <button onClick={() => { setAuthTab("register"); setShowAuthModal(true); }} className="px-4 py-2 text-xs font-bold text-white emerald-btn rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                  Coba Gratis
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pt-20 pb-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Engine v3.0 • {liveCounter.toLocaleString()} postingan terkirim bulan ini
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Sosial media yang
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              berjalan sendiri
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            ADI Sosmed mengotomatisasi posting, komentar, dan growth di semua platform sosial media yang kamu pakai.
            Satu dashboard. Banyak platform. Tanpa ribbon.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => {
                if (currentUser) window.location.href = "/dashboard";
                else { setAuthTab("register"); setShowAuthModal(true); }
              }}
              className="group px-8 py-4 rounded-2xl emerald-btn text-sm font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all inline-flex items-center"
            >
              Mulai Gratis — 10x/Hari
              <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </button>
            <button onClick={runDemo} disabled={demoRunning} className="px-8 py-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/50 hover:border-zinc-700/50 transition-all inline-flex items-center disabled:opacity-50">
              <i className="fa-solid fa-play mr-2"></i>
              {demoRunning ? "Menjalankan Demo..." : "Lihat Cara Kerja"}
            </button>
          </div>

          {/* PLATFORM ROW */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-20">
            {platforms.map((p) => (
              <div
                key={p.name}
                className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                  p.status === "live"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-zinc-900/30 border-zinc-800/30 text-zinc-500"
                }`}
              >
                <i className={`${p.icon} text-sm`}></i>
                {p.name}
                {p.status === "dev" && <span className="text-[9px] font-mono opacity-60">(dev)</span>}
              </div>
            ))}
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {liveStats.map((s, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-gradient">
                  {i === 0 ? liveCounter.toLocaleString() : s.value}{s.suffix}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Lihat engine
              <span className="text-gradient"> bekerja secara nyata</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Setiap siklus otomatis melewati 6 mode posting berbeda. Klik tombol di bawah untuk melihat simulasi langkah demi langkah.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: mode selector */}
            <div className="glass-panel rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Siklus Posting</h3>
                <span className="text-[10px] font-mono text-zinc-600">6 modes</span>
              </div>
              {demoPosts.map((post, i) => (
                <div
                  key={post.mode}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                    demoStep > i
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : demoStep === i + 1
                      ? "bg-cyan-500/10 border-cyan-500/20"
                      : "bg-zinc-900/20 border-transparent opacity-60"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    demoStep > i ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {demoStep > i ? <i className="fa-solid fa-check"></i> : String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs font-bold text-white">{post.label}</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{post.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: live feed simulation */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live Feed</h3>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    {demoRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${demoRunning ? "bg-emerald-500" : "bg-zinc-700"}`}></span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{demoRunning ? "LIVE" : "IDLE"}</span>
                </div>
              </div>

              <div className="space-y-3">
                {demoPosts.map((post, i) => {
                  const isActive = demoStep === i + 1;
                  const isDone = demoStep > i + 1;
                  return (
                    <div
                      key={post.mode}
                      className={`p-4 rounded-2xl border transition-all duration-500 ${
                        isActive
                          ? "bg-zinc-900/80 border-cyan-500/30 animate-post-pop"
                          : isDone
                          ? "bg-zinc-900/40 border-emerald-500/10 opacity-70"
                          : "bg-zinc-900/20 border-transparent opacity-40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fa-brands fa-threads text-zinc-500 text-xs"></i>
                        <span className="text-[10px] font-mono text-zinc-600">@adi_agent • {demoTimes[i]} WIB</span>
                        {isActive && <span className="ml-auto text-[9px] font-bold text-cyan-400 animate-pulse">SENDING...</span>}
                        {isDone && <span className="ml-auto text-[9px] font-bold text-emerald-400">SENT</span>}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{post.text}</p>
                      {post.link && (
                        <a href={post.link} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:text-emerald-300 mt-2 inline-block">
                          {post.link} <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Dibuat untuk tim yang
              <span className="text-gradient"> tidak mau ribet</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Tidak perlu scheduler terpisah, tidak perlu analytics tool lain, tidak perlu copy-paste konten antar platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "fa-robot", title: "Multi-Platform Agent", desc: "Satu agent mengelola Threads, X, Instagram, TikTok, Facebook, dan LinkedIn. Semua dari satu dashboard.", style: { card: "from-emerald-500/10 border-emerald-500/10", iconBox: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" } },
              { icon: "fa-shield-halved", title: "Stealth Protocol", desc: "Pola posting seperti manusia. Rate limit dinamis, jitter acak, dan anti-detection engine bawaan.", style: { card: "from-cyan-500/10 border-cyan-500/10", iconBox: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" } },
              { icon: "fa-bolt", title: "Kompresi Token ADILANG", desc: "Prompt di-compress sebelum ke LLM. Hemat hingga 80% biaya API tanpa turun kualitas.", style: { card: "from-violet-500/10 border-violet-500/10", iconBox: "bg-violet-500/10 border-violet-500/20 text-violet-400" } },
              { icon: "fa-tower-broadcast", title: "Auto Cross-Post", desc: "Satu konten, banyak platform. Threads ke X, Instagram ke Facebook, dan seterusnya.", style: { card: "from-amber-500/10 border-amber-500/10", iconBox: "bg-amber-500/10 border-amber-500/20 text-amber-400" } },
              { icon: "fa-comments", title: "Engagement Engine", desc: "Auto-reply komentar, scavenge thread, dan bangun komunitas secara otonom.", style: { card: "from-rose-500/10 border-rose-500/10", iconBox: "bg-rose-500/10 border-rose-500/20 text-rose-400" } },
              { icon: "fa-chart-line", title: "Analytics Terpadu", desc: "Semua metric engagement, follower growth, dan posting performance di satu tempat.", style: { card: "from-sky-500/10 border-sky-500/10", iconBox: "bg-sky-500/10 border-sky-500/20 text-sky-400" } },
            ].map((f, i) => (
              <div key={i} className={`group relative p-6 rounded-3xl bg-gradient-to-br ${f.style.card} to-transparent border backdrop-blur-xl hover:scale-[1.02] transition-all duration-300`}>
                <div className="absolute inset-0 rounded-3xl animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg ${f.style.iconBox}`}>
                    <i className={`fa-solid ${f.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5">{f.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Dari nol ke
              <span className="text-gradient"> posting dalam 3 langkah</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Hubungkan Akun", desc: "OAuth sekali klik ke setiap platform. Kami simpan token dengan enkripsi end-to-end." },
              { num: "02", title: "Atur Strategi", desc: "Pilih niche, tone of voice, dan frekuensi. AI menyesuaikan konten dengan audiens kamu." },
              { num: "03", title: "Biarkan Berjalan", desc: "Engine posting, berkomentar, dan engaged 24/7. Kamu cuma pantau dari dashboard." },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="glass-panel rounded-3xl p-8 h-full hover:border-white/10 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-8xl font-black text-white/[0.02] leading-none select-none">{step.num}</div>
                  <div className="relative space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm">
                      {step.num}
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{step.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                      <i className="fa-solid fa-chevron-right text-zinc-500 text-[10px]"></i>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass-panel rounded-[2rem] p-12 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/15 rounded-full blur-[100px]" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl emerald-btn text-zinc-950 text-2xl font-black shadow-lg mx-auto">
                ⚡
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Siap otomatiskan semua akun sosial media kamu?
              </h2>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto">
                Bergabung dengan pengguna yang sudah menggunakan ADI Sosmed. Gratis 10x posting per hari, tanpa batas platform.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    if (currentUser) window.location.href = "/dashboard";
                    else { setAuthTab("register"); setShowAuthModal(true); }
                  }}
                  className="group px-8 py-4 rounded-2xl emerald-btn text-sm font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all inline-flex items-center"
                >
                  Mulai Sekarang — Gratis
                  <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono">
                Tidak perlu kartu kredit • Setup 2 menit • 10x posting gratisan setiap hari
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg emerald-btn flex items-center justify-center font-black text-zinc-950 text-sm">⚡</div>
            <span className="text-xs font-bold text-zinc-500">ADI SOSMED © 2025 — Multi-Platform Social Engine</span>
          </div>
          <div className="flex items-center gap-6">
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
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="flex border-b border-white/5 space-x-4 text-xs font-bold">
              <button onClick={() => setAuthTab("register")} className={`pb-2.5 transition-colors ${authTab === "register" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                Daftar Baru
              </button>
              <button onClick={() => setAuthTab("login")} className={`pb-2.5 transition-colors ${authTab === "login" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                Masuk Sesi
              </button>
            </div>

            <div className="space-y-2.5">
              <button onClick={() => triggerOAuth("google")} className="w-full py-3 rounded-xl bg-zinc-900/50 border border-zinc-700/50 hover:bg-zinc-800/50 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all">
                <i className="fa-brands fa-google text-rose-400"></i>Lanjutkan dengan Google
              </button>
              <button onClick={() => triggerOAuth("github")} className="w-full py-3 rounded-xl bg-zinc-900/50 border border-zinc-700/50 hover:bg-zinc-800/50 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all">
                <i className="fa-brands fa-github"></i>Lanjutkan dengan GitHub
              </button>
            </div>

            <div className="relative text-center border-b border-white/5 py-1">
              <span className="bg-zinc-950 px-2 text-[10px] text-zinc-600 relative -top-3">atau dengan password</span>
            </div>

            <form onSubmit={submitAuthForm} className="space-y-3 text-xs">
              {authTab === "register" && (
                <div>
                  <label className="block text-zinc-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Nama Lengkap</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Bagas Adi" className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
                </div>
              )}
              <div>
                <label className="block text-zinc-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Alamat Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@domain.com" className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/30 space-y-2">
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verifikasi Keamanan hCaptcha</label>
                <div className="flex justify-center my-2 min-h-[78px]">
                  <div className="h-captcha" data-sitekey="169e06e6-008a-4592-a63a-8e6874786af0" data-callback="onHCaptchaSuccess" data-expired-callback="onHCaptchaExpired"></div>
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl emerald-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                {authTab === "register" ? "Daftar Akun Gratis (10x/Hari)" : "Masuk ke Dashboard"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
