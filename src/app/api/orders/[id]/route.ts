import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { orderStatusUpdateSchema } from "@/lib/validators";
import { getSession } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true, canteen: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const isOwnerStudent = session.role === "student" && order.studentId === session.userId;
  const isOwnerCanteen =
    session.role === "canteen_manager" && order.canteenId === session.canteenId;
  const isAdmin = session.role === "admin";

  if (!isOwnerStudent && !isOwnerCanteen && !isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  return NextResponse.json({ order });
}

// Canteen managers move an order through the fulfillment pipeline.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "canteen_manager" || !session.canteenId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order || order.canteenId !== session.canteenId) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = orderStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const [updated] = await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  return NextResponse.json({ order: updated });
}
