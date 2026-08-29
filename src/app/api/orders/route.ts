import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { canteens, menuItems, orderItems, orders } from "@/lib/db/schema";
import { orderCreateSchema } from "@/lib/validators";
import { getSession } from "@/lib/session";
import { DELIVERY_FEE } from "@/lib/constants";

// GET: role-aware order list.
//  - student  -> their own orders (most recent first)
//  - canteen_manager -> orders for their canteen
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  if (session.role === "student") {
    const rows = await db.query.orders.findMany({
      where: eq(orders.studentId, session.userId),
      orderBy: [desc(orders.createdAt)],
      with: { items: true, canteen: true },
      limit: 50,
    });
    return NextResponse.json({ orders: rows });
  }

  if (session.role === "canteen_manager" && session.canteenId) {
    const rows = await db.query.orders.findMany({
      where: eq(orders.canteenId, session.canteenId),
      orderBy: [desc(orders.createdAt)],
      with: { items: true },
      limit: 100,
    });
    return NextResponse.json({ orders: rows });
  }

  return NextResponse.json({ error: "Not authorized." }, { status: 403 });
}

// POST: a student places a new order. Computes price server-side from the
// live menu (never trusts client-submitted prices), assigns the next
// sequential token number for that canteen, and snapshots item name/price.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Only students can place orders." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = orderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (data.fulfillmentType === "delivery") {
    if (!data.deliveryBuilding || !data.deliveryRoom) {
      return NextResponse.json(
        { error: "Building and room are required for delivery orders." },
        { status: 400 }
      );
    }
  }

  const canteen = await db.query.canteens.findFirst({
    where: and(eq(canteens.id, data.canteenId), eq(canteens.status, "active")),
  });
  if (!canteen) {
    return NextResponse.json({ error: "Canteen not found or not active." }, { status: 404 });
  }

  const ids = data.items.map((i) => i.menuItemId);
  const dbItems = await db.query.menuItems.findMany({
    where: inArray(menuItems.id, ids),
  });
  if (dbItems.length !== ids.length) {
    return NextResponse.json({ error: "One or more menu items were not found." }, { status: 400 });
  }
  const soldOut = dbItems.find((i) => i.stockStatus === "sold_out");
  if (soldOut) {
    return NextResponse.json(
      { error: `"${soldOut.name}" just sold out. Please remove it and try again.` },
      { status: 409 }
    );
  }
  const wrongCanteen = dbItems.find((i) => i.canteenId !== data.canteenId);
  if (wrongCanteen) {
    return NextResponse.json({ error: "Items must all be from the same canteen." }, { status: 400 });
  }

  let subtotal = 0;
  const lineItems = data.items.map((requested) => {
    const dbItem = dbItems.find((i) => i.id === requested.menuItemId)!;
    const price = Number(dbItem.price);
    subtotal += price * requested.quantity;
    return {
      menuItemId: dbItem.id,
      nameSnapshot: dbItem.name,
      priceSnapshot: dbItem.price,
      quantity: requested.quantity,
    };
  });

  const deliveryFee = data.fulfillmentType === "delivery" ? DELIVERY_FEE : 0;
  const totalAmount = subtotal + deliveryFee;

  // Atomically claim the next token number for this canteen so concurrent
  // orders never collide, then insert the order + line items together.
  const order = await db.transaction(async (tx) => {
    const [updatedCanteen] = await tx
      .update(canteens)
      .set({ nextTokenNumber: canteen.nextTokenNumber + 1 })
      .where(eq(canteens.id, canteen.id))
      .returning({ tokenNumber: canteens.nextTokenNumber });

    const [createdOrder] = await tx
      .insert(orders)
      .values({
        tokenNumber: updatedCanteen.tokenNumber,
        studentId: session.userId,
        canteenId: canteen.id,
        fulfillmentType: data.fulfillmentType,
        deliveryBuilding: data.deliveryBuilding || null,
        deliveryFloor: data.deliveryFloor || null,
        deliveryRoom: data.deliveryRoom || null,
        subtotal: String(subtotal),
        deliveryFee: String(deliveryFee),
        totalAmount: String(totalAmount),
        paymentMethod: data.paymentMethod,
        // Demo/sandbox mode: payment gateways aren't wired to real merchant
        // credentials yet, so we mark as paid immediately after "checkout".
        // Swap this for a real SSLCommerz/ShurjoPay callback in production.
        paymentStatus: "paid",
      })
      .returning();

    await tx.insert(orderItems).values(
      lineItems.map((li) => ({ ...li, orderId: createdOrder.id }))
    );

    return createdOrder;
  });

  return NextResponse.json({ order }, { status: 201 });
}
