import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { menuItemUpdateSchema } from "@/lib/validators";
import { getSession } from "@/lib/session";

async function assertOwnership(itemId: string, canteenId: string) {
  const item = await db.query.menuItems.findFirst({
    where: and(eq(menuItems.id, itemId), eq(menuItems.canteenId, canteenId)),
  });
  return item;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "canteen_manager" || !session.canteenId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;

  const existing = await assertOwnership(id, session.canteenId);
  if (!existing) {
    return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = menuItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const [updated] = await db
    .update(menuItems)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.nameBn !== undefined ? { nameBn: data.nameBn || null } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.price !== undefined ? { price: String(data.price) } : {}),
      ...(data.category !== undefined ? { category: data.category || null } : {}),
      ...(data.emoji !== undefined ? { emoji: data.emoji || "🍽️" } : {}),
      ...(data.stockStatus !== undefined ? { stockStatus: data.stockStatus } : {}),
    })
    .where(eq(menuItems.id, id))
    .returning();

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "canteen_manager" || !session.canteenId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;

  const existing = await assertOwnership(id, session.canteenId);
  if (!existing) {
    return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
  }

  await db.delete(menuItems).where(eq(menuItems.id, id));
  return NextResponse.json({ ok: true });
}
