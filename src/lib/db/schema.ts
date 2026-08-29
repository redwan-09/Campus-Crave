import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  pgEnum,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ---------------------------------------------------------------------- */
/*  ENUMS                                                                  */
/* ---------------------------------------------------------------------- */

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "canteen_manager",
  "admin",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "basic",
  "standard",
  "premium",
]);

export const canteenStatusEnum = pgEnum("canteen_status", [
  "pending",
  "active",
  "suspended",
]);

export const stockStatusEnum = pgEnum("stock_status", [
  "available",
  "low",
  "sold_out",
]);

export const fulfillmentTypeEnum = pgEnum("fulfillment_type", [
  "pickup",
  "delivery",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "placed",
  "preparing",
  "ready",
  "picked_up",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bkash",
  "nagad",
  "rocket",
  "card",
  "wallet",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
]);

/* ---------------------------------------------------------------------- */
/*  USERS                                                                  */
/* ---------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  phone: varchar("phone", { length: 30 }),
  studentIdNumber: varchar("student_id_number", { length: 60 }),
  university: varchar("university", { length: 160 }),
  walletBalance: numeric("wallet_balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------------------------------------------------------------------- */
/*  CANTEENS                                                               */
/* ---------------------------------------------------------------------- */

export const canteens = pgTable("canteens", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  campus: varchar("campus", { length: 160 }).notNull(),
  location: varchar("location", { length: 160 }),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .notNull()
    .default("basic"),
  commissionRate: numeric("commission_rate", { precision: 4, scale: 2 })
    .notNull()
    .default("0"),
  status: canteenStatusEnum("status").notNull().default("pending"),
  nextTokenNumber: integer("next_token_number").notNull().default(401),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------------------------------------------------------------------- */
/*  MENU ITEMS                                                             */
/* ---------------------------------------------------------------------- */

export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  canteenId: uuid("canteen_id")
    .notNull()
    .references(() => canteens.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  nameBn: varchar("name_bn", { length: 160 }),
  description: text("description"),
  price: numeric("price", { precision: 8, scale: 2 }).notNull(),
  category: varchar("category", { length: 80 }),
  emoji: varchar("emoji", { length: 8 }).default("🍽️"),
  stockStatus: stockStatusEnum("stock_status").notNull().default("available"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------------------------------------------------------------------- */
/*  ORDERS                                                                 */
/* ---------------------------------------------------------------------- */

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  tokenNumber: integer("token_number").notNull(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  canteenId: uuid("canteen_id")
    .notNull()
    .references(() => canteens.id, { onDelete: "cascade" }),
  fulfillmentType: fulfillmentTypeEnum("fulfillment_type").notNull(),
  deliveryBuilding: varchar("delivery_building", { length: 120 }),
  deliveryFloor: varchar("delivery_floor", { length: 40 }),
  deliveryRoom: varchar("delivery_room", { length: 40 }),
  status: orderStatusEnum("status").notNull().default("placed"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 6, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id").references(() => menuItems.id, {
    onDelete: "set null",
  }),
  nameSnapshot: varchar("name_snapshot", { length: 160 }).notNull(),
  priceSnapshot: numeric("price_snapshot", { precision: 8, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
});

/* ---------------------------------------------------------------------- */
/*  RELATIONS (for query ergonomics)                                       */
/* ---------------------------------------------------------------------- */

export const usersRelations = relations(users, ({ many, one }) => ({
  canteen: one(canteens, {
    fields: [users.id],
    references: [canteens.ownerId],
  }),
  orders: many(orders),
}));

export const canteensRelations = relations(canteens, ({ one, many }) => ({
  owner: one(users, { fields: [canteens.ownerId], references: [users.id] }),
  menuItems: many(menuItems),
  orders: many(orders),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  canteen: one(canteens, {
    fields: [menuItems.canteenId],
    references: [canteens.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  student: one(users, { fields: [orders.studentId], references: [users.id] }),
  canteen: one(canteens, {
    fields: [orders.canteenId],
    references: [canteens.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));
