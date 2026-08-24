"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function TicketsPage() {
  const [sessionToken, setSessionToken] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [currentTicketId, setCurrentTicketId] = useState("");
  const [ticketDetail, setTicketDetail] = useState<any>(null);
  const [userMsgText, setUserMsgText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adi_saas_token");
    if (!token) {
      alert("Silakan login terlebih dahulu untuk mengakses Tiket Support.");
      window.location.href = "/";
      return;
    }
    setSessionToken(token);
    fetch(`/api/v1/threads/user/quota?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.user) {
          setCurrentUser(data.user);
          loadTickets(token);
        } else {
          window.location.href = "/";
        }
      });
  }, []);

  const loadTickets = async (token = sessionToken) => {
    try {
      const res = await fetch(`/api/v1/threads/tickets/my-tickets?token=${token}`);
      const data = await res.json();
      if (data.status === "success") {
        setTicketsList(data.tickets || []);
      }
    } catch (err) {}
  };

  const selectTicket = (t: any) => {
    setCurrentTicketId(t.ticket_id);
    setTicketDetail(t);
  };

  const sendUserMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicketId || !userMsgText.trim()) return;
    try {
      const res = await fetch("/api/v1/threads/tickets/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, ticket_id: currentTicketId, message: userMsgText }),
      });
      const data = await res.json();
      setUserMsgText("");
      loadTickets();
      if (data.ticket) setTicketDetail(data.ticket);
    } catch (err) {}
  };

  const createNewTicket = async () => {
    const subject = prompt("Subjek / Topik Kendala:");
    if (!subject) return;
    const msg = prompt("Deskripsi Kendala yang Anda Alami:");
    if (!msg) return;

    try {
      const res = await fetch("/api/v1/threads/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, subject, message: msg }),
      });
      const data = await res.json();
      alert(`Tiket Bantuan ${data.ticket_id || ""} berhasil dibuat! Lead Admin akan segera menanggapi.`);
      loadTickets();
    } catch (err) {
      alert("Gagal membuat tiket");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* TOPBAR */}
      <header className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
            🎫
          </div>
          <span className="font-extrabold text-xs text-white">TIKET SUPPORT & BANTUAN SAAS</span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-emerald-400 transition-all"
          >
            Dashboard
          </Link>
          <button
            onClick={createNewTicket}
            className="px-3.5 py-1.5 rounded-xl emerald-btn text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
          >
            + Buat Tiket Baru
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 max-w-5xl mx-auto w-full space-y-6 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TICKET LIST */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white block">Riwayat Tiket Bantuan Anda</span>
            <div className="space-y-2 max-h-[450px] overflow-y-auto">
              {ticketsList.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-500 text-center">
                  Belum ada tiket bantuan.
                </div>
              ) : (
                ticketsList.map((t) => (
                  <div
                    key={t.ticket_id}
                    onClick={() => selectTicket(t)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${currentTicketId === t.ticket_id ? "bg-cyan-500/10 border-cyan-500" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-cyan-400 text-[11px]">{t.ticket_id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${t.status === "resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-xs truncate">{t.subject}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CHAT THREAD DETAIL */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col h-[480px]">
            <div className="border-b border-zinc-800 pb-3 text-xs">
              <span className="font-bold text-white">
                {ticketDetail ? `${ticketDetail.ticket_id} — ${ticketDetail.subject}` : "Pilih tiket di sebelah kiri"}
              </span>
            </div>

            <div className="flex-grow my-3 overflow-y-auto space-y-2 text-xs font-mono-code p-2 bg-zinc-900/60 rounded-xl">
              {ticketDetail && ticketDetail.messages ? (
                ticketDetail.messages.map((m: any, idx: number) => (
                  <div key={idx} className={`p-2.5 rounded-xl ${m.sender === "user" ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 ml-6" : "bg-amber-500/10 border border-amber-500/30 text-amber-300 mr-6"}`}>
                    <div className="flex justify-between items-center text-[10px] font-bold mb-1 text-cyan-400">
                      <span>{m.name || (m.sender === "user" ? "Anda" : "Admin Support")}</span>
                      <span className="text-zinc-500">{new Date(m.timestamp).toLocaleTimeString("id-ID")}</span>
                    </div>
                    <p className="leading-relaxed text-xs">{m.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-zinc-500 py-16">Pilih salah satu tiket di daftar sebelah kiri.</div>
              )}
            </div>

            <form onSubmit={sendUserMessage} className="flex items-center space-x-2">
              <input
                type="text"
                disabled={!ticketDetail}
                value={userMsgText}
                onChange={(e) => setUserMsgText(e.target.value)}
                placeholder="Tulis balasan pesan ke Admin..."
                className="flex-grow px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" disabled={!ticketDetail} className="px-4 py-2 rounded-xl emerald-btn text-xs font-bold text-white">
                Kirim
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
