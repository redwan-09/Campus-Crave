"use client";

import useSWR from "swr";
import { Check, Loader2, X } from "lucide-react";
import { CanteenStatusBadge, TierBadge } from "@/components/ui/Badge";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Canteen {
  id: string;
  name: string;
  campus: string;
  status: "pending" | "active" | "suspended";
  subscriptionTier: string;
  commissionRate: string;
  orderCount: number;
}

export default function AdminCanteensPage() {
  const { data, mutate, isLoading } = useSWR<{ canteens: Canteen[] }>(
    "/api/admin/canteens",
    fetcher
  );
  const canteens = data?.canteens ?? [];
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: Canteen["status"]) {
    setUpdating(id);
    try {
      await fetch(`/api/admin/canteens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      mutate();
    } finally {
      setUpdating(null);
    }
  }

  const pending = canteens.filter((c) => c.status === "pending");
  const others = canteens.filter((c) => c.status !== "pending");

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Canteens</h1>

      {isLoading && <p className="text-ink-soft text-sm">Loading…</p>}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wide text-ink-soft mb-3">
            Pending approval
          </h2>
          <div className="flex flex-col gap-2.5">
            {pending.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-line rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap"
              >
                <div>
                  <div className="font-display font-bold text-[15px]">{c.name}</div>
                  <div className="text-xs text-ink-soft">{c.campus}</div>
                </div>
                <TierBadge tier={c.subscriptionTier} />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(c.id, "active")}
                    disabled={updating === c.id}
                    className="w-9 h-9 rounded-xl bg-leaf-tint text-leaf flex items-center justify-center"
                    aria-label="Approve"
                  >
                    {updating === c.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button
                    onClick={() => updateStatus(c.id, "suspended")}
                    disabled={updating === c.id}
                    className="w-9 h-9 rounded-xl bg-chili-tint text-chili flex items-center justify-center"
                    aria-label="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-display font-bold text-sm uppercase tracking-wide text-ink-soft mb-3">
        All canteens
      </h2>
      <div className="bg-white rounded-2xl border border-line overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-line">
              {["Canteen", "Plan", "Commission", "Orders", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10.5px] uppercase tracking-wide text-ink-soft font-bold px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {others.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 text-[13.5px]">
                <td className="px-4 py-3">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-ink-soft">{c.campus}</div>
                </td>
                <td className="px-4 py-3">
                  <TierBadge tier={c.subscriptionTier} />
                </td>
                <td className="px-4 py-3">{c.commissionRate}%</td>
                <td className="px-4 py-3">{c.orderCount}</td>
                <td className="px-4 py-3">
                  <CanteenStatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  {c.status === "active" ? (
                    <button
                      onClick={() => updateStatus(c.id, "suspended")}
                      className="text-xs font-semibold text-chili"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(c.id, "active")}
                      className="text-xs font-semibold text-leaf"
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {others.length === 0 && !isLoading && (
          <div className="px-4 py-8 text-center text-sm text-ink-soft">No canteens yet.</div>
        )}
      </div>
    </div>
  );
}
