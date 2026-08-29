type Tone = "periwinkle" | "marigold" | "leaf" | "chili" | "neutral" | "ink";

const toneClasses: Record<Tone, string> = {
  periwinkle: "bg-periwinkle-tint text-periwinkle-deep",
  marigold: "bg-marigold/15 text-marigold-deep",
  leaf: "bg-leaf-tint text-leaf",
  chili: "bg-chili-tint text-chili",
  neutral: "bg-black/5 text-ink-soft",
  ink: "bg-ink text-cream",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-display font-bold text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const ORDER_STATUS_TONE: Record<string, Tone> = {
  placed: "periwinkle",
  preparing: "marigold",
  ready: "leaf",
  picked_up: "neutral",
  delivered: "neutral",
  cancelled: "chili",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked up",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={ORDER_STATUS_TONE[status] ?? "neutral"}>
      {ORDER_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

const STOCK_TONE: Record<string, Tone> = {
  available: "leaf",
  low: "marigold",
  sold_out: "chili",
};
const STOCK_LABEL: Record<string, string> = {
  available: "Available",
  low: "Low stock",
  sold_out: "Sold out",
};

export function StockBadge({ status }: { status: string }) {
  return (
    <Badge tone={STOCK_TONE[status] ?? "neutral"}>
      {STOCK_LABEL[status] ?? status}
    </Badge>
  );
}

const TIER_TONE: Record<string, Tone> = {
  basic: "periwinkle",
  standard: "marigold",
  premium: "ink",
};

export function TierBadge({ tier }: { tier: string }) {
  return (
    <Badge tone={TIER_TONE[tier] ?? "neutral"} className="capitalize">
      {tier}
    </Badge>
  );
}

const CANTEEN_STATUS_TONE: Record<string, Tone> = {
  active: "leaf",
  pending: "marigold",
  suspended: "chili",
};

export function CanteenStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={CANTEEN_STATUS_TONE[status] ?? "neutral"} className="capitalize">
      {status}
    </Badge>
  );
}
