"use client";

import useSWR from "swr";
import { Loader2, MapPin } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatBDT, nextOrderStatus } from "@/lib/constants";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface OrderItem {
  id: number;
  nameSnapshot: string;
  quantity: number;
}
interface Order {
  id: string;
  tokenNumber: number;
  status: "placed" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled";
  fulfillmentType: "pickup" | "delivery";
  deliveryBuilding: string | null;
  deliveryRoom: string | null;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
}

const COLUMNS: { key: Order["status"]; label: string }[] = [
  { key: "placed", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
];

const STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked up",
};

export default function CanteenOrdersPage() {
  const { data, mutate } = useSWR<{ orders: Order[] }>("/api/orders", fetcher, {
    refreshInterval: 4000,
  });
  const orders = data?.orders ?? [];
  const [updating, setUpdating] = useState<string | null>(null);

  const activeOrders = orders.filter((o) =>
    ["placed", "preparing", "ready"].includes(o.status)
  );

  async function advance(order: Order) {
    const next = nextOrderStatus(order.status as "placed" | "preparing" | "ready" | "picked_up");
    if (!next) return;
    setUpdating(order.id);
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      mutate();
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display font-bold text-2xl">Order queue</h1>
        <span className="flex items-center gap-1.5 text-[12px] font-bold text-leaf bg-leaf-tint px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse-dot" />
          Live · refreshes automatically
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colOrders = activeOrders
            .filter((o) => o.status === col.key)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          return (
            <div key={col.key}>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[12px] font-bold text-ink-soft uppercase tracking-wide">
                  {col.label}
                </span>
                <span className="font-display text-[11px] font-bold bg-periwinkle-tint text-periwinkle-deep px-2 py-0.5 rounded-full">
                  {colOrders.length}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {colOrders.length === 0 && (
                  <div className="text-xs text-ink-soft/60 text-center py-6 border border-dashed border-line rounded-2xl">
                    No orders here
                  </div>
                )}
                {colOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-line rounded-2xl p-3.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-display font-bold text-[14px]">
                        #{order.tokenNumber}
                      </span>
                      <span className="text-[10.5px] text-ink-soft">
                        {new Date(order.createdAt).toLocaleTimeString("en-BD", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-[12.5px] text-ink-soft mb-2 space-y-0.5">
                      {order.items.map((li) => (
                        <div key={li.id} className="font-bn">
                          {li.quantity}× {li.nameSnapshot}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                          order.fulfillmentType === "pickup"
                            ? "bg-periwinkle-tint text-periwinkle-deep"
                            : "bg-marigold/15 text-marigold-deep"
                        }`}
                      >
                        {order.fulfillmentType === "delivery" && <MapPin size={10} />}
                        {order.fulfillmentType === "pickup"
                          ? "Pickup"
                          : `Room ${order.deliveryRoom}`}
                      </span>
                      <span className="font-display font-bold text-xs">
                        {formatBDT(order.totalAmount)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => advance(order)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        `Mark as ${
                          STATUS_LABEL[
                            nextOrderStatus(
                              order.status as "placed" | "preparing" | "ready" | "picked_up"
                            ) ?? ""
                          ]
                        }`
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-lg mb-3">Recently completed</h2>
        <div className="bg-white rounded-2xl border border-line divide-y divide-line overflow-hidden">
          {orders
            .filter((o) => ["picked_up", "delivered", "cancelled"].includes(o.status))
            .slice(0, 8)
            .map((o) => (
              <div key={o.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-display font-semibold">#{o.tokenNumber}</span>
                <span className="text-ink-soft text-xs">
                  {new Date(o.createdAt).toLocaleString("en-BD")}
                </span>
                <OrderStatusBadge status={o.status} />
                <span className="font-display font-semibold">{formatBDT(o.totalAmount)}</span>
              </div>
            ))}
          {orders.filter((o) => ["picked_up", "delivered", "cancelled"].includes(o.status))
            .length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-ink-soft">Nothing here yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
