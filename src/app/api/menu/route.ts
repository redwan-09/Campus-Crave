import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { menuItemCreateSchema } from "@/lib/validators";
import { getSession } from "@/lib/session";

// Public: anyone browsing the student portal can view a canteen's menu.
export async function GET(request: NextRequest) {
  const canteenId = request.nextUrl.searchParams.get("canteenId");
  if (!canteenId) {
    return NextResponse.json({ error: "canteenId query param is required." }, { status: 400 });
  }
  const items = await db.query.menuItems.findMany({
    where: eq(menuItems.canteenId, canteenId),
    orderBy: (m, { asc }) => [asc(m.category), asc(m.name)],
  });
  return NextResponse.json({ items });
}

// Canteen managers only: add a new menu item to their own canteen.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "canteen_manager" || !session.canteenId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = menuItemCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const [item] = await db
    .insert(menuItems)
    .values({
      canteenId: session.canteenId,
      name: data.name,
      nameBn: data.nameBn || null,
      description: data.description || null,
      price: String(data.price),
      category: data.category || null,
      emoji: data.emoji || "🍽️",
    })
    .returning();

  return NextResponse.json({ item }, { status: 201 });
}
