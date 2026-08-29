import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { canteens, orders } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: canteens.id,
      name: canteens.name,
      campus: canteens.campus,
      status: canteens.status,
      subscriptionTier: canteens.subscriptionTier,
      commissionRate: canteens.commissionRate,
      createdAt: canteens.createdAt,
      orderCount: sql<number>`count(${orders.id})::int`,
    })
    .from(canteens)
    .leftJoin(orders, eq(orders.canteenId, canteens.id))
    .groupBy(canteens.id)
    .orderBy(canteens.createdAt);

  return NextResponse.json({ canteens: rows });
}
