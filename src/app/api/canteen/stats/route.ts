import { NextResponse } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, canteens } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "canteen_manager" || !session.canteenId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const canteen = await db.query.canteens.findFirst({
    where: eq(canteens.id, session.canteenId),
  });
  if (!canteen) {
    return NextResponse.json({ error: "Canteen not found." }, { status: 404 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaysOrders = await db.query.orders.findMany({
    where: and(eq(orders.canteenId, session.canteenId), gte(orders.createdAt, startOfDay)),
  });

  const hourlyCounts = new Array(24).fill(0) as number[];
  let revenueToday = 0;
  todaysOrders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    hourlyCounts[hour] += 1;
    if (o.paymentStatus === "paid") revenueToday += Number(o.totalAmount);
  });

  const [{ count: totalOrders }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.canteenId, session.canteenId));

  return NextResponse.json({
    canteen: {
      id: canteen.id,
      name: canteen.name,
      campus: canteen.campus,
      status: canteen.status,
      subscriptionTier: canteen.subscriptionTier,
      commissionRate: canteen.commissionRate,
    },
    ordersToday: todaysOrders.length,
    revenueToday,
    totalOrders,
    hourlyCounts,
  });
}
