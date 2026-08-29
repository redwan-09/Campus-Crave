"use client";

import { useEffect, useState } from "react";
import { Check, ClipboardList } from "lucide-react";

type Status = "preparing" | "ready" | "picked";

interface Ticket {
  token: string;
  item: string;
  sub: string;
  status: Status;
}

const STATUS_LABEL: Record<Status, string> = {
  preparing: "Preparing",
  ready: "Ready",
  picked: "Picked up",
};

const STATUS_CLASS: Record<Status, string> = {
  preparing: "bg-marigold/20 text-marigold",
  ready: "bg-leaf/20 text-leaf",
  picked: "bg-white/10 text-white/55",
};

const INITIAL: Ticket[] = [
  { token: "#482", item: "খিচুড়ি ও ডিম ভুনা", sub: "Pickup · 2 items", status: "preparing" },
  { token: "#483", item: "সিঙ্গারা x2 + চা", sub: "Delivery · Room 214", status: "ready" },
  { token: "#484", item: "চিকেন রোল", sub: "Pickup · 1 item", status: "preparing" },
  { token: "#481", item: "লাচ্ছি + পরোটা", sub: "Pickup · 2 items", status: "picked" },
];

const CYCLE: Status[] = ["preparing", "ready", "picked"];

export function TokenBoard() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL);
  const [flipping, setFlipping] = useState<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setTickets((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        setFlipping(idx);
        setTimeout(() => setFlipping(null), 500);
        const next = [...prev];
        const currentIdx = CYCLE.indexOf(next[idx].status);
        next[idx] = { ...next[idx], status: CYCLE[(currentIdx + 1) % CYCLE.length] };
        return next;
      });
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-[420px] mx-auto">
      <div className="relative bg-ink rounded-[32px] p-6 pt-6 pb-5 shadow-2xl -rotate-1 border border-white/5">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="font-display text-[13px] font-semibold uppercase tracking-wide text-cream/80">
            Central Canteen · Live queue
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-bold text-leaf">
            <span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse-dot" />
            LIVE
          </span>
        </div>
        <div className="space-y-2">
          {tickets.map((t, i) => (
            <div
              key={t.token}
              className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-3 py-2.5"
            >
              <span className="font-display font-bold text-[15px] text-cream bg-white/[0.08] rounded-lg px-2.5 py-1.5 shrink-0 min-w-[52px] text-center">
                {t.token}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bn text-[13.5px] font-semibold text-cream truncate">{t.item}</div>
                <div className="text-[11.5px] text-cream/50 mt-0.5">{t.sub}</div>
              </div>
              <span
                className={`shrink-0 font-display text-[11px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-full transition-transform duration-500 ${
                  STATUS_CLASS[t.status]
                } ${flipping === i ? "scale-90" : "scale-100"}`}
              >
                {STATUS_LABEL[t.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex absolute -top-5 -left-8 items-center gap-2.5 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 animate-float">
        <div className="w-8 h-8 rounded-full bg-leaf-tint flex items-center justify-center shrink-0">
          <Check size={16} className="text-leaf" />
        </div>
        <div>
          <div className="font-display text-[13px] font-bold leading-tight">No sold-out surprise</div>
          <div className="text-[11px] text-ink-soft">Stock synced live</div>
        </div>
      </div>

      <div
        className="hidden sm:flex absolute bottom-2 -right-8 items-center gap-2.5 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 animate-float"
        style={{ animationDelay: "0.6s", animationDuration: "7.5s" }}
      >
        <div className="w-8 h-8 rounded-full bg-periwinkle-tint flex items-center justify-center shrink-0">
          <ClipboardList size={16} className="text-periwinkle-deep" />
        </div>
        <div>
          <div className="font-display text-[13px] font-bold leading-tight">+30% throughput</div>
          <div className="text-[11px] text-ink-soft">vs. cash-line counters</div>
        </div>
      </div>
    </div>
  );
}
