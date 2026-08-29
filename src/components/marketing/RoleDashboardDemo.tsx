"use client";

import { useState } from "react";
import {
  GraduationCap,
  Store,
  ShieldCheck,
  Check,
  Ticket,
  MapPin,
  CreditCard,
  UtensilsCrossed,
  ClipboardList,
  BarChart3,
  Receipt,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";

type Role = "student" | "manager" | "admin";

const ROLES: { key: Role; label: string; icon: React.ElementType }[] = [
  { key: "student", label: "Student", icon: GraduationCap },
  { key: "manager", label: "Canteen manager", icon: Store },
  { key: "admin", label: "Platform admin", icon: ShieldCheck },
];

export function RoleDashboardDemo() {
  const [role, setRole] = useState<Role>("student");

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex gap-1 bg-periwinkle-tint p-1.5 rounded-full mb-11">
          {ROLES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setRole(key)}
              className={`flex items-center gap-2 font-display font-semibold text-[13px] sm:text-sm px-3.5 sm:px-5 py-2.5 rounded-full transition-all ${
                role === key
                  ? "bg-ink text-cream shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Reveal>
        <div className="bg-periwinkle-tint rounded-[32px] p-4 sm:p-8 lg:p-11 border border-periwinkle-tint-2">
          {role === "student" && <StudentPreview />}
          {role === "manager" && <ManagerPreview />}
          {role === "admin" && <AdminPreview />}
        </div>
      </Reveal>
    </div>
  );
}

/* -------------------------------- STUDENT -------------------------------- */

function StudentPreview() {
  const menu = [
    { emoji: "🍛", name: "খিচুড়ি ও ডিম ভুনা", price: "৳70", stock: "ok" as const },
    { emoji: "🥟", name: "আলুর চপ", price: "৳15", stock: "low" as const },
    { emoji: "🌯", name: "চিকেন রোল", price: "৳90", stock: "ok" as const },
    { emoji: "🥤", name: "লাচ্ছি", price: "৳50", stock: "ok" as const },
  ];

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-center">
      <div className="w-[300px] mx-auto bg-ink rounded-[44px] p-3.5 shadow-2xl -rotate-1">
        <div className="bg-cream rounded-[32px] overflow-hidden min-h-[540px] flex flex-col">
          <div className="h-6 flex items-center justify-center">
            <div className="w-16 h-1.5 rounded-full bg-ink/15" />
          </div>
          <div className="px-5 pb-3 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-[14px] leading-tight">Central Canteen</div>
              <div className="text-[10.5px] text-ink-soft font-semibold">DU Campus · Kala Bhaban</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-periwinkle text-white flex items-center justify-center font-display font-bold text-xs">
              RH
            </div>
          </div>
          <div className="px-4 grid grid-cols-2 gap-2.5">
            {menu.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl p-3 shadow-sm">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 text-lg ${
                    m.stock === "low" ? "bg-periwinkle-tint" : "bg-cream-deep"
                  }`}
                >
                  {m.emoji}
                </div>
                <div className="font-bn text-[11.5px] font-bold leading-tight">{m.name}</div>
                <div className="font-display text-[13px] font-bold text-periwinkle-deep mt-1">
                  {m.price}
                </div>
                <span
                  className={`inline-block mt-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${
                    m.stock === "low" ? "bg-marigold/15 text-marigold-deep" : "bg-leaf-tint text-leaf"
                  }`}
                >
                  {m.stock === "low" ? "Low stock" : "Available"}
                </span>
              </div>
            ))}
          </div>
          <div className="mx-4 mt-4 mb-4 bg-ink rounded-2xl p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="font-display text-[11px] text-cream/70">YOUR TOKEN</div>
              <div className="font-display text-2xl font-bold text-cream">#482</div>
            </div>
            <div className="flex items-center mt-4">
              {["Placed", "Preparing", "Ready", "Picked up"].map((step, i) => (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {i < 3 && (
                    <div
                      className={`absolute top-[11px] left-1/2 w-full h-0.5 z-0 ${
                        i < 1 ? "bg-leaf" : "bg-white/10"
                      }`}
                    />
                  )}
                  <div
                    className={`w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 ${
                      i === 0 ? "bg-leaf" : i === 1 ? "bg-marigold animate-pulse-dot" : "bg-white/10"
                    }`}
                  >
                    {i === 0 && <Check size={11} className="text-white" />}
                  </div>
                  <span
                    className={`text-[9px] font-semibold mt-1.5 text-center ${
                      i <= 1 ? "text-cream" : "text-cream/40"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <span className="inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-wide text-periwinkle-deep bg-periwinkle-tint px-3.5 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-marigold" />
          Student view
        </span>
        <h3 className="font-display font-bold text-2xl mt-4 mb-2.5">
          Order in the time it takes to walk to your next class
        </h3>
        <p className="text-ink-soft text-[15px] leading-relaxed mb-6">
          Only what a hungry student actually needs — nothing about sales,
          other orders, or canteen operations ever shows up here.
        </p>
        <div className="flex flex-col gap-4">
          {[
            { icon: UtensilsCrossed, title: "Live menu & stock", body: "Availability updates the second the canteen toggles it." },
            { icon: Ticket, title: "One token, no line", body: "Walk in, show the token, walk out." },
            { icon: MapPin, title: "Room-level delivery", body: "Building, floor and room, not just a GPS pin." },
            { icon: CreditCard, title: "Pay your way", body: "bKash, Nagad, Rocket, card or in-app balance." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 items-start">
              <div className="w-[26px] h-[26px] rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                <item.icon size={14} className="text-periwinkle-deep" />
              </div>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">
                <strong className="text-ink">{item.title}</strong> — {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- MANAGER -------------------------------- */

function ManagerPreview() {
  const kanban = {
    New: [
      { tok: "#485", items: "লেবু চা x2", type: "Pickup" },
      { tok: "#486", items: "বিরিয়ানি", type: "Room 108" },
    ],
    Preparing: [
      { tok: "#482", items: "খিচুড়ি ও ডিম ভুনা", type: "Pickup" },
      { tok: "#484", items: "চিকেন রোল", type: "Pickup" },
    ],
    Ready: [{ tok: "#483", items: "সিঙ্গারা x2 + চা", type: "Room 214" }],
  };
  const bars = [28, 42, 65, 100, 88, 50, 34];
  const labels = ["9a", "10a", "11a", "12p", "1p", "2p", "3p"];
  const stock = [
    { name: "খিচুড়ি ও ডিম ভুনা", on: true },
    { name: "আলুর চপ", on: false },
    { name: "চিকেন রোল", on: true },
    { name: "লাচ্ছি", on: true },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-[76px_1fr]">
      <div className="hidden md:flex bg-ink flex-col items-center py-6 gap-2">
        <div className="w-8.5 h-8.5 w-[34px] h-[34px] rounded-xl bg-periwinkle flex items-center justify-center mb-5">
          <Store size={16} className="text-white" />
        </div>
        {[ClipboardList, UtensilsCrossed, BarChart3, Receipt].map((Icon, i) => (
          <div
            key={i}
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              i === 0 ? "bg-white/10 text-cream" : "text-cream/40"
            }`}
          >
            <Icon size={18} />
          </div>
        ))}
      </div>
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <h4 className="font-display font-bold text-lg">Central Canteen — Order queue</h4>
          <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-leaf bg-leaf-tint px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse-dot" />
            Live · updates every order
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-3.5 mb-6">
          {Object.entries(kanban).map(([col, cards]) => (
            <div key={col}>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <span className="text-[12px] font-bold text-ink-soft uppercase tracking-wide">{col}</span>
                <span className="font-display text-[11px] font-bold bg-periwinkle-tint text-periwinkle-deep px-2 py-0.5 rounded-full">
                  {cards.length}
                </span>
              </div>
              {cards.map((c) => (
                <div key={c.tok} className="bg-cream border border-line rounded-2xl p-3 mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-bold text-[13px]">{c.tok}</span>
                  </div>
                  <div className="font-bn text-[12.5px] text-ink-soft mb-2">{c.items}</div>
                  <span
                    className={`inline-flex text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      c.type === "Pickup" ? "bg-periwinkle-tint text-periwinkle-deep" : "bg-marigold/15 text-marigold-deep"
                    }`}
                  >
                    {c.type}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-4">
          <div className="bg-cream rounded-2xl p-4 sm:p-5 border border-line">
            <h5 className="font-display text-[13.5px] font-bold mb-4 flex items-center justify-between">
              Today&apos;s hourly demand <small className="font-body font-semibold text-ink-soft text-[11.5px]">orders / hour</small>
            </h5>
            <div className="flex items-end gap-2 h-[100px]">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 relative">
                  <div
                    className="rounded-t-md bg-gradient-to-b from-periwinkle to-periwinkle-deep transition-all duration-1000"
                    style={{ height: `${h}%` }}
                  />
                  <span className="absolute -bottom-5 inset-x-0 text-center text-[9.5px] text-ink-soft font-semibold">
                    {labels[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-cream rounded-2xl p-4 sm:p-5 border border-line">
            <h5 className="font-display text-[13.5px] font-bold mb-3">Menu &amp; stock</h5>
            {stock.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-line last:border-0 text-[13px] font-semibold">
                <span className="font-bn">{s.name}</span>
                <div
                  className={`w-9 h-5 rounded-full relative transition-colors ${
                    s.on ? "bg-leaf" : "bg-chili"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      s.on ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- ADMIN --------------------------------- */

function AdminPreview() {
  const stats = [
    { icon: "🏫", n: 6, label: "Active canteens", bg: "bg-periwinkle-tint" },
    { icon: "🎓", n: 4200, suffix: "+", label: "Students onboarded", bg: "bg-leaf-tint" },
    { icon: "🧾", n: 318, label: "Orders today", bg: "bg-marigold/15" },
    { icon: "🏍️", n: 9, label: "Runners online", bg: "bg-chili-tint" },
  ];
  const canteens = [
    { name: "Central Canteen · Kala Bhaban", tier: "Premium", orders: 112 },
    { name: "Engineering Faculty Tuck-shop", tier: "Standard", orders: 76 },
    { name: "Hall Canteen · Zahurul Haq", tier: "Basic", orders: 44 },
    { name: "Library Café", tier: "Standard", orders: 61 },
  ];
  const tierClass: Record<string, string> = {
    Basic: "bg-periwinkle-tint text-periwinkle-deep",
    Standard: "bg-marigold/15 text-marigold-deep",
    Premium: "bg-ink text-cream",
  };
  const zones = [0.15, 0.9, 0.35, 0.6, 0.2, 0.75, 0.4, 0.95, 0.25, 0.55, 0.1, 0.7];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3 text-base`}>
              {s.icon}
            </div>
            <div className="font-display text-2xl font-bold">
              <CountUp target={s.n} suffix={s.suffix ?? ""} />
            </div>
            <div className="text-[11.5px] text-ink-soft font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
        <div className="bg-cream rounded-2xl p-4 sm:p-5 border border-line overflow-x-auto">
          <h5 className="font-display text-[13.5px] font-bold mb-4">Canteens on the platform</h5>
          <table className="w-full border-collapse min-w-[420px]">
            <thead>
              <tr>
                {["Canteen", "Plan", "Orders today", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10.5px] uppercase tracking-wide text-ink-soft font-bold pb-2.5 px-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {canteens.map((c) => (
                <tr key={c.name} className="[&>td]:bg-white [&>td]:py-2.5 [&>td]:px-2.5 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg text-[13px]">
                  <td>{c.name}</td>
                  <td>
                    <span className={`font-display text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${tierClass[c.tier]}`}>
                      {c.tier}
                    </span>
                  </td>
                  <td>{c.orders}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-leaf">
                      Online
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-cream rounded-2xl p-4 sm:p-5 border border-line">
          <h5 className="font-display text-[13.5px] font-bold mb-3">Pending canteen approvals</h5>
          <div className="flex flex-col gap-2.5">
            {[
              { name: "Science Faculty Canteen", when: "Applied 2 days ago" },
              { name: "Business Faculty Snack Bar", when: "Applied yesterday" },
            ].map((a) => (
              <div key={a.name} className="bg-white rounded-xl px-3 py-2.5 flex items-center justify-between text-[12.5px]">
                <div>
                  <div className="font-bold text-[13px]">{a.name}</div>
                  <div className="text-ink-soft text-[11px]">{a.when}</div>
                </div>
                <div className="flex gap-1.5">
                  <button className="w-6.5 h-6.5 w-[26px] h-[26px] rounded-lg bg-leaf-tint text-leaf flex items-center justify-center">
                    <Check size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h5 className="font-display text-[13.5px] font-bold mb-2 mt-4">Campus order density</h5>
          <div className="grid grid-cols-6 gap-1.5">
            {zones.map((v, i) => (
              <div
                key={i}
                className="aspect-square rounded-md"
                style={{
                  background: `rgb(${Math.round(110 + v * 135)}, ${Math.round(127 + v * 39)}, ${Math.round(224 - v * 180)})`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
