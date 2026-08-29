"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  UtensilsCrossed,
  Receipt,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  Store,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";

export type PortalRole = "student" | "canteen_manager" | "admin";

interface PortalNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

// Icon components are defined here, inside the Client Component, rather
// than being passed down as props from a Server Component layout — React
// Server Components can't serialize function/component values across that
// boundary, so this data has to live on the client side of the split.
const NAV_BY_ROLE: Record<PortalRole, PortalNavItem[]> = {
  student: [
    { href: "/student", label: "Order", icon: UtensilsCrossed, exact: true },
    { href: "/student/orders", label: "My Orders", icon: Receipt },
  ],
  canteen_manager: [
    { href: "/canteen", label: "Orders", icon: ClipboardList, exact: true },
    { href: "/canteen/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/canteen/analytics", label: "Analytics", icon: BarChart3 },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/canteens", label: "Canteens", icon: Store },
  ],
};

const ROLE_LABEL: Record<PortalRole, string> = {
  student: "Student portal",
  canteen_manager: "Canteen manager",
  admin: "Platform admin",
};

export function PortalShell({
  role,
  children,
}: {
  role: PortalRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const navItems = NAV_BY_ROLE[role];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-ink text-cream p-5 sticky top-0 h-screen">
        <div className="mb-8 px-1">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Campus-Crave" width={32} height={32} className="object-contain" style={{ width: 32, height: 32 }} />
            <span className="font-display font-bold text-[15px]">Campus-Crave</span>
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-cream/45 mt-1 block">
            {ROLE_LABEL[role]}
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active ? "bg-white/10 text-cream" : "text-cream/55 hover:text-cream hover:bg-white/5"
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="px-1 mb-3">
            <div className="text-sm font-semibold truncate">{user?.name ?? "…"}</div>
            <div className="text-xs text-cream/45 truncate">{user?.email ?? ""}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-cream/60 hover:text-cream hover:bg-white/5 w-full transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <div className="md:hidden sticky top-0 z-30 bg-ink text-cream px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Campus-Crave" width={28} height={28} className="object-contain" style={{ width: 28, height: 28 }} />
            <span className="font-display font-bold text-sm">Campus-Crave</span>
          </Link>
          <button onClick={handleLogout} className="text-cream/60">
            <LogOut size={18} />
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10.5px] font-semibold ${
                  active ? "text-periwinkle-deep" : "text-ink-soft"
                }`}
              >
                <item.icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
