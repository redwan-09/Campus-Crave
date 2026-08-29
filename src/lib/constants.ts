export const SUBSCRIPTION_TIERS = {
  basic: { label: "Basic", monthlyFee: 3000, commissionRate: 0 },
  standard: { label: "Standard", monthlyFee: 7000, commissionRate: 2 },
  premium: { label: "Premium", monthlyFee: 15000, commissionRate: 4 },
} as const;

export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS;

export const DELIVERY_FEE = 15; // BDT flat fee, only charged for delivery orders

export const ORDER_STATUS_FLOW = [
  "placed",
  "preparing",
  "ready",
  "picked_up",
] as const;

export function formatBDT(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return "৳" + n.toLocaleString("en-BD", { maximumFractionDigits: 0 });
}

export function nextOrderStatus(
  current: (typeof ORDER_STATUS_FLOW)[number]
): (typeof ORDER_STATUS_FLOW)[number] | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}
