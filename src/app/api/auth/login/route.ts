import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { canteens, users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validators";
import { createSessionToken, verifyPassword, SESSION_COOKIE, ROLE_HOME } from "@/lib/auth";

// Simple in-memory rate limiting per server instance. For real production
// scale, replace with Upstash Redis or Vercel's built-in rate limiting.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (isRateLimited(`${ip}:${email}`)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  let canteenId: string | undefined;
  if (user.role === "canteen_manager") {
    const canteen = await db.query.canteens.findFirst({
      where: eq(canteens.ownerId, user.id),
    });
    canteenId = canteen?.id;
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    canteenId,
  });

  const res = NextResponse.json({
    ok: true,
    redirect: ROLE_HOME[user.role],
    user: { id: user.id, name: user.name, role: user.role },
  });
  res.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE.options);
  return res;
}
