import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { canteens } from "@/lib/db/schema";

// Public: students need this to see which canteens they can order from.
export async function GET() {
  const rows = await db.query.canteens.findMany({
    where: eq(canteens.status, "active"),
    orderBy: (c, { asc }) => [asc(c.name)],
  });
  return NextResponse.json({ canteens: rows });
}
