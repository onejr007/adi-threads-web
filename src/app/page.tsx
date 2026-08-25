"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

const demoTimes = ["06:12", "08:47", "11:03", "13:26", "16:58"];

const scheduleSheet = [
  { time: "06:12", label: "Postingan Biasa" },
  { time: "08:47", label: "Utasan Bersambung" },
  { time: "11:03", label: "Soft Sell — Situs" },
  { time: "13:26", label: "Konten Engagement" },
  { time: "16:58", label: "Remix Viral" },
];

const liveStats = [
  { label: "Kirim terekam (24j)", value: 1247, suffix: "", decimals: 0 },
  { label: "Akun aktif", value: 83, suffix: "", decimals: 0 },
  { label: "Engagement rata-rata", value: 4.2, suffix: "%", decimals: 1 },
  { label: "Uptime engine", value: 99.97, suffix: "%", decimals: 2 },
];

const features = [
  { title: "Multi-platform agent", desc: "Satu agent mengelola Threads dan X dari satu dashboard; Instagram, TikTok, Facebook, dan LinkedIn menyusul.", meta: "threads · x" },
  { title: "Pola posting manusiawi", desc: "Jeda acak antar kiriman, ritme mengikuti jam aktif audiens — bukan tembakan bot tiap jam tepat.", meta: "anti-spam" },
  { title: "Kompresi prompt ADILANG", desc: "Prompt dipadatkan sebelum ke LLM teks; biaya API turun sampai 80% tanpa menurunkan kualitas konten.", meta: "hemat kuota" },
  { title: "Cross-post otomatis", desc: "Satu konten disesuaikan bentuknya per platform lalu dikirim berurutan sesuai jadwal siar.", meta: "1 → banyak" },
  { title: "Mesin engagement", desc: "Balas komentar, kejar thread relevan, rawat komunitas — dengan kuota harian yang terkontrol.", meta: "10x/hari gratis" },
  { title: "Analitik terpadu", desc: "Kinerja tiap kiriman, pertumbuhan pengikut, dan riwayat versi konten dalam satu layar.", meta: "satu layar" },
];

const tosPoints = [
  {
    title: "Kuota harian terkunci",
    desc: "10 posting dan 10 komentar per hari — titik. Saat kuota habis, mesin berhenti sendiri. Tidak ada mode tanpa batas, tidak ada upsell spam.",
    meta: "hard stop",
  },
  {
    title: "Ritme manusiawi",
    desc: "Jeda antar kiriman diacak dan mengikuti jam aktif audiens Anda. Pola tembakan bot tidak akan pernah muncul dari engine ini.",
    meta: "anti-spam",
  },
  {
    title: "Token terkunci rapat",
    desc: "Kredensial akun disimpan terenkripsi end-to-end, hanya dipakai untuk akun Anda sendiri, dan tidak pernah dibagikan ke pihak mana pun.",
    meta: "e2e encrypted",
  },
  {
    title: "TOS Guard aktif 24/7",
    desc: "Setiap kiriman melewati pemeriksaan aturan platform sebelum terkirim. Bila aktivitas mendekati batas yang dilarang, engine menahan diri lebih dulu — bukan sesudah dilaporkan.",
    meta: "patuh threads & x",
  },
];

// ══ Sandbox: generator konten lokal (fake — tidak ada network call) ══
type GoalDef = { id: string; label: string; modeLabel: string };
const GOALS: GoalDef[] = [
  { id: "produk", label: "Iklan produk", modeLabel: "Postingan + Gambar" },
  { id: "situs", label: "Promo situs / web", modeLabel: "Soft Sell — Situs" },
  { id: "engage", label: "Konten engagement", modeLabel: "Utasan Pertanyaan" },
  { id: "viral", label: "Remix thread viral", modeLabel: "Remix Viral" },
];

function buildPost(niche: string, goalId: string): { label: string; text: string } {
  const n = niche.trim() || "bisnis kecilmu";
  const pools: Record<string, string[]> = {
    produk: [
      `Buat kamu yang serius menekuni ${n}: kami baru saja merilis sesuatu yang membuat rutinitas ${n} jadi jauh lebih ringkas. Lihat gambarnya — lalu cerita versi kamu di komentar.`,
      `Setahun membangun untuk komunitas ${n}, dan hari ini bagian favorit kami akhirnya tayang. Kalau kamu aktif di ${n}, ini dibuat khusus untukmu.`,
    ],
    situs: [
      `Semua tentang ${n} sekarang ada di satu halaman: panduan awal, tips praktis, dan update mingguan. Link ada di bio — mulai dari yang paling dasar saja dulu.`,
      `Berhenti mencari-cari info ${n} yang berserakan. Kami rangkum jadi satu situs rapi, diperbarui tiap pekan. Cek link di bio.`,
    ],
    engage: [
      `Pertanyaan untuk yang kerap berkecimpung di ${n}: kalau harus memilih SATU kebiasaan yang paling mengubah hasil kamu tahun ini, apa jawabannya?`,
      `Jujur-jujuran seputar ${n}: apa mitos yang masih banyak dipercaya pemula tapi menurut kamu sudah lewat zamannya?`,
    ],
    viral: [
      `Thread viral kemarin membahas ${n}. Poin intinya sederhana: konsistensi mengalahkan tools termahal sekalipun. Setuju, atau justru sebaliknya?`,
      `Sedang ramai debat soal ${n}. Versi kami singkat: mulai kecil, ukur datanya, lanjutkan yang terbukti. Bagaimana versi kamu?`,
    ],
  };
  const arr = pools[goalId] || pools.produk;
  const g = GOALS.find((x) => x.id === goalId);
  return { label: g ? g.modeLabel : "Postingan Biasa", text: arr[Math.floor(Math.random() * arr.length)] };
}

type SbPhase = "idle" | "scan" | "topics" | "compose" | "typing" | "sent";

// ══ Util transisi ═══════════════════════════════════════════════════

function Reveal({ children, delay = 0, tilt = false, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  tilt?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${tilt ? "lp-tilt" : "lp-reveal"} ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1300;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(value * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{display.toFixed(decimals)}</span>;
}

type Toast = { id: number; text: string; type: "success" | "info" | "warn" };

export default function LandingPage() {
  // Auth & user
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Toasts & stat hidup
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [liveCounter, setLiveCounter] = useState(1247);

  // Sandbox
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("produk");
  const [sbPhase, setSbPhase] = useState<SbPhase>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [post, setPost] = useState<{ label: string; text: string } | null>(null);
  const [sentAt, setSentAt] = useState("");
  const [reach, setReach] = useState(0);
  const sbTimers = useRef<number[]>([]);

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
    if (!showAuthModal) return;
    const tryRender = () => {
      const w = (window as any).hcaptcha;
      const el = document.querySelector(".h-captcha[data-sitekey]");
      if (!w || !el || el.getAttribute("data-hc-rendered")) return;
      try {
        w.render(el, {
          sitekey: el.getAttribute("data-sitekey"),
          callback: (t: string) => setHcaptchaToken(t),
          "expired-callback": () => setHcaptchaToken(""),
        });
        el.setAttribute("data-hc-rendered", "true");
      } catch {}
    };
    tryRender();
    const iv = setInterval(tryRender, 400);
    const timeout = setTimeout(() => clearInterval(iv), 8000);
    return () => { clearInterval(iv); clearTimeout(timeout); };
  }, [showAuthModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter((c) => c + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Sandbox engine ──────────────────────────────────────────────
  const clearSbTimers = useCallback(() => {
    sbTimers.current.forEach((t) => clearTimeout(t));
    sbTimers.current = [];
  }, []);

  const pushLog = useCallback((line: string) => {
    const now = new Date().toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [...prev, `${now}  ${line}`]);
  }, []);

  const playSandbox = useCallback(() => {
    clearSbTimers();
    setLogs([]);
    setTyped("");
    setPost(null);
    const built = buildPost(niche, goal);
    setPost(built);
    pushLog(`memindai niche "${niche.trim() || "umum"}"…`);
    setSbPhase("scan");
    addToast("Sandbox berjalan — tidak ada yang dikirim sungguhan.", "info");

    sbTimers.current.push(window.setTimeout(() => {
      pushLog("3 kandidat topik dinilai · skor tertinggi dipilih");
      setSbPhase("topics");
    }, 1100));
    sbTimers.current.push(window.setTimeout(() => {
      pushLog(`menyusun draf · mode: ${built.label}`);
      setSbPhase("compose");
    }, 2300));
    sbTimers.current.push(window.setTimeout(() => setSbPhase("typing"), 3200));
  }, [niche, goal, clearSbTimers, pushLog, addToast]);

  // Efek mengetik
  useEffect(() => {
    if (sbPhase !== "typing" || !post) return;
    let i = 0;
    const iv = window.setInterval(() => {
      i += 2;
      setTyped(post.text.slice(0, i));
      if (i >= post.text.length) {
        clearInterval(iv);
        const now = new Date().toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
        });
        setSentAt(now);
        setReach(Math.floor(Math.random() * 400) + 120);
        setSbPhase("sent");
        pushLog("terkirim ke antrean siar (simulasi)");
        addToast("Simulasi selesai — postingan TIDAK dikirim sungguhan.", "success");
      }
    }, 22);
    return () => clearInterval(iv);
  }, [sbPhase, post, pushLog, addToast]);

  useEffect(() => () => clearSbTimers(), [clearSbTimers]);

  const resetSandbox = useCallback(() => {
    clearSbTimers();
    window.clearInterval(-1); // no-op guard
    setSbPhase("idle");
    setLogs([]);
    setTyped("");
    setPost(null);
  }, [clearSbTimers]);

  const scrollToSandbox = useCallback(() => {
    document.getElementById("sandbox")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, []);

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
            Mesin kehadiran sosial media · ekosistem adi
          </span>
          <div className="flex items-center gap-5 whitespace-nowrap">
            {currentUser ? (
              <>
                {currentUser.email === "chilooks91@gmail.com" && (
                  <Link href="/admin" className="lp-mono text-xs uppercase tracking-[0.14em] lp-navlink" style={{ color: "var(--accent)" }}>
                    Admin
                  </Link>
                )}
                <Link href="/tickets" className="lp-mono text-xs uppercase tracking-[0.14em] lp-navlink">
                  Tiket
                </Link>
                <Link href="/dashboard" className="lp-mono text-xs uppercase tracking-[0.14em] lp-navlink">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthTab("login"); setShowAuthModal(true); }} className="lp-mono text-xs uppercase tracking-[0.14em] lp-navlink cursor-pointer bg-transparent border-none p-0">
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
            <Reveal>
              <p className="lp-kicker mb-8">
                Mesin siar harian <strong>· {liveCounter.toLocaleString()} kiriman bulan ini</strong>
              </p>
            </Reveal>
            <h1 className="lp-serif lp-headline">
              <span className="lp-mask"><span>Hadir setiap hari,</span></span>
              <span className="lp-mask"><span><em>tanpa buka aplikasinya.</em></span></span>
            </h1>
            <Reveal delay={250}>
              <p className="lp-body text-lg leading-relaxed mt-8 max-w-xl" style={{ color: "var(--ink-soft)" }}>
                ADISosmed menjaga akun sosial media Anda tetap hidup: posting
                terjadwal, komentar yang dijawab, thread relevan yang dikejar —
                dengan ritme yang terbaca manusiawi, bukan tembakan bot.
              </p>
            </Reveal>
            <Reveal delay={400}>
              <div className="flex flex-wrap items-center gap-5 mt-10">
                <button
                  onClick={() => {
                    if (currentUser) window.location.href = "/dashboard";
                    else { setAuthTab("register"); setShowAuthModal(true); }
                  }}
                  className="lp-btn"
                >
                  <span>Mulai gratis — 10x/hari</span>
                </button>
                <button onClick={scrollToSandbox} className="lp-btn lp-btn-ghost">
                  <span>
                    Jalankan siklusnya
                    <span className="btn-arrow">↓</span>
                  </span>
                </button>
              </div>
            </Reveal>

            <Reveal delay={550}>
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
            </Reveal>
          </div>

          {/* Panel jadwal siar */}
          <Reveal delay={300} tilt className="lg:col-span-4">
            <div className="lp-panel">
              <div className="lp-panel-inner">
                <p className="lp-kicker mb-5">Lembar siar hari ini</p>
                <ol className="space-y-3">
                  {scheduleSheet.map((row) => (
                    <li key={row.time} className="flex items-baseline gap-3">
                      <span className="lp-mono text-xs" style={{ color: "var(--accent)" }}>{row.time}</span>
                      <span className="lp-body italic truncate">{row.label}</span>
                    </li>
                  ))}
                </ol>
                <p className="lp-mono text-[11px] leading-relaxed mt-6 pt-4 border-t lp-hairline" style={{ color: "var(--ink-faint)" }}>
                  Jeda antar kiriman diacak. Engine berhenti otomatis bila
                  kuota harian habis — akun Anda tidak pernah terlihat seperti spam.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* STATISTIK: angka menghitung naik saat masuk layar */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 mt-20 border-t border-b lp-hairline">
          {liveStats.map((s, i) => (
            <div key={i} className={`py-6 px-4 text-center ${i > 0 ? "sm:border-l lp-hairline" : ""}`}>
              <div className="lp-serif text-3xl font-medium">
                {i === 0 ? (
                  liveCounter.toLocaleString()
                ) : (
                  <>
                    <CountUp value={s.value} decimals={s.decimals} />
                  </>
                )}
                {s.suffix}
              </div>
              <div className="lp-kicker mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SANDBOX LIVE — simulasi siklus kirim sesuai input pengguna */}
      <section id="sandbox" className="px-6 py-24 scroll-mt-16" style={{ background: "var(--paper-deep)" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
              <h2 className="lp-serif text-3xl sm:text-4xl font-medium tracking-tight max-w-xl leading-tight">
                Coba mesinnya <em>di dalam sandbox.</em>
              </h2>
              <span className="lp-stamp lp-mono shrink-0">sandbox · fake</span>
            </div>
            <p className="lp-body max-w-2xl leading-relaxed mb-12" style={{ color: "var(--ink-soft)" }}>
              Isi niche dan tujuan konten Anda, lalu tekan Play. Mesin akan
              mensimulasikan satu siklus penuh — dari pemindaian topik sampai
              kiriman jadi — semuanya di halaman ini, tanpa mengirim apa pun.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Kiri: konfigurasi */}
            <Reveal delay={120} className="lg:col-span-5">
              <div className="space-y-7 lg:sticky lg:top-24">
                <div>
                  <label htmlFor="sb-niche" className="lp-kicker block mb-2">Niche / bidang kamu</label>
                  <input
                    id="sb-niche"
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="lp-field"
                    placeholder="mis. kopi susah rumahan, fashion muslim…"
                    maxLength={60}
                  />
                </div>

                <div>
                  <p className="lp-kicker mb-2">Tujuan konten</p>
                  <div className="border-t lp-hairline">
                    {GOALS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`lp-goal w-full text-left py-3.5 px-3 border-b lp-hairline bg-transparent border-t-0 border-r-0 cursor-pointer flex items-baseline justify-between gap-3 ${goal === g.id ? "lp-goal-on" : ""}`}
                      >
                        <span className={`lp-body ${goal === g.id ? "italic font-semibold" : ""}`} style={goal === g.id ? { color: "var(--accent-ink)" } : undefined}>
                          {g.label}
                        </span>
                        <span className="lp-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>
                          {g.modeLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button onClick={playSandbox} disabled={sbPhase !== "idle" && sbPhase !== "sent"} className="lp-btn">
                    <span>
                      ▸ Play
                      <span className="btn-arrow">→</span>
                    </span>
                  </button>
                  {(sbPhase !== "idle") && (
                    <button onClick={resetSandbox} className="lp-mono text-xs uppercase tracking-[0.14em] lp-link bg-transparent border-none cursor-pointer">
                      reset
                    </button>
                  )}
                </div>
                <p className="lp-mono text-[10px] leading-relaxed" style={{ color: "var(--ink-faint)" }}>
                  * Simulasi murni di browser Anda. Tidak ada koneksi ke Threads,
                  tidak ada data yang dikumpulkan.
                </p>
              </div>
            </Reveal>

            {/* Kanan: output simulasi */}
            <Reveal delay={240} className="lg:col-span-7">
              <div className="lp-panel">
                <div className="lp-panel-inner min-h-[380px] flex flex-col">
                  {/* Log langkah */}
                  <div className="min-h-[92px] mb-5">
                    <p className="lp-kicker mb-3">Log mesin</p>
                    <div className="space-y-1.5">
                      {logs.length === 0 && (
                        <p className="lp-mono text-[11px]" style={{ color: "var(--ink-faint)" }}>
                          menunggu perintah…
                        </p>
                      )}
                      {logs.map((l, i) => (
                        <p key={i} className="lp-logline lp-mono text-[11px]" style={{ color: i === logs.length - 1 ? "var(--ink)" : "var(--ink-faint)" }}>
                          {l}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Kliping kiriman tersimulasi */}
                  <article
                    className={`lp-clip mt-auto ${sbPhase === "sent" ? "lp-clip-active" : sbPhase === "typing" || sbPhase === "compose" ? "" : "lp-clip-idle"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="lp-mono text-[10px] tracking-wider" style={{ color: "var(--ink-faint)" }}>
                        @akun_anda{sentAt ? ` · ${sentAt} WIB` : ""}
                      </span>
                      <span className="ml-auto">
                        {sbPhase === "typing" && <span className="lp-tag lp-mono animate-pulse" style={{ color: "var(--accent)" }}>menulis</span>}
                        {sbPhase === "sent" && <span className="lp-tag lp-mono" style={{ color: "#3f6212" }}>terkirim · simulasi</span>}
                      </span>
                    </div>

                    {post ? (
                      <p className="lp-body text-sm leading-relaxed min-h-[84px]">
                        {typed}
                        {(sbPhase === "typing") && <span className="lp-caret" />}
                      </p>
                    ) : (
                      <p className="lp-body text-sm leading-relaxed min-h-[84px]" style={{ color: "var(--ink-faint)" }}>
                        Kiriman tersimulasi akan muncul di sini, ditulis karakter
                        demi karakter persis seperti keluaran mesin.
                      </p>
                    )}

                    {sbPhase === "sent" && post && (
                      <div className="mt-4 pt-3 border-t lp-hairline flex flex-wrap items-center justify-between gap-2">
                        <span className="lp-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>
                          estimasi jangkauan 24j: ~{reach} tayangan
                        </span>
                        <span className="lp-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                          mode: {post.label}
                        </span>
                      </div>
                    )}
                  </article>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FITUR: baris editorial */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="lp-serif text-3xl sm:text-4xl font-medium tracking-tight mb-12 max-w-xl leading-tight">
              Yang dikerjakan mesin ini <em>setiap hari.</em>
            </h2>
          </Reveal>
          <div>
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="lp-row">
                  <span className="lp-mono text-xs" style={{ color: "var(--accent)" }}>—</span>
                  <h3 className="lp-serif italic text-xl">{f.title}</h3>
                  <p className="lp-row-desc lp-body leading-relaxed max-w-xl" style={{ color: "var(--ink-soft)" }}>
                    {f.desc}
                  </p>
                  <span className="lp-mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap" style={{ color: "var(--ink-faint)" }}>
                    {f.meta}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* KEAMANAN & TOS GUARD */}
      <section className="px-6 py-24" style={{ background: "var(--paper-deep)" }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-5 lg:sticky lg:top-24 self-start">
            <h2 className="lp-serif text-3xl sm:text-4xl font-medium tracking-tight mb-3 max-w-sm leading-tight">
              Keamanan akun itu fitur utama, bukan tambahan.
            </h2>
            <p className="lp-body max-w-sm mb-4" style={{ color: "var(--ink-soft)" }}>
              Engine dirancang untuk berhenti lebih dulu daripada menyesal
              belakangan. Kuota ketat, ritme diacak, token terenkripsi — dan
              TOS Guard memantau setiap kiriman sebelum terkirim.
            </p>
            <span className="lp-stamp lp-mono" style={{ color: "var(--accent)" }}>tos guard · aktif</span>
          </Reveal>

          <div className="lg:col-span-7 space-y-0 border-t lp-hairline">
            {tosPoints.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className="lp-row">
                  <span className="lp-mono text-xs" style={{ color: "var(--accent)" }}>—</span>
                  <h3 className="lp-serif italic text-xl">{p.title}</h3>
                  <p className="lp-row-desc lp-body leading-relaxed max-w-xl" style={{ color: "var(--ink-soft)" }}>
                    {p.desc}
                  </p>
                  <span className="lp-mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap" style={{ color: "var(--ink-faint)" }}>
                    {p.meta}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Panel jaminan key / BYOG */}
        <Reveal tilt delay={200}>
          <div className="max-w-6xl mx-auto mt-16 lp-panel">
            <div className="lp-panel-inner p-8 sm:p-10">
              <h3 className="lp-serif text-2xl sm:text-3xl italic mb-4 leading-tight">
                Cukup satu key. Gratis. Kami pandu sampai jadi.
              </h3>
              <p className="lp-body mb-8 max-w-2xl leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                Yang Anda siapkan hanyalah token / key API dari platform yang
                ingin ditautkan — dibuat lewat developer portal resmi masing-masing,
                tanpa biaya sepeser pun.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { head: "Panduan langkah demi langkah", body: "Dashboard menyediakan tutorial bergambar lengkap untuk setiap platform — dari membuat akun developer sampai key aktif dan terpasang." },
                  { head: "Bantuan langsung bila macet", body: "Tiket support dan ADICHAT siap menemani Anda sampai key terpasang. Tidak ada pertanyaan yang terlalu dasar untuk ditanyakan." },
                  { head: "Layanan ekosistem juga gratis", body: "Bahkan fitur yang menyentuh ekosistem kami — misalnya mengutip artikel ADINEWS — hanya membutuhkan token/key API gratis yang Anda buat sendiri; kami pandu cara mendapatkannya dari awal." },
                  { head: "Anda pegang kuncinya", body: "Key disimpan terenkripsi hanya di server Anda. Tim kami tidak memiliki akses — hanya engine di akun Anda yang membaca dan memakainya." },
                ].map((b, i) => (
                  <div key={i} className="border-t pt-4 lp-hairline">
                    <p className="lp-kicker mb-1">{b.head}</p>
                    <p className="lp-body text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{b.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CARA KERJA */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 border-t pt-12 lp-hairline">
          {[
            { num: "01", title: "Hubungkan akun", desc: "OAuth sekali klik. Token disimpan terenkripsi end-to-end." },
            { num: "02", title: "Atur strategi", desc: "Pilih niche, gaya bahasa, dan frekuensi siar harian." },
            { num: "03", title: "Biarkan berjalan", desc: "Engine posting dan engaged 24/7; Anda cukup memantau." },
          ].map((step, i) => (
            <Reveal key={step.num} delay={i * 130}>
              <div>
                <div className="lp-mono text-sm mb-3" style={{ color: "var(--accent)" }}>{step.num}</div>
                <h3 className="lp-serif italic text-2xl mb-2">{step.title}</h3>
                <p className="lp-body text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA: blok tinta inversi */}
      <section className="px-6 pb-24">
        <Reveal tilt>
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
                <span>
                  Mulai sekarang — gratis
                  <span className="btn-arrow">→</span>
                </span>
              </button>
            </div>
            <p className="lp-mono text-[11px] mt-8 tracking-wide uppercase" style={{ color: "#897e6c" }}>
              Kuota harian ketat · Token terenkripsi · TOS Guard aktif · Tidak ada kartu kredit
            </p>
          </div>
        </Reveal>
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
          <div className="w-full max-w-md relative" style={{ background: "var(--paper-deep)", border: "1px solid var(--ink)", boxShadow: "8px 8px 0 0 rgba(33,29,21,0.25)", animation: "lp-rise 420ms cubic-bezier(0.19,1,0.22,1)" }}>
            <button onClick={() => setShowAuthModal(false)} aria-label="Tutup" className="absolute top-3 right-4 text-xl leading-none cursor-pointer bg-transparent border-none" style={{ color: "var(--ink-faint)" }}>
              ×
            </button>
            <div className="m-1.5 p-7 space-y-6" style={{ border: "1px solid var(--line)" }}>
              <div className="flex gap-6 border-b lp-hairline pb-3">
                <button onClick={() => setAuthTab("register")} className="lp-body italic text-base cursor-pointer bg-transparent border-none p-0" style={authTab === "register" ? { color: "var(--accent)", textDecoration: "underline", textDecorationColor: "var(--accent)", textUnderlineOffset: 5 } : { color: "var(--ink-faint)" }}>
                  Daftar baru
                </button>
                <button onClick={() => setAuthTab("login")} className="lp-body italic text-base cursor-pointer bg-transparent border-none p-0" style={authTab === "login" ? { color: "var(--accent)", textDecoration: "underline", textDecorationColor: "var(--accent)", textUnderlineOffset: 5 } : { color: "var(--ink-faint)" }}>
                  Masuk sesi
                </button>
              </div>

              <div className="space-y-2.5">
                <button onClick={() => triggerOAuth("google")} className="lp-btn lp-btn-ghost lp-btn-plain w-full cursor-pointer">
                  <span>Lanjutkan dengan Google</span>
                </button>
                <button onClick={() => triggerOAuth("github")} className="lp-btn lp-btn-ghost lp-btn-plain w-full cursor-pointer">
                  <span>Lanjutkan dengan GitHub</span>
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
                  <span>{authTab === "register" ? "Daftar akun gratis (10x/hari)" : "Masuk ke dashboard"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
