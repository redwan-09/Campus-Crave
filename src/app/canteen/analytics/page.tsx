"use client";

import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { formatBDT } from "@/lib/constants";
import { TierBadge, CanteenStatusBadge } from "@/components/ui/Badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Stats {
  canteen: {
    name: string;
    campus: string;
    status: string;
    subscriptionTier: string;
    commissionRate: string;
  };
  ordersToday: number;
  revenueToday: number;
  totalOrders: number;
  hourlyCounts: number[];
}

export default function CanteenAnalyticsPage() {
  const { data, isLoading } = useSWR<Stats>("/api/canteen/stats", fetcher, {
    refreshInterval: 15000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2 text-ink-soft text-sm py-10 justify-center">
        <Loader2 size={16} className="animate-spin" /> Loading analytics…
      </div>
    );
  }

  const maxCount = Math.max(...data.hourlyCounts, 1);
  // Focus the chart on a realistic campus day, 7am–9pm
  const displayHours = Array.from({ length: 15 }, (_, i) => i + 7);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">{data.canteen.name}</h1>
          <p className="text-ink-soft text-sm">{data.canteen.campus}</p>
        </div>
        <div className="flex gap-2">
          <TierBadge tier={data.canteen.subscriptionTier} />
          <CanteenStatusBadge status={data.canteen.status} />
        </div>
      </div>

      {data.canteen.status === "pending" && (
        <div className="bg-marigold/10 border border-marigold/30 text-marigold-deep text-sm font-medium rounded-2xl px-4 py-3 mb-6">
          Your canteen is awaiting admin approval before it appears to students.
          This usually takes under a day.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-line p-5">
          <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">
            Orders today
          </div>
          <div className="font-display font-bold text-3xl">{data.ordersToday}</div>
        </div>
        <div className="bg-white rounded-2xl border border-line p-5">
          <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">
            Revenue today
          </div>
          <div className="font-display font-bold text-3xl">{formatBDT(data.revenueToday)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-line p-5">
          <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1.5">
            All-time orders
          </div>
          <div className="font-display font-bold text-3xl">{data.totalOrders}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-line p-6">
        <h3 className="font-display font-bold text-sm mb-6">Today&apos;s hourly demand</h3>
        <div className="flex items-end gap-2 h-[160px]">
          {displayHours.map((h) => {
            const count = data.hourlyCounts[h] ?? 0;
            const heightPct = Math.max((count / maxCount) * 100, count > 0 ? 6 : 2);
            return (
              <div key={h} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[10px] font-bold text-ink-soft mb-1">{count || ""}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-b from-periwinkle to-periwinkle-deep transition-all duration-700"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[9.5px] text-ink-soft font-semibold mt-1.5">
                  {h > 12 ? h - 12 : h}
                  {h >= 12 ? "p" : "a"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 bg-periwinkle-tint rounded-2xl p-5 text-sm text-ink-soft">
        Current plan commission:{" "}
        <strong className="text-ink">{data.canteen.commissionRate}%</strong> per
        order. Need to change plans? Contact platform support.
      </div>
    </div>
  );
}
