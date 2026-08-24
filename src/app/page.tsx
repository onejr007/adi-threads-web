"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

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
      alert(`⚡ Harap centang & verifikasi hCaptcha terlebih dahulu sebelum melanjutkan ke login OAuth ${provider.toUpperCase()}!`);
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
      alert("⚡ Harap centang & verifikasi hCaptcha terlebih dahulu sebelum mendaftar atau masuk!");
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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* NAVBAR */}
      <nav className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl emerald-btn flex items-center justify-center font-black text-zinc-950 text-lg shadow-lg">
            ⚡
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wide text-white">
              ADI <span className="text-emerald-400">THREADS</span>
            </span>
            <span className="block text-[9px] font-mono text-zinc-400">
              Autonomous Social Media Engine
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              {currentUser.email === "chilooks91@gmail.com" && (
                <Link
                  href="/admin"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all flex items-center"
                >
                  <i className="fa-solid fa-crown mr-1.5"></i>Admin Panel
                </Link>
              )}
              <Link
                href="/tickets"
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-cyan-400 transition-all flex items-center"
              >
                <i className="fa-solid fa-ticket mr-1.5"></i>Tiket Saya
              </Link>
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-emerald-400 transition-all flex items-center"
              >
                <i className="fa-solid fa-gauge-high mr-1.5"></i>Dashboard
              </Link>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthTab("login");
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setAuthTab("register");
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white emerald-btn rounded-xl shadow-lg transition-all"
              >
                Coba Gratis (10x/Hari)
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ADI Engine v2.5 Active • Meta Threads Stealth Protocol</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Otomasi Content Threads AI <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Tanpa AI Slop, 100% Organik & Stealth
          </span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Platform AI Agent otonom pertama di Indonesia khusus Meta Threads. Dilengkapi 6 Moda Posting Berjenjang, Auto Cross-Posting X, Komentar Publik Otonom, dan Jaminan Hemat API Token hingga 80% ditenagai Protokol ADILANG.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              if (currentUser) window.location.href = "/dashboard";
              else {
                setAuthTab("register");
                setShowAuthModal(true);
              }
            }}
            className="px-8 py-3.5 rounded-2xl emerald-btn text-sm font-bold shadow-xl hover:scale-105 transition-all flex items-center"
          >
            <i className="fa-solid fa-bolt mr-2"></i>Mulai Otomasi Gratis
          </button>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center"
          >
            <i className="fa-solid fa-play mr-2"></i>Buka Dashboard Panel
          </Link>
        </div>
      </section>

      {/* ADILANG GUARANTEE CARD */}
      <section className="px-6 py-10 max-w-4xl mx-auto w-full">
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h3 className="text-sm font-extrabold text-white">
              Jaminan Efisiensi Token ADILANG (Hemat hingga 80%)
            </h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Infrastruktur Ekosistem ADI dilengkapi protokol kompresi IR **ADILANG**. Semua prompt otomatis dikompresi sebelum diproses oleh LLM sehingga pengguna Tier 1 (BYOK) menghemat biaya token API hingga 80% dibanding platform biasa.
          </p>
        </div>
      </section>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-zinc-800 space-y-4 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="flex border-b border-zinc-800 space-x-4 text-xs font-bold">
              <button
                onClick={() => setAuthTab("register")}
                className={`pb-2 ${authTab === "register" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-zinc-400"}`}
              >
                Daftar Baru
              </button>
              <button
                onClick={() => setAuthTab("login")}
                className={`pb-2 ${authTab === "login" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-zinc-400"}`}
              >
                Masuk Sesi
              </button>
            </div>

            {/* OAUTH BUTTONS */}
            <div className="space-y-2">
              <button
                onClick={() => triggerOAuth("google")}
                className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-white flex items-center justify-center space-x-2"
              >
                <i className="fa-brands fa-google text-rose-400"></i>
                <span>Lanjutkan dengan Google</span>
              </button>
              <button
                onClick={() => triggerOAuth("github")}
                className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-white flex items-center justify-center space-x-2"
              >
                <i className="fa-brands fa-github"></i>
                <span>Lanjutkan dengan GitHub</span>
              </button>
            </div>

            <div className="relative text-center border-b border-zinc-800 py-1">
              <span className="bg-zinc-950 px-2 text-[10px] text-zinc-500 relative -top-3">atau password</span>
            </div>

            {/* MANUAL FORM */}
            <form onSubmit={submitAuthForm} className="space-y-3 text-xs">
              {authTab === "register" && (
                <div>
                  <label className="block text-zinc-400 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Bagas Adi"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-zinc-400 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* MANDATORY HCAPTCHA */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label className="block text-xs font-semibold text-emerald-400">Verifikasi Keamanan hCaptcha (Wajib)</label>
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
                className="w-full py-3 rounded-xl emerald-btn text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
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
