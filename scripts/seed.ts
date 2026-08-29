import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { canteens, menuItems, orders, orderItems, users } from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth";
import { SUBSCRIPTION_TIERS } from "../src/lib/constants";

async function main() {
  // Dynamically imported: this module reads process.env.DATABASE_URL at
  // import time to build its connection pool, so it must load *after*
  // dotenv has populated process.env above (static imports are hoisted
  // and would otherwise run before the config() call).
  const { db } = await import("../src/lib/db");

  console.log("Seeding Campus-Crave demo data...");

  const demoPassword = await hashPassword("Demo@1234");

  // ---- Admin ----
  const [admin] = await db
    .insert(users)
    .values({
      name: "Platform Admin",
      email: "admin@campuscrave.app",
      passwordHash: demoPassword,
      role: "admin",
    })
    .returning();

  // ---- Canteen manager + canteen (active) ----
  const [managerOne] = await db
    .insert(users)
    .values({
      name: "Rafiqul Islam",
      email: "canteen@campuscrave.app",
      passwordHash: demoPassword,
      role: "canteen_manager",
      phone: "01700000000",
    })
    .returning();

  const tierStandard = SUBSCRIPTION_TIERS.standard;
  const [canteenOne] = await db
    .insert(canteens)
    .values({
      ownerId: managerOne.id,
      name: "Central Canteen",
      campus: "Dhaka University",
      location: "Kala Bhaban",
      subscriptionTier: "standard",
      commissionRate: String(tierStandard.commissionRate),
      status: "active",
      nextTokenNumber: 481,
    })
    .returning();

  // ---- A second, pending canteen (for the admin approvals demo) ----
  const [managerTwo] = await db
    .insert(users)
    .values({
      name: "Nasrin Akter",
      email: "canteen2@campuscrave.app",
      passwordHash: demoPassword,
      role: "canteen_manager",
      phone: "01800000000",
    })
    .returning();

  await db.insert(canteens).values({
    ownerId: managerTwo.id,
    name: "Science Faculty Canteen",
    campus: "Dhaka University",
    location: "Curzon Hall",
    subscriptionTier: "basic",
    commissionRate: String(SUBSCRIPTION_TIERS.basic.commissionRate),
    status: "pending",
  });

  // ---- Student ----
  const [student] = await db
    .insert(users)
    .values({
      name: "Rakib Hasan",
      email: "student@campuscrave.app",
      passwordHash: demoPassword,
      role: "student",
      studentIdNumber: "2021-3-60-001",
      university: "Dhaka University",
      phone: "01900000000",
    })
    .returning();

  // ---- Menu items for the active canteen ----
  type StockStatus = "available" | "low" | "sold_out";
  const menuData: {
    name: string;
    nameBn: string;
    price: string;
    category: string;
    emoji: string;
    stockStatus?: StockStatus;
  }[] = [
    { name: "Khichuri with Egg Bhuna", nameBn: "খিচুড়ি ও ডিম ভুনা", price: "70", category: "Lunch", emoji: "🍛" },
    { name: "Alur Chop", nameBn: "আলুর চপ", price: "15", category: "Snacks", emoji: "🥟", stockStatus: "low" },
    { name: "Chicken Roll", nameBn: "চিকেন রোল", price: "90", category: "Snacks", emoji: "🌯" },
    { name: "Lassi", nameBn: "লাচ্ছি", price: "50", category: "Drinks", emoji: "🥤" },
    { name: "Singara (2 pcs) + Tea", nameBn: "সিঙ্গারা x2 + চা", price: "35", category: "Snacks", emoji: "☕" },
    { name: "Beef Tehari", nameBn: "বীফ তেহারি", price: "110", category: "Lunch", emoji: "🍚" },
    { name: "Paratha + Bhaji", nameBn: "পরোটা ও ভাজি", price: "40", category: "Breakfast", emoji: "🫓" },
    { name: "Mineral Water", nameBn: "মিনারেল ওয়াটার", price: "20", category: "Drinks", emoji: "💧" },
  ];

  const insertedMenu = await db
    .insert(menuItems)
    .values(
      menuData.map((m) => ({
        canteenId: canteenOne.id,
        name: m.name,
        nameBn: m.nameBn,
        price: m.price,
        category: m.category,
        emoji: m.emoji,
        stockStatus: m.stockStatus ?? "available",
      }))
    )
    .returning();

  // ---- A few sample orders across today, for the analytics chart ----
  const now = new Date();
  const sampleOrders: { hourOffset: number; itemIdx: number; qty: number; status: "placed" | "preparing" | "ready" | "picked_up" }[] = [
    { hourOffset: -3, itemIdx: 0, qty: 1, status: "picked_up" },
    { hourOffset: -2, itemIdx: 2, qty: 2, status: "picked_up" },
    { hourOffset: -1, itemIdx: 4, qty: 1, status: "ready" },
    { hourOffset: 0, itemIdx: 0, qty: 1, status: "preparing" },
    { hourOffset: 0, itemIdx: 2, qty: 1, status: "placed" },
  ];

  let token = canteenOne.nextTokenNumber;
  for (const so of sampleOrders) {
    const item = insertedMenu[so.itemIdx];
    const createdAt = new Date(now.getTime() + so.hourOffset * 60 * 60 * 1000);
    const subtotal = Number(item.price) * so.qty;
    const [order] = await db
      .insert(orders)
      .values({
        tokenNumber: token++,
        studentId: student.id,
        canteenId: canteenOne.id,
        fulfillmentType: "pickup",
        status: so.status,
        subtotal: String(subtotal),
        deliveryFee: "0",
        totalAmount: String(subtotal),
        paymentMethod: "bkash",
        paymentStatus: "paid",
        createdAt,
        updatedAt: createdAt,
      })
      .returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      menuItemId: item.id,
      nameSnapshot: item.name,
      priceSnapshot: item.price,
      quantity: so.qty,
    });
  }

  await db
    .update(canteens)
    .set({ nextTokenNumber: token })
    .where(eq(canteens.id, canteenOne.id));

  console.log("Seed complete. Demo accounts (password: Demo@1234):");
  console.log(`  Admin            -> ${admin.email}`);
  console.log(`  Canteen manager  -> ${managerOne.email}  (Central Canteen, active)`);
  console.log(`  Canteen manager  -> ${managerTwo.email}  (Science Faculty Canteen, pending)`);
  console.log(`  Student          -> ${student.email}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
