"use client";

import useSWR from "swr";
import { Loader2, Store, GraduationCap, Receipt, Wallet } from "lucide-react";
import { formatBDT } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Stats {
  activeCanteens: number;
  pendingCanteens: number;
  totalStudents: number;
  ordersToday: number;
  totalGMV: number;
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useSWR<Stats>("/api/admin/stats", fetcher, {
    refreshInterval: 15000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2 text-ink-soft text-sm py-10 justify-center">
        <Loader2 size={16} className="animate-spin" /> Loading platform stats…
      </div>
    );
  }

  const cards = [
    { icon: Store, label: "Active canteens", value: data.activeCanteens, bg: "bg-periwinkle-tint", fg: "text-periwinkle-deep" },
    { icon: GraduationCap, label: "Students onboarded", value: data.totalStudents, bg: "bg-leaf-tint", fg: "text-leaf" },
    { icon: Receipt, label: "Orders today", value: data.ordersToday, bg: "bg-marigold/15", fg: "text-marigold-deep" },
    { icon: Wallet, label: "Total GMV (paid)", value: formatBDT(data.totalGMV), bg: "bg-chili-tint", fg: "text-chili" },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Platform overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-line p-5">
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon size={17} className={c.fg} />
            </div>
            <div className="font-display font-bold text-2xl">{c.value}</div>
            <div className="text-xs text-ink-soft font-semibold mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {data.pendingCanteens > 0 && (
        <div className="bg-marigold/10 border border-marigold/30 text-marigold-deep text-sm font-medium rounded-2xl px-5 py-4">
          {data.pendingCanteens} canteen{data.pendingCanteens > 1 ? "s" : ""} waiting for
          approval —{" "}
          <a href="/admin/canteens" className="underline font-semibold">
            review them here
          </a>
          .
        </div>
      )}
    </div>
  );
}
