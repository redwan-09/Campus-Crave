import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { canteens } from "@/lib/db/schema";
import { canteenStatusUpdateSchema } from "@/lib/validators";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = canteenStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const existing = await db.query.canteens.findFirst({ where: eq(canteens.id, id) });
  if (!existing) {
    return NextResponse.json({ error: "Canteen not found." }, { status: 404 });
  }

  const [updated] = await db
    .update(canteens)
    .set({ status: parsed.data.status })
    .where(eq(canteens.id, id))
    .returning();

  return NextResponse.json({ canteen: updated });
}
