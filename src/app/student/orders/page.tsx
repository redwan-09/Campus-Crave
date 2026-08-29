"use client";

import useSWR from "swr";
import { MapPin, Package } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatBDT } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface OrderItem {
  id: number;
  nameSnapshot: string;
  priceSnapshot: string;
  quantity: number;
}

interface Order {
  id: string;
  tokenNumber: number;
  status: "placed" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled";
  fulfillmentType: "pickup" | "delivery";
  deliveryBuilding: string | null;
  deliveryFloor: string | null;
  deliveryRoom: string | null;
  totalAmount: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  canteen: { name: string; campus: string };
}

const STEPS: { key: Order["status"]; label: string }[] = [
  { key: "placed", label: "Placed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "picked_up", label: "Picked up" },
];

function StepTracker({ status }: { status: Order["status"] }) {
  if (status === "cancelled") {
    return (
      <div className="text-chili text-sm font-semibold">This order was cancelled.</div>
    );
  }
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i < currentIdx || status === "delivered";
        const active = i === currentIdx && status !== "delivered";
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {i < STEPS.length - 1 && (
              <div
                className={`absolute top-[11px] left-1/2 w-full h-0.5 -z-0 ${
                  i < currentIdx ? "bg-leaf" : "bg-line"
                }`}
              />
            )}
            <div
              className={`w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 text-[10px] font-bold ${
                done
                  ? "bg-leaf text-white"
                  : active
                    ? "bg-marigold text-white animate-pulse-dot"
                    : "bg-line text-transparent"
              }`}
            >
              {done ? "✓" : ""}
            </div>
            <span
              className={`text-[10px] font-semibold mt-1.5 text-center ${
                done || active ? "text-ink" : "text-ink-soft/50"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentOrdersPage() {
  const { data, isLoading } = useSWR<{ orders: Order[] }>("/api/orders", fetcher, {
    refreshInterval: 5000,
  });
  const orders = data?.orders ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-6">My orders</h1>

      {isLoading && <p className="text-ink-soft text-sm">Loading…</p>}

      {!isLoading && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-line p-10 text-center">
          <Package size={28} className="mx-auto text-ink-soft mb-3" />
          <p className="text-ink-soft text-sm">You haven&apos;t placed any orders yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-line p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="font-display font-bold text-lg">Token #{order.tokenNumber}</div>
                <div className="text-xs text-ink-soft mt-0.5">
                  {order.canteen.name} · {new Date(order.createdAt).toLocaleString("en-BD")}
                </div>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mb-4">
              <StepTracker status={order.status} />
            </div>

            <div className="text-[13px] text-ink-soft space-y-1 mb-3">
              {order.items.map((li) => (
                <div key={li.id} className="flex justify-between">
                  <span className="font-bn">
                    {li.quantity}× {li.nameSnapshot}
                  </span>
                  <span>{formatBDT(Number(li.priceSnapshot) * li.quantity)}</span>
                </div>
              ))}
            </div>

            {order.fulfillmentType === "delivery" && (
              <div className="flex items-center gap-1.5 text-[12px] text-periwinkle-deep bg-periwinkle-tint rounded-lg px-3 py-2 mb-3">
                <MapPin size={13} />
                {order.deliveryBuilding}
                {order.deliveryFloor ? `, Floor ${order.deliveryFloor}` : ""}, Room{" "}
                {order.deliveryRoom}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
              <span className="text-ink-soft capitalize">{order.paymentMethod}</span>
              <span className="font-display font-bold">{formatBDT(order.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
