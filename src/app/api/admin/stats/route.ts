import { NextResponse } from "next/server";
import { eq, sql, gte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { canteens, orders, users } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [[{ count: activeCanteens }], [{ count: pendingCanteens }], [{ count: totalStudents }], [{ count: ordersToday }], [gmvRow]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(canteens).where(eq(canteens.status, "active")),
      db.select({ count: sql<number>`count(*)::int` }).from(canteens).where(eq(canteens.status, "pending")),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "student")),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(and(gte(orders.createdAt, startOfDay))),
      db
        .select({ total: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` })
        .from(orders)
        .where(eq(orders.paymentStatus, "paid")),
    ]);

  return NextResponse.json({
    activeCanteens,
    pendingCanteens,
    totalStudents,
    ordersToday,
    totalGMV: Number(gmvRow?.total ?? 0),
  });
}
