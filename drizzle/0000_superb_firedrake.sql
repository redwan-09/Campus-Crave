CREATE TYPE "public"."canteen_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_type" AS ENUM('pickup', 'delivery');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('placed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bkash', 'nagad', 'rocket', 'card', 'wallet');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('available', 'low', 'sold_out');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('basic', 'standard', 'premium');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'canteen_manager', 'admin');--> statement-breakpoint
CREATE TABLE "canteens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"campus" varchar(160) NOT NULL,
	"location" varchar(160),
	"subscription_tier" "subscription_tier" DEFAULT 'basic' NOT NULL,
	"commission_rate" numeric(4, 2) DEFAULT '0' NOT NULL,
	"status" "canteen_status" DEFAULT 'pending' NOT NULL,
	"next_token_number" integer DEFAULT 401 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canteen_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_bn" varchar(160),
	"description" text,
	"price" numeric(8, 2) NOT NULL,
	"category" varchar(80),
	"emoji" varchar(8) DEFAULT '🍽️',
	"stock_status" "stock_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"menu_item_id" uuid,
	"name_snapshot" varchar(160) NOT NULL,
	"price_snapshot" numeric(8, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_number" integer NOT NULL,
	"student_id" uuid NOT NULL,
	"canteen_id" uuid NOT NULL,
	"fulfillment_type" "fulfillment_type" NOT NULL,
	"delivery_building" varchar(120),
	"delivery_floor" varchar(40),
	"delivery_room" varchar(40),
	"status" "order_status" DEFAULT 'placed' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"delivery_fee" numeric(6, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(190) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"phone" varchar(30),
	"student_id_number" varchar(60),
	"university" varchar(160),
	"wallet_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "canteens" ADD CONSTRAINT "canteens_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_canteen_id_canteens_id_fk" FOREIGN KEY ("canteen_id") REFERENCES "public"."canteens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_canteen_id_canteens_id_fk" FOREIGN KEY ("canteen_id") REFERENCES "public"."canteens"("id") ON DELETE cascade ON UPDATE no action;