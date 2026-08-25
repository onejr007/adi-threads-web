"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [niche, setNiche] = useState("web_development");
  const [keywords, setKeywords] = useState("");
  const [topics, setTopics] = useState("");
  const [persona, setPersona] = useState("casual_dev");
  const [brandName, setBrandName] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [brandPitch, setBrandPitch] = useState("");
  const [promotionMode, setPromotionMode] = useState("soft_sell");

  const [simPersona, setSimPersona] = useState("casual_dev");
  const [simStrategy, setSimStrategy] = useState("soft_sell");
  const [simResultText, setSimResultText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [byokToken, setByokToken] = useState("");
  const [byokUserId, setByokUserId] = useState("");

  const [wsDailyCap, setWsDailyCap] = useState("");
  const [wsIntervalMin, setWsIntervalMin] = useState("");
  const [wsInfo, setWsInfo] = useState("Memuat pengaturan worker...");
  const [isSavingWs, setIsSavingWs] = useState(false);

  const loadWorkerSettings = () => {
    fetch("/api/v1/threads/worker/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setWsDailyCap(String(data.daily_post_cap));
          setWsIntervalMin(String(Math.round(data.post_interval_seconds / 60)));
          setWsInfo(
            `Aktif: ${data.daily_post_cap} post/hari • jeda ${data.post_interval_seconds}s • ±${data.posts_per_hour} post/jam (rolling 24 jam, kuota keras Meta Graph API 250/hari).`
          );
        }
      })
      .catch(() => setWsInfo("Gagal memuat pengaturan worker."));
  };

  useEffect(() => {
    loadWorkerSettings();
  }, []);

  const saveWorkerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseInt(wsDailyCap, 10);
    const intervalMin = parseInt(wsIntervalMin, 10);
    if (!cap || !intervalMin || cap < 1 || cap > 240 || intervalMin < 2 || intervalMin > 1440) {
      alert("Isi limit harian (1-240) dan jeda posting (2-1440 menit) dengan nilai valid.");
      return;
    }
    setIsSavingWs(true);
    try {
      const res = await fetch("/api/v1/threads/worker/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_post_cap: cap, post_interval_seconds: intervalMin * 60 }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        alert("Gagal menyimpan: " + (data.detail || data.message || "Error tidak diketahui."));
        return;
      }
      setWsDailyCap(String(data.daily_post_cap));
      setWsIntervalMin(String(Math.round(data.post_interval_seconds / 60)));
      setWsInfo(
        `Aktif: ${data.daily_post_cap} post/hari • jeda ${data.post_interval_seconds}s • ±${data.posts_per_hour} post/jam (rolling 24 jam, kuota keras Meta Graph API 250/hari).`
      );
      alert("✅ Pengaturan worker tersimpan & langsung aktif tanpa restart.");
    } catch (err) {
      alert("Gagal menghubungi server.");
    } finally {
      setIsSavingWs(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adi_saas_token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    setSessionToken(token);
    fetch(`/api/v1/threads/user/quota?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.user) {
          setCurrentUser(data.user);
          const prefs = data.user.preferences || {};
          if (prefs.niche) setNiche(prefs.niche);
          if (prefs.target_keywords) setKeywords(prefs.target_keywords);
          if (prefs.post_topics) setTopics(prefs.post_topics);
          if (prefs.reply_tone_persona) setPersona(prefs.reply_tone_persona);
          if (prefs.brand_product_name) setBrandName(prefs.brand_product_name);
          if (prefs.brand_product_url) setBrandUrl(prefs.brand_product_url);
          if (prefs.brand_product_pitch) setBrandPitch(prefs.brand_product_pitch);
          if (prefs.promotion_mode) setPromotionMode(prefs.promotion_mode);

          if (data.user.byok_access_token) setByokToken(data.user.byok_access_token);
          if (data.user.byok_user_id) setByokUserId(data.user.byok_user_id);
        } else {
          localStorage.removeItem("adi_saas_token");
          window.location.href = "/";
        }
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, []);

  const savePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/threads/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          niche,
          target_keywords: keywords,
          post_topics: topics,
          reply_tone_persona: persona,
          brand_product_name: brandName,
          brand_product_url: brandUrl,
          brand_product_pitch: brandPitch,
          promotion_mode: promotionMode,
        }),
      });
      const data = await res.json();
      alert(data.message || "Pengaturan berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan pengaturan");
    }
  };

  const saveByokKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/threads/user/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          access_token: byokToken,
          user_id: byokUserId,
        }),
      });
      const data = await res.json();
      alert(data.message || "Kunci Meta Threads disimpan!");
    } catch (err) {
      alert("Gagal menyimpan kunci BYOK");
    }
  };

  const runSimulation = async () => {
    setIsGenerating(true);
    setSimResultText("⚡ AI Agent ADI sedang menyusun postingan stealth...");
    try {
      const res = await fetch("/api/v1/threads/adichat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Simulasikan 1 postingan Threads tentang Niche: ${niche}, Persona: ${simPersona}, Strategi: ${simStrategy}, Produk: ${brandName || 'Custom Produk'} (${brandUrl || 'http://link'}).`,
          token: sessionToken,
        }),
      });
      const data = await res.json();
      setSimResultText(data.reply || "Simulasi selesai.");
    } catch (err) {
      setSimResultText("Error menghubungkan simulasi");
    }
    setIsGenerating(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-xs">
        Memuat Dashboard ADI Threads...
      </div>
    );
  }

  const q = currentUser.quota || {};

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* TOPBAR */}
      <header className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl emerald-btn flex items-center justify-center font-bold text-zinc-950 text-sm">
              ⚡
            </div>
            <span className="font-bold text-xs text-white">ADI THREADS DASHBOARD</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {currentUser.email === "chilooks91@gmail.com" && (
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all flex items-center"
            >
              <i className="fa-solid fa-crown mr-1.5"></i>Admin Command Center
            </Link>
          )}
          <Link
            href="/tickets"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-cyan-400 transition-all flex items-center"
          >
            <i className="fa-solid fa-ticket mr-1.5"></i>Tiket Support
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("adi_saas_token");
              window.location.href = "/";
            }}
            className="text-xs text-zinc-500 hover:text-rose-400 p-2"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="p-6 max-w-6xl mx-auto w-full space-y-8 flex-grow">
        {/* USER WELCOME & QUOTA */}
        <div className="glass-card p-6 rounded-3xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Selamat datang, {currentUser.full_name || currentUser.email}!
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Status Akun: <span className="text-emerald-400 font-bold font-mono">{currentUser.tier.toUpperCase()}</span>
            </p>
          </div>

          {/* QUOTA METERS */}
          <div className="flex items-center space-x-4 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 block">Kuota Post</span>
              <span className="font-bold text-white">{q.posts_used || 0} / {q.posts_limit || 10}</span>
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Komen Publik</span>
              <span className="font-bold text-white">{q.public_comments_used || 0} / {q.public_comments_limit || 10}</span>
            </div>
          </div>
        </div>

        {/* SIMULATOR & GENERATOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <i className="fa-solid fa-wand-magic-sparkles text-emerald-400 mr-2"></i>Simulasi Post & Strategi AI
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Pilih Persona AI</label>
                <select
                  value={simPersona}
                  onChange={(e) => setSimPersona(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="casual_dev">👨‍💻 Casual Developer (Santuy, Relate, Tech)</option>
                  <option value="professional">💼 Professional Expert (Formal, Insightful)</option>
                  <option value="storyteller">📖 Storyteller / Founder Journey (Emotional, Inspiring)</option>
                  <option value="viral_hustler">⚡ Viral Hustler (Punchy, High Engagement)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Strategi Penjualan Produk</label>
                <select
                  value={simStrategy}
                  onChange={(e) => setSimStrategy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="soft_sell">🌿 Soft Selling (Edukasi + Natural Pitch)</option>
                  <option value="hard_sell">🔥 Hard Selling (Direct Promo + Call-to-Action)</option>
                  <option value="story_pitch">📖 Story Pitch (Pengalaman Pribadi -&gt; Produk)</option>
                </select>
              </div>

              <button
                onClick={runSimulation}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl emerald-btn text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all"
              >
                {isGenerating ? "Menyusun Postingan..." : "Uji Coba Generate Post Stealth"}
              </button>
            </div>
          </div>

          {/* SIMULATION RESULT BOX (WITH TEXT OVERFLOW FIX) */}
          <div className="glass-card p-6 rounded-3xl border border-zinc-800 flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <i className="fa-solid fa-terminal text-cyan-400 mr-2"></i>Hasil Output Simulation Box
            </h3>

            <div className="flex-grow p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono-code text-zinc-300 leading-relaxed overflow-hidden max-w-full break-words whitespace-pre-wrap">
              {simResultText || "Klik tombol 'Uji Coba Generate' untuk melihat postingan otomatis AI ADI."}
            </div>
          </div>
        </div>

        {/* PREFERENCES & BYOK FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PRODUCT & PERSONA PREFERENCES */}
          <form onSubmit={savePreferences} className="glass-card p-6 rounded-3xl border border-zinc-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">⚙️ Kustomisasi Produk & Niche Anda</h3>

            <div>
              <label className="block text-zinc-400 mb-1">Nama Brand / Produk</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Misal: JasaWebSurabaya.com"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">URL Landing Page Produk</label>
              <input
                type="url"
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
                placeholder="https://jasawebsurabaya.com"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Ringkasan Value Pitch Produk</label>
              <textarea
                rows={2}
                value={brandPitch}
                onChange={(e) => setBrandPitch(e.target.value)}
                placeholder="Website kilat 1 hari jadi ditenagai Next.js & SEO otomatis..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 font-bold text-emerald-400"
            >
              Simpan Pengaturan Produk
            </button>
          </form>

          {/* BYOK FACEBOOK DEVELOPER KEYS */}
          <form onSubmit={saveByokKeys} className="glass-card p-6 rounded-3xl border border-zinc-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">🔑 Facebook Developer Keys (Tier 1 BYOK)</h3>

            <div>
              <label className="block text-zinc-400 mb-1">Meta Threads Access Token (Long-Lived)</label>
              <input
                type="password"
                value={byokToken}
                onChange={(e) => setByokToken(e.target.value)}
                placeholder="THQW..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Meta Threads User ID</label>
              <input
                type="text"
                value={byokUserId}
                onChange={(e) => setByokUserId(e.target.value)}
                placeholder="178414..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 font-bold text-cyan-400 hover:bg-cyan-600/30"
            >
              Simpan Kunci BYOK Meta Threads
            </button>
          </form>
        </div>

        {/* WORKER 24/7 SETTINGS (ADMIN ONLY) */}
        {currentUser.email === "chilooks91@gmail.com" && (
          <form onSubmit={saveWorkerSettings} className="glass-card p-6 rounded-3xl border border-zinc-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center">
              <i className="fa-solid fa-sliders text-amber-400 mr-2"></i>Pengaturan Worker 24/7 (TOS Guard)
            </h3>
            <p className="text-zinc-400 -mt-2">
              Sesuaikan limit posting harian &amp; jeda antar posting engine otonom. Tersimpan persisten dan langsung aktif tanpa restart.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 mb-1">Limit Post / Hari (maks 240)</label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={wsDailyCap}
                  onChange={(e) => setWsDailyCap(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Jeda Antar Post (menit)</label>
                <input
                  type="number"
                  min={2}
                  max={1440}
                  value={wsIntervalMin}
                  onChange={(e) => setWsIntervalMin(e.target.value)}
                  placeholder="15"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <p className="font-mono-code text-[11px] text-zinc-500">{wsInfo}</p>
            </div>

            <button
              type="submit"
              disabled={isSavingWs}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white shadow-md transition-all disabled:opacity-50"
            >
              {isSavingWs ? "Menyimpan..." : "Simpan Pengaturan Worker"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
