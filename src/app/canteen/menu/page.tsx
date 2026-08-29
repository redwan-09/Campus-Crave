"use client";

import { useState } from "react";
import useSWR from "swr";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { StockBadge } from "@/components/ui/Badge";
import { formatBDT } from "@/lib/constants";
import { useSession } from "@/hooks/useSession";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MenuItem {
  id: string;
  name: string;
  nameBn: string | null;
  price: string;
  category: string | null;
  emoji: string | null;
  stockStatus: "available" | "low" | "sold_out";
}

const STOCK_CYCLE: MenuItem["stockStatus"][] = ["available", "low", "sold_out"];

export default function CanteenMenuPage() {
  const { user } = useSession();
  const canteenId = user?.canteenId;
  const { data, mutate, isLoading } = useSWR<{ items: MenuItem[] }>(
    canteenId ? `/api/menu?canteenId=${canteenId}` : null,
    fetcher
  );
  const items = data?.items ?? [];

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    nameBn: "",
    price: "",
    category: "",
    emoji: "🍽️",
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", nameBn: "", price: "", category: "", emoji: "🍽️" });
        setShowForm(false);
        mutate();
      }
    } finally {
      setSaving(false);
    }
  }

  async function cycleStock(item: MenuItem) {
    const idx = STOCK_CYCLE.indexOf(item.stockStatus);
    const nextStatus = STOCK_CYCLE[(idx + 1) % STOCK_CYCLE.length];
    // optimistic update
    mutate(
      { items: items.map((i) => (i.id === item.id ? { ...i, stockStatus: nextStatus } : i)) },
      false
    );
    await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockStatus: nextStatus }),
    });
    mutate();
  }

  async function removeItem(id: string) {
    mutate({ items: items.filter((i) => i.id !== id) }, false);
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display font-bold text-2xl">Menu &amp; stock</h1>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={15} /> Add item
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl border border-line p-5 mb-6 grid sm:grid-cols-2 gap-4"
        >
          <Input
            label="Name (English)"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Name (Bangla, optional)"
            value={form.nameBn}
            onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
          />
          <Input
            label="Price (৳)"
            type="number"
            min="1"
            step="1"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            label="Category"
            placeholder="e.g. Lunch, Snacks, Drinks"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            label="Emoji icon"
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
          />
          <div className="sm:col-span-2 flex gap-2.5">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving…" : "Add to menu"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-ink-soft text-sm">Loading…</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-line p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-cream-deep flex items-center justify-center text-lg shrink-0">
                  {item.emoji || "🍽️"}
                </span>
                <div className="min-w-0">
                  <div className="font-bn font-bold text-[13.5px] truncate">
                    {item.nameBn || item.name}
                  </div>
                  <div className="text-[11px] text-ink-soft truncate">{item.name}</div>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-ink-soft hover:text-chili transition shrink-0"
                aria-label="Delete item"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="font-display font-bold text-periwinkle-deep">
                {formatBDT(item.price)}
              </span>
              <button onClick={() => cycleStock(item)}>
                <StockBadge status={item.stockStatus} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && items.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-dashed border-line p-10 text-center text-ink-soft text-sm">
          No menu items yet — add your first one above.
        </div>
      )}
    </div>
  );
}
