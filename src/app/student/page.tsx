"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { MapPin, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { StockBadge } from "@/components/ui/Badge";
import { formatBDT, DELIVERY_FEE } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Canteen {
  id: string;
  name: string;
  campus: string;
  location: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  nameBn: string | null;
  price: string;
  category: string | null;
  emoji: string | null;
  stockStatus: "available" | "low" | "sold_out";
}

type Cart = Record<string, number>; // menuItemId -> quantity

export default function StudentOrderPage() {
  const router = useRouter();
  const { data: canteenData } = useSWR<{ canteens: Canteen[] }>("/api/canteens", fetcher);
  const canteens = useMemo(() => canteenData?.canteens ?? [], [canteenData]);
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>("");
  // Derived during render (no effect needed): fall back to the first
  // canteen until the user actively picks one from the dropdown.
  const canteenId = selectedCanteenId || canteens[0]?.id || "";

  const { data: menuData, isLoading: menuLoading } = useSWR<{ items: MenuItem[] }>(
    canteenId ? `/api/menu?canteenId=${canteenId}` : null,
    fetcher,
    { refreshInterval: 8000 }
  );
  const items = useMemo(() => menuData?.items ?? [], [menuData]);

  const [cart, setCart] = useState<Cart>({});
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "bkash" | "nagad" | "rocket" | "card" | "wallet"
  >("bkash");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedToken, setPlacedToken] = useState<number | null>(null);

  // Reset the cart when the shopper switches canteens — carts don't mix
  // across canteens. This is React's documented "adjust state during
  // render" pattern rather than a useEffect, so it doesn't cause an
  // extra cascading render.
  const [cartForCanteen, setCartForCanteen] = useState(canteenId);
  if (canteenId !== cartForCanteen) {
    setCartForCanteen(canteenId);
    setCart({});
    setPlacedToken(null);
  }

  function handleCanteenChange(id: string) {
    setSelectedCanteenId(id);
  }

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category || "Other"));
    return Array.from(set);
  }, [items]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = items.find((i) => i.id === id);
          return item ? { item, qty } : null;
        })
        .filter(Boolean) as { item: MenuItem; qty: number }[],
    [cart, items]
  );

  const subtotal = cartLines.reduce((sum, l) => sum + Number(l.item.price) * l.qty, 0);
  const deliveryFee = fulfillment === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  function updateQty(itemId: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[itemId] ?? 0;
      const updated = Math.max(0, Math.min(20, current + delta));
      if (updated === 0) delete next[itemId];
      else next[itemId] = updated;
      return next;
    });
  }

  async function placeOrder() {
    setOrderError(null);
    if (cartLines.length === 0) return;
    if (fulfillment === "delivery" && (!building.trim() || !room.trim())) {
      setOrderError("Building and room are required for delivery.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canteenId,
          items: cartLines.map((l) => ({ menuItemId: l.item.id, quantity: l.qty })),
          fulfillmentType: fulfillment,
          deliveryBuilding: fulfillment === "delivery" ? building : undefined,
          deliveryFloor: fulfillment === "delivery" ? floor : undefined,
          deliveryRoom: fulfillment === "delivery" ? room : undefined,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error ?? "Couldn't place your order. Please try again.");
        return;
      }
      setPlacedToken(data.order.tokenNumber);
      setCart({});
    } catch {
      setOrderError("Couldn't reach the server. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (placedToken !== null) {
    return (
      <div className="max-w-md mx-auto mt-10 sm:mt-20 text-center bg-white rounded-3xl shadow-sm border border-line p-9">
        <div className="w-16 h-16 rounded-full bg-leaf-tint text-leaf flex items-center justify-center mx-auto mb-5 text-3xl font-display font-bold">
          ✓
        </div>
        <h2 className="font-display font-bold text-xl mb-1.5">Order placed!</h2>
        <p className="text-ink-soft text-sm mb-5">
          Your token number is ready. Track it live on your Orders page.
        </p>
        <div className="font-display text-4xl font-bold text-periwinkle-deep mb-7">
          #{placedToken}
        </div>
        <div className="flex flex-col gap-2.5">
          <Button onClick={() => router.push("/student/orders")} className="w-full">
            Track my order
          </Button>
          <Button variant="ghost" onClick={() => setPlacedToken(null)} className="w-full">
            Order more
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h1 className="font-display font-bold text-2xl">Browse &amp; order</h1>
          {canteens.length > 0 && (
            <div className="w-full sm:w-auto sm:min-w-[260px]">
              <Select
                label=""
                value={canteenId}
                onChange={(e) => handleCanteenChange(e.target.value)}
                className="!py-2"
              >
                {canteens.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.campus}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {canteens.length === 0 && (
          <div className="bg-white rounded-2xl border border-line p-8 text-center text-ink-soft text-sm">
            No canteens are live yet on the platform — check back soon.
          </div>
        )}

        {menuLoading && (
          <div className="flex items-center gap-2 text-ink-soft text-sm py-10 justify-center">
            <Loader2 size={16} className="animate-spin" /> Loading menu…
          </div>
        )}

        {!menuLoading &&
          categories.map((cat) => (
            <div key={cat} className="mb-7">
              <h3 className="font-display font-bold text-sm uppercase tracking-wide text-ink-soft mb-3">
                {cat}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {items
                  .filter((i) => (i.category || "Other") === cat)
                  .map((item) => {
                    const qty = cart[item.id] ?? 0;
                    const soldOut = item.stockStatus === "sold_out";
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border border-line p-4 flex items-center gap-3.5 ${
                          soldOut ? "opacity-60" : ""
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-cream-deep flex items-center justify-center text-xl shrink-0">
                          {item.emoji || "🍽️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bn font-bold text-[13.5px] leading-tight truncate">
                            {item.nameBn || item.name}
                          </div>
                          <div className="text-[12px] text-ink-soft truncate">{item.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-display font-bold text-periwinkle-deep text-[13.5px]">
                              {formatBDT(item.price)}
                            </span>
                            <StockBadge status={item.stockStatus} />
                          </div>
                        </div>
                        {!soldOut &&
                          (qty === 0 ? (
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-9 h-9 rounded-xl bg-ink text-cream flex items-center justify-center shrink-0"
                            >
                              <Plus size={16} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                className="w-8 h-8 rounded-lg bg-periwinkle-tint text-periwinkle-deep flex items-center justify-center"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-display font-bold text-sm w-4 text-center">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.id, 1)}
                                className="w-8 h-8 rounded-lg bg-ink text-cream flex items-center justify-center"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ))}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>

      {/* Cart / checkout */}
      <div className="lg:sticky lg:top-6 h-fit bg-white rounded-3xl border border-line p-5 shadow-sm">
        <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
          <ShoppingBag size={17} /> Your order
        </h3>

        {cartLines.length === 0 ? (
          <p className="text-sm text-ink-soft py-6 text-center">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col gap-2.5 mb-4">
            {cartLines.map((l) => (
              <div key={l.item.id} className="flex items-center justify-between text-[13px]">
                <span className="font-bn truncate pr-2">
                  {l.qty}× {l.item.nameBn || l.item.name}
                </span>
                <span className="font-semibold shrink-0">{formatBDT(Number(l.item.price) * l.qty)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-line pt-3 mb-4">
          <label className="block font-display font-semibold text-xs uppercase tracking-wide text-ink-soft mb-2">
            Fulfillment
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["pickup", "delivery"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFulfillment(f)}
                className={`py-2 rounded-xl text-sm font-semibold capitalize border transition ${
                  fulfillment === f
                    ? "bg-ink text-cream border-ink"
                    : "border-line text-ink-soft"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {fulfillment === "delivery" && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              placeholder="Building *"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="col-span-2 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-periwinkle"
            />
            <input
              placeholder="Floor"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-periwinkle"
            />
            <input
              placeholder="Room *"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-periwinkle"
            />
            <p className="col-span-2 text-[11px] text-ink-soft flex items-center gap-1.5">
              <MapPin size={12} /> A GPS pin alone can&apos;t find your floor/room.
            </p>
          </div>
        )}

        <div className="mb-4">
          <Select
            label="Payment method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
          >
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="card">Card</option>
            <option value="wallet">In-app wallet</option>
          </Select>
        </div>

        <div className="border-t border-line pt-3 space-y-1.5 mb-4 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatBDT(subtotal)}</span>
          </div>
          {fulfillment === "delivery" && (
            <div className="flex justify-between text-ink-soft">
              <span>Delivery fee</span>
              <span>{formatBDT(deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-display font-bold text-base pt-1">
            <span>Total</span>
            <span>{formatBDT(total)}</span>
          </div>
        </div>

        {orderError && (
          <div className="bg-chili-tint text-chili text-xs font-medium rounded-xl px-3 py-2.5 mb-3">
            {orderError}
          </div>
        )}

        <Button
          onClick={placeOrder}
          disabled={cartLines.length === 0 || placing}
          className="w-full"
        >
          {placing && <Loader2 size={16} className="animate-spin" />}
          {placing ? "Placing order…" : "Place order"}
        </Button>
      </div>
    </div>
  );
}
