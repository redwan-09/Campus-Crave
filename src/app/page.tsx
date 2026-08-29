import { Check, CreditCard, MapPin, Radio } from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { TokenBoard } from "@/components/TokenBoard";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { Chatbot } from "@/components/Chatbot";
import { RoleDashboardDemo } from "@/components/marketing/RoleDashboardDemo";
import { PricingSection } from "@/components/marketing/PricingSection";

export default function LandingPage() {
  return (
    <>
      <MarketingNav />

      {/* HERO */}
      <header className="relative overflow-hidden pt-[150px] pb-24 md:pt-[168px] md:pb-28 bg-cream">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 700px 500px at 88% -6%, var(--periwinkle-tint-2), transparent 60%), radial-gradient(ellipse 600px 500px at -6% 20%, var(--cream-deep), transparent 55%)",
          }}
        />
        <div className="max-w-[1220px] mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-wide text-periwinkle-deep bg-periwinkle-tint px-3.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-marigold" />
                Built for Bangladeshi campuses
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display font-bold text-[40px] sm:text-[52px] lg:text-[68px] leading-[1.06] tracking-tight mt-5 mb-5">
                Skip the line.
                <br />
                Not the <span className="text-periwinkle-deep">class</span>.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg leading-relaxed text-ink-soft max-w-[480px] mb-8">
                400+ students, one counter, a 15-minute break. Campus-Crave lets
                students pre-order from class, grab a digital token, and skip
                the crowd — while canteens finally get real sales data instead
                of guesswork.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-wrap items-center gap-4 mb-9">
                <LinkButton href="#dashboards" variant="accent">
                  See it in action ↓
                </LinkButton>
                <LinkButton href="/signup?role=canteen_manager" variant="ghost">
                  I run a canteen
                </LinkButton>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                  <CreditCard size={17} className="text-leaf shrink-0" />
                  bKash · Nagad · Rocket · Card
                </div>
                <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                  <Radio size={17} className="text-leaf shrink-0" />
                  Live order tracking
                </div>
                <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                  <MapPin size={17} className="text-leaf shrink-0" />
                  In-campus delivery
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <TokenBoard />
          </Reveal>
        </div>
      </header>

      {/* STATS */}
      <section className="bg-white border-y border-line">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-8 py-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line rounded-3xl overflow-hidden shadow-sm my-10">
            {[
              { n: 15, suffix: "–20 min", label: "Average break window between classes — barely enough to queue, let alone eat." },
              { n: 400, suffix: "+ students", label: "Crowding a single counter at peak break time on a typical campus." },
              { n: 0, suffix: " → real data", label: "Sales records most canteens keep today — it's cash in a drawer and a guess." },
              { n: 3, suffix: " revenue lines", label: "Subscription, delivery fee and order commission — built to stay lean." },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="bg-white p-7">
                <div className="font-display text-3xl md:text-4xl font-bold text-periwinkle-deep">
                  <CountUp target={s.n} suffix={s.suffix} />
                </div>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 md:py-28">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-8">
          <Reveal className="max-w-[640px] mb-14">
            <span className="inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-wide text-periwinkle-deep bg-periwinkle-tint px-3.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-marigold" />
              How it works
            </span>
            <h2 className="font-display font-bold text-[30px] md:text-[44px] mt-4 mb-3">
              Three steps, zero standing around
            </h2>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              Built around the break bell, not against it. Students order
              before they&apos;re even hungry-in-line, canteens prep before the
              rush hits.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Browse & pre-order",
                body: "Live menu from the library, hallway or lecture hall. See what's actually in stock before ordering — not after waiting.",
                tag: "From anywhere on campus",
              },
              {
                n: "02",
                title: "Get a digital token",
                body: "Pay with bKash, Nagad, Rocket, card or in-app balance. A token replaces the physical line — track it live as it's prepared.",
                tag: "No physical queue",
              },
              {
                n: "03",
                title: "Pickup or delivery",
                body: "Grab it yourself, or send a runner — building + floor + room, because a GPS pin alone can't find your seat in the library.",
                tag: "In-campus runners only",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="bg-white rounded-3xl p-7 border border-line shadow-sm h-full">
                  <div className="w-11 h-11 rounded-2xl bg-ink text-cream font-display font-bold flex items-center justify-center mb-5">
                    {s.n}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-[14.5px] text-ink-soft leading-relaxed">{s.body}</p>
                  <span className="inline-block mt-3.5 text-xs font-bold font-display text-marigold-deep bg-cream-deep px-2.5 py-1 rounded-full">
                    {s.tag}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARDS */}
      <section id="dashboards" className="py-24 md:py-28 bg-white border-t border-line">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-8">
          <Reveal className="max-w-[640px] mx-auto text-center mb-12">
            <span className="inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-wide text-periwinkle-deep bg-periwinkle-tint px-3.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-marigold" />
              One platform, three logins
            </span>
            <h2 className="font-display font-bold text-[30px] md:text-[44px] mt-4 mb-3">
              Every role sees exactly what it needs
            </h2>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              Students get a fast ordering flow. Canteens get an operations
              command center. Admins get the whole campus network — nothing
              more, nothing less.
            </p>
          </Reveal>
          <RoleDashboardDemo />
        </div>
      </section>

      {/* PRICING */}
      <PricingSection />

      {/* MARKET */}
      <section id="market" className="py-24 md:py-28 bg-white">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div className="flex flex-col items-center">
              <div className="w-full rounded-3xl p-6 text-center bg-periwinkle-tint-2 text-ink">
                <div className="font-display text-2xl md:text-3xl font-bold">4M+</div>
                <div className="text-xs font-semibold opacity-85 mt-1">
                  Tertiary students in Bangladesh (TAM)
                </div>
              </div>
              <div className="w-[78%] mt-2 rounded-3xl p-6 text-center bg-periwinkle text-white">
                <div className="font-display text-2xl md:text-3xl font-bold">800K+</div>
                <div className="text-xs font-semibold opacity-85 mt-1">
                  Enrolled where an on-campus canteen exists (SAM)
                </div>
              </div>
              <div className="w-[52%] mt-2 rounded-3xl p-6 text-center bg-ink text-cream">
                <div className="font-display text-2xl md:text-3xl font-bold">150+</div>
                <div className="text-xs font-semibold opacity-85 mt-1">
                  University &amp; college canteens — Phase 1 target (SOM)
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <span className="inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-wide text-periwinkle-deep bg-periwinkle-tint px-3.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-marigold" />
              Market, sized honestly
            </span>
            <h2 className="font-display font-bold text-[28px] mt-4 mb-1">
              Start narrow, expand campus by campus
            </h2>
            <div className="mt-4">
              {[
                {
                  tag: "Public + Private",
                  body: (
                    <>
                      <strong className="text-ink">~173 universities</strong> are
                      UGC-registered in Bangladesh — this is the realistic
                      near-term footprint, not every affiliated college.
                    </>
                  ),
                },
                {
                  tag: "Beyond",
                  body: (
                    <>
                      National University&apos;s 2,257 affiliated colleges hold
                      the bulk of tertiary enrollment, but most don&apos;t run
                      an organized canteen — a longer-term expansion, not the
                      launch market.
                    </>
                  ),
                },
                {
                  tag: "Strategy",
                  body: (
                    <>
                      One campus, one semester, real retention data —{" "}
                      <strong className="text-ink">then</strong> replicate.
                      Marketplaces die from expanding before the first side is
                      proven.
                    </>
                  ),
                },
              ].map((item, i) => (
                <div
                  key={item.tag}
                  className={`flex gap-3.5 py-4.5 py-[18px] ${
                    i === 0 ? "border-t" : "border-t"
                  } border-line ${i === 2 ? "border-b" : ""}`}
                >
                  <span className="font-display font-bold text-xs text-periwinkle-deep bg-periwinkle-tint px-2.5 py-1 rounded-lg h-fit shrink-0">
                    {item.tag}
                  </span>
                  <p className="text-sm text-ink-soft leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-ink py-24">
        <div
          className="absolute -top-40 -right-24 w-[500px] h-[500px] rounded-full -z-0"
          style={{
            background: "radial-gradient(circle, rgba(110,127,224,0.35), transparent 70%)",
          }}
        />
        <div className="relative max-w-[640px] mx-auto px-5 text-center">
          <h2 className="font-display font-bold text-[28px] md:text-[44px] text-cream mb-4">
            Your canteen&apos;s break-time rush,
            <br />
            finally under control.
          </h2>
          <p className="text-cream/65 text-base mb-8 leading-relaxed">
            Bring Campus-Crave to your campus as a founding partner — free for
            your first 3 months, real data from day one.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <LinkButton href="/signup" variant="accent">
              Get early access
            </LinkButton>
            <LinkButton
              href="#how"
              variant="ghost"
              className="!border-cream/30 !text-cream"
            >
              See how it works
            </LinkButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-cream pt-14 pb-7">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap justify-between items-start gap-8 pb-9 border-b border-line">
            <div>
              <Logo />
              <p className="text-[13.5px] text-ink-soft mt-2.5 max-w-[260px] leading-relaxed">
                Pre-order + digital token + in-campus delivery, built for
                Bangladeshi university canteens.
              </p>
            </div>
            <div className="flex flex-wrap gap-16">
              <div>
                <h6 className="font-display text-xs uppercase tracking-wide text-ink-soft mb-3.5">
                  Product
                </h6>
                <div className="flex flex-col gap-2.5 text-[13.5px] font-semibold">
                  <a href="#how">How it works</a>
                  <a href="#dashboards">Dashboards</a>
                  <a href="#pricing">Pricing</a>
                </div>
              </div>
              <div>
                <h6 className="font-display text-xs uppercase tracking-wide text-ink-soft mb-3.5">
                  Company
                </h6>
                <div className="flex flex-col gap-2.5 text-[13.5px] font-semibold">
                  <a href="#market">Market</a>
                  <a href="/login">Log in</a>
                  <a href="/signup">Sign up</a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-center pt-6 gap-3">
            <p className="text-xs text-ink-soft">
              © 2026 Campus-Crave by RSM. Built for Bangladesh&apos;s campuses.
            </p>
            <p className="text-xs text-ink-soft flex items-center gap-1.5">
              <Check size={13} className="text-leaf" /> Made for break-time rush
              hours
            </p>
          </div>
        </div>
      </footer>

      <Chatbot />
    </>
  );
}
