import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function CanteenLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("canteen_manager");
  if (!session) redirect("/login?next=/canteen");

  return <PortalShell role="canteen_manager">{children}</PortalShell>;
}
