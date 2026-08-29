import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { PortalShell } from "@/components/portal/PortalShell";
import { Chatbot } from "@/components/Chatbot";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("student");
  if (!session) redirect("/login?next=/student");

  return (
    <PortalShell role="student">
      {children}
      <Chatbot />
    </PortalShell>
  );
}
