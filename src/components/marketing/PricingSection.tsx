import { Check } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { LinkButton } from "@/components/ui/Button";

const TIERS = [
  {
    name: "Basic",
    desc: "For a single small counter testing the waters",
    price: "৳3,000",
    commission: "No commission",
    features: ["Pre-order & digital token", "Menu & stock control", "Basic daily sales log"],
    cta: "Start with Basic",
    variant: "ghost" as const,
    pop: false,
  },
  {
    name: "Standard",
    desc: "For canteens ready to run on real data",
    price: "৳7,000",
    commission: "+ 2% per order",
    features: [
      "Everything in Basic",
      "Hourly demand analytics",
      "In-campus delivery enabled",
      "Priority support",
    ],
    cta: "Start with Standard",
    variant: "primary" as const,
    pop: true,
  },
  {
    name: "Premium",
    desc: "For food courts & multi-counter operations",
    price: "৳15,000",
    commission: "+ 4% per order",
    features: [
      "Everything in Standard",
      "Multi-counter management",
      "Dedicated runner pool",
      "Campus-wide promotion slot",
    ],
    cta: "Talk to us",
    variant: "ghost" as const,
    pop: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 md:py-28 bg-periwinkle-tint">
      <div className="max-w-[1220px] mx-auto px-5 sm:px-8">
        <Reveal className="max-w-[640px] mb-8">
          <span className="inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-wide text-periwinkle-deep bg-white px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-marigold" />
            Built to undercut city-wide delivery
          </span>
          <h2 className="font-display font-bold text-[30px] md:text-[44px] mt-4 mb-3">
            Single-digit commission, on purpose
          </h2>
          <p className="text-[17px] text-ink-soft leading-relaxed">
            Foodpanda charges 15–25% because delivery spans a whole city. Ours
            never leaves campus — run by student runners — so the take-rate
            stays low.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex items-center gap-3.5 bg-white border-2 border-dashed border-periwinkle rounded-2xl px-5 py-4 mb-10 max-w-[640px]">
            <span className="text-2xl shrink-0">🎉</span>
            <p className="text-[13.5px] text-ink-soft leading-relaxed">
              <strong className="font-display text-ink">Pilot program:</strong>{" "}
              the first campus partners on each plan get 3 months free before
              subscription billing starts — we earn trust with data before we
              ask for a fee.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 max-w-[420px] md:max-w-none mx-auto">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 90}>
              <div
                className={`relative bg-white rounded-3xl p-7 border-2 h-full flex flex-col transition-all hover:-translate-y-1.5 hover:shadow-xl ${
                  tier.pop ? "border-ink shadow-xl" : "border-line"
                }`}
              >
                {tier.pop && (
                  <span className="absolute -top-3.5 left-6 bg-marigold text-ink font-display text-[11.5px] font-bold px-3 py-1 rounded-full">
                    Most picked
                  </span>
                )}
                <h3 className="font-display font-bold text-lg mb-1">{tier.name}</h3>
                <p className="text-[13px] text-ink-soft mb-5">{tier.desc}</p>
                <div className="font-display text-[30px] font-bold mb-0.5">
                  {tier.price}
                  <span className="text-sm font-semibold text-ink-soft">/month</span>
                </div>
                <div className="text-[12.5px] font-bold text-marigold-deep mb-5">
                  {tier.commission}
                </div>
                <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13.5px] text-ink-soft items-start">
                      <Check size={16} className="text-leaf shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <LinkButton href="/signup?role=canteen_manager" variant={tier.variant} className="w-full">
                  {tier.cta}
                </LinkButton>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
