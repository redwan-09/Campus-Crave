import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin");
  if (!session) redirect("/login?next=/admin");

  return <PortalShell role="admin">{children}</PortalShell>;
}
