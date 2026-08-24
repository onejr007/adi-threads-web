"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [sessionToken, setSessionToken] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"users" | "transactions" | "tickets">("users");

  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [currentTicketId, setCurrentTicketId] = useState("");
  const [ticketDetail, setTicketDetail] = useState<any>(null);
  const [adminReplyText, setAdminReplyText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adi_saas_token");
    if (!token) {
      alert("Silakan login sebagai Admin (chilooks91@gmail.com) terlebih dahulu.");
      window.location.href = "/";
      return;
    }
    setSessionToken(token);

    fetch(`/api/v1/threads/user/quota?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.user) {
          if (data.user.email !== "chilooks91@gmail.com" && !data.user.is_admin) {
            alert("⚡ Akses ditolak! Halaman ini khusus Lead Admin (chilooks91@gmail.com).");
            window.location.href = "/dashboard";
            return;
          }
          setCurrentUser(data.user);
          loadUsers(token);
        } else {
          window.location.href = "/";
        }
      });
  }, []);

  const loadUsers = async (token = sessionToken) => {
    try {
      const res = await fetch(`/api/v1/threads/admin/users?token=${token}`);
      const data = await res.json();
      if (data.status === "success") {
        setUsersList(data.users || []);
      }
    } catch (err) {}
  };

  const loadTransactions = async () => {
    try {
      const res = await fetch(`/api/v1/threads/admin/transactions?token=${sessionToken}`);
      const data = await res.json();
      if (data.status === "success") {
        setTransactionsList(data.transactions || []);
      }
    } catch (err) {}
  };

  const loadTickets = async () => {
    try {
      const res = await fetch(`/api/v1/threads/admin/tickets?token=${sessionToken}`);
      const data = await res.json();
      if (data.status === "success") {
        setTicketsList(data.tickets || []);
      }
    } catch (err) {}
  };

  const updateUserTier = async (email: string, tier: string) => {
    if (!confirm(`Ubah tier ${email} menjadi ${tier.toUpperCase()}?`)) return;
    try {
      const res = await fetch("/api/v1/threads/admin/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, email, tier }),
      });
      const data = await res.json();
      alert(data.message || "Update berhasil");
      loadUsers();
    } catch (err) {
      alert("Error update user");
    }
  };

  const resetUserQuota = async (email: string) => {
    if (!confirm(`Reset kuota penggunaan ${email}?`)) return;
    try {
      const res = await fetch("/api/v1/threads/admin/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, email, reset_quota: true }),
      });
      const data = await res.json();
      alert(data.message || "Reset berhasil");
      loadUsers();
    } catch (err) {
      alert("Error reset quota");
    }
  };

  const deleteUser = async (email: string) => {
    if (!confirm(`⚠️ HAPUS USER ${email}?`)) return;
    try {
      const res = await fetch("/api/v1/threads/admin/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, email }),
      });
      const data = await res.json();
      alert(data.message || "User terhapus");
      loadUsers();
    } catch (err) {
      alert("Error delete user");
    }
  };

  const auditMidtrans = async (orderId: string) => {
    alert(`🔍 Memeriksa status Order ${orderId} ke Midtrans API...`);
    try {
      const res = await fetch("/api/v1/threads/admin/transaction/audit-midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, order_id: orderId }),
      });
      const data = await res.json();
      alert(data.message || "Audit selesai");
      loadTransactions();
    } catch (err) {}
  };

  const verifyManual = async (orderId: string) => {
    if (!confirm(`Verifikasi manual & upgrade user untuk order ${orderId}?`)) return;
    try {
      const res = await fetch("/api/v1/threads/admin/transaction/verify-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, order_id: orderId }),
      });
      const data = await res.json();
      alert(data.message || "Verifikasi berhasil");
      loadTransactions();
    } catch (err) {}
  };

  const selectTicket = (t: any) => {
    setCurrentTicketId(t.ticket_id);
    setTicketDetail(t);
  };

  const sendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicketId || !adminReplyText.trim()) return;
    try {
      const res = await fetch("/api/v1/threads/admin/ticket/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, ticket_id: currentTicketId, message: adminReplyText }),
      });
      const data = await res.json();
      setAdminReplyText("");
      loadTickets();
      if (data.ticket) setTicketDetail(data.ticket);
    } catch (err) {}
  };

  const resolveTicket = async () => {
    if (!currentTicketId || !confirm(`Tandai tiket ${currentTicketId} Selesai?`)) return;
    try {
      const res = await fetch("/api/v1/threads/admin/ticket/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, ticket_id: currentTicketId }),
      });
      const data = await res.json();
      alert(data.message || "Tiket selesai");
      loadTickets();
      if (data.ticket) setTicketDetail(data.ticket);
    } catch (err) {}
  };

  const filteredUsers = usersList.filter(
    (u) =>
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* TOPBAR */}
      <header className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-amber-500/30 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            👑
          </div>
          <span className="font-extrabold text-xs text-white">
            ADMIN COMMAND CENTER <span className="text-amber-400 font-mono">(chilooks91@gmail.com)</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-emerald-400 transition-all"
          >
            Dashboard User
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-all"
          >
            Landing Page
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="p-6 max-w-6xl mx-auto w-full space-y-6 flex-grow">
        {/* TABS */}
        <div className="flex border-b border-zinc-800 space-x-4 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab("users");
              loadUsers();
            }}
            className={`pb-2 ${activeTab === "users" ? "text-amber-400 border-b-2 border-amber-400 font-extrabold" : "text-zinc-400"}`}
          >
            <i className="fa-solid fa-users mr-1.5"></i>Kelola User (CRUD)
          </button>
          <button
            onClick={() => {
              setActiveTab("transactions");
              loadTransactions();
            }}
            className={`pb-2 ${activeTab === "transactions" ? "text-amber-400 border-b-2 border-amber-400 font-extrabold" : "text-zinc-400"}`}
          >
            <i className="fa-solid fa-credit-card mr-1.5"></i>Audit Transaksi & Midtrans Live
          </button>
          <button
            onClick={() => {
              setActiveTab("tickets");
              loadTickets();
            }}
            className={`pb-2 ${activeTab === "tickets" ? "text-amber-400 border-b-2 border-amber-400 font-extrabold" : "text-zinc-400"}`}
          >
            <i className="fa-solid fa-headset mr-1.5"></i>Antrean Tiket & Live Chat
          </button>
        </div>

        {/* TAB 1: USER CRUD */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari user email/nama..."
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white w-64 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => loadUsers()}
                className="px-3 py-2 rounded-xl bg-zinc-900 text-amber-400 text-xs font-bold"
              >
                Refresh Data
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
              <table class="w-full text-left text-xs text-zinc-300">
                <thead class="bg-zinc-900 text-zinc-400 font-mono border-b border-zinc-800">
                  <tr>
                    <th class="p-3">User Email / Nama</th>
                    <th class="p-3">Tier</th>
                    <th class="p-3">Penggunaan Kuota</th>
                    <th class="p-3">Aksi Admin (CRUD)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800 bg-zinc-950 font-mono text-[11px]">
                  {filteredUsers.map((u) => {
                    const q = u.quota || {};
                    const isAdmin = u.email === "chilooks91@gmail.com";
                    return (
                      <tr key={u.email} className="hover:bg-zinc-900/50">
                        <td className="p-3">
                          <span className="font-bold text-white">{u.full_name || "User"}</span>
                          <span className="block text-[10px] text-zinc-400">{u.email} {isAdmin && "👑 (ADMIN)"}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.tier === "tier2_pro" ? "bg-amber-500/20 text-amber-400" : (u.tier === "tier1_basic" ? "bg-cyan-500/20 text-cyan-400" : "bg-zinc-800 text-zinc-400")}`}>
                            {(u.tier || "free").toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-[10px] text-zinc-400">
                          Post: {q.posts_used || 0}/{q.posts_limit || 10} | Komen: {q.public_comments_used || 0}/{q.public_comments_limit || 10}
                        </td>
                        <td className="p-3 space-x-1">
                          <button onClick={() => updateUserTier(u.email, "tier1_basic")} className="px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-[10px] font-bold">BYOK Tier1</button>
                          <button onClick={() => updateUserTier(u.email, "tier2_pro")} className="px-2 py-1 bg-amber-600/20 text-amber-400 rounded text-[10px] font-bold">Pro Tier2</button>
                          <button onClick={() => resetUserQuota(u.email)} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-[10px] font-bold">Reset Kuota</button>
                          {!isAdmin && (
                            <button onClick={() => deleteUser(u.email)} className="px-2 py-1 bg-rose-600/20 text-rose-400 rounded text-[10px] font-bold">Hapus</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Daftar transaksi pembayaran Midtrans Snap API.</span>
              <button onClick={() => loadTransactions()} className="px-3 py-2 rounded-xl bg-zinc-900 text-amber-400 font-bold">Refresh Transaksi</button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-400 font-mono border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Tier Target</th>
                    <th className="p-3">Nominal</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Audit Live Midtrans</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950 font-mono text-[11px]">
                  {transactionsList.map((tx) => (
                    <tr key={tx.order_id} className="hover:bg-zinc-900/50">
                      <td className="p-3 font-bold text-amber-400">{tx.order_id}</td>
                      <td className="p-3 text-zinc-300">{tx.email}</td>
                      <td className="p-3 text-cyan-400">{(tx.target_tier || "").toUpperCase()}</td>
                      <td className="p-3 font-bold text-white">Rp {(tx.amount || 0).toLocaleString("id-ID")}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {(tx.status || "pending").toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 space-x-1">
                        <button onClick={() => auditMidtrans(tx.order_id)} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">🔍 Audit Live API</button>
                        {tx.status !== "paid" && (
                          <button onClick={() => verifyManual(tx.order_id)} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-[10px] font-bold">✅ Verifikasi Manual</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TICKETS & LIVE CHAT TAKEOVER */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Daftar Antrean Tiket</span>
                <button onClick={() => loadTickets()} className="text-amber-400 hover:underline">Refresh</button>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {ticketsList.map((t) => (
                  <div
                    key={t.ticket_id}
                    onClick={() => selectTicket(t)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${currentTicketId === t.ticket_id ? "bg-amber-500/10 border-amber-500" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-amber-400 text-[11px]">{t.ticket_id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${t.status === "escalated" ? "bg-rose-500/20 text-rose-400 animate-pulse" : (t.status === "resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/20 text-cyan-400")}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-xs truncate">{t.subject}</p>
                    <span className="block text-[10px] text-zinc-500 truncate">{t.user_name} ({t.user_email})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE CHAT PANE */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col h-[450px]">
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white">{ticketDetail ? `${ticketDetail.ticket_id} — ${ticketDetail.subject}` : "Pilih tiket di sebelah kiri"}</span>
                  {ticketDetail && (
                    <span className="block text-[10px] text-zinc-400">Kustomer: {ticketDetail.user_name} ({ticketDetail.user_email})</span>
                  )}
                </div>
                {ticketDetail && (
                  <button onClick={resolveTicket} className="px-3 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold">
                    Mark Resolved
                  </button>
                )}
              </div>

              <div className="flex-grow my-3 overflow-y-auto space-y-2 text-xs font-mono-code p-2 bg-zinc-900/60 rounded-xl">
                {ticketDetail && ticketDetail.messages ? (
                  ticketDetail.messages.map((m: any, idx: number) => (
                    <div key={idx} className={`p-2.5 rounded-xl ${m.sender === "admin" ? "bg-amber-500/10 border border-amber-500/30 text-amber-300 ml-6" : "bg-zinc-950 border border-zinc-800 text-white mr-6"}`}>
                      <div className="flex justify-between items-center text-[10px] font-bold mb-1 text-amber-400">
                        <span>{m.name || m.sender.toUpperCase()}</span>
                        <span className="text-zinc-500">{new Date(m.timestamp).toLocaleTimeString("id-ID")}</span>
                      </div>
                      <p className="leading-relaxed text-xs">{m.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-zinc-500 py-12">Pilih salah satu tiket di antrean.</div>
                )}
              </div>

              <form onSubmit={sendAdminReply} className="flex items-center space-x-2">
                <input
                  type="text"
                  disabled={!ticketDetail}
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder="Tulis balasan Admin..."
                  className="flex-grow px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button type="submit" disabled={!ticketDetail} className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs">
                  Kirim
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
