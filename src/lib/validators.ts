import { z } from "zod";

export const registerStudentSchema = z.object({
  role: z.literal("student"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(6).max(30).optional().or(z.literal("")),
  studentIdNumber: z.string().trim().max(60).optional().or(z.literal("")),
  university: z.string().trim().min(2).max(160),
});

export const registerCanteenSchema = z.object({
  role: z.literal("canteen_manager"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(6).max(30).optional().or(z.literal("")),
  canteenName: z.string().trim().min(2).max(160),
  campus: z.string().trim().min(2).max(160),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  subscriptionTier: z.enum(["basic", "standard", "premium"]).default("basic"),
});

export const registerSchema = z.discriminatedUnion("role", [
  registerStudentSchema,
  registerCanteenSchema,
]);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

export const menuItemCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  nameBn: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  price: z.coerce.number().positive().max(100000),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  emoji: z.string().trim().max(8).optional().or(z.literal("")),
});

export const menuItemUpdateSchema = menuItemCreateSchema.partial().extend({
  stockStatus: z.enum(["available", "low", "sold_out"]).optional(),
});

export const orderCreateSchema = z.object({
  canteenId: z.string().uuid(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(20),
  fulfillmentType: z.enum(["pickup", "delivery"]),
  deliveryBuilding: z.string().trim().max(120).optional().or(z.literal("")),
  deliveryFloor: z.string().trim().max(40).optional().or(z.literal("")),
  deliveryRoom: z.string().trim().max(40).optional().or(z.literal("")),
  paymentMethod: z.enum(["bkash", "nagad", "rocket", "card", "wallet"]),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "placed",
    "preparing",
    "ready",
    "picked_up",
    "delivered",
    "cancelled",
  ]),
});

export const canteenStatusUpdateSchema = z.object({
  status: z.enum(["pending", "active", "suspended"]),
});

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1).max(500),
});
