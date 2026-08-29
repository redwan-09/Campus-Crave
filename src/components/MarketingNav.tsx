"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { LinkButton } from "./ui/Button";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#how", label: "How it works" },
    { href: "#dashboards", label: "Dashboards" },
    { href: "#pricing", label: "Pricing" },
    { href: "#market", label: "Market" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3 bg-cream/85 backdrop-blur-md shadow-[0_1px_0_var(--line)]" : "py-4"
      }`}
    >
      <div className="max-w-[1220px] mx-auto px-5 sm:px-8 flex items-center justify-between gap-6">
        <Logo />
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14.5px] font-semibold text-ink-soft hover:text-ink transition"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3.5">
          <LinkButton href="/login" variant="ghost" size="sm">
            Log in
          </LinkButton>
          <LinkButton href="/signup" variant="primary" size="sm">
            Get started
          </LinkButton>
        </div>
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden max-w-[1220px] mx-auto px-5 pt-3 pb-4 flex flex-col gap-1 animate-fade-up">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 border-b border-line font-semibold text-[15px]"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="py-3 border-b border-line font-semibold text-[15px]"
          >
            Log in
          </Link>
          <LinkButton href="/signup" variant="primary" className="mt-3 w-full">
            Get started
          </LinkButton>
        </div>
      )}
    </nav>
  );
}
