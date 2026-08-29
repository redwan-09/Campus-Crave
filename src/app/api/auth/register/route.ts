import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { canteens, users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validators";
import { createSessionToken, hashPassword, SESSION_COOKIE, ROLE_HOME } from "@/lib/auth";
import { SUBSCRIPTION_TIERS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(data.password);

  if (data.role === "student") {
    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash,
        role: "student",
        phone: data.phone || null,
        studentIdNumber: data.studentIdNumber || null,
        university: data.university,
      })
      .returning();

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "student",
    });

    const res = NextResponse.json({
      ok: true,
      redirect: ROLE_HOME.student,
      user: { id: user.id, name: user.name, role: user.role },
    });
    res.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE.options);
    return res;
  }

  // canteen_manager
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      passwordHash,
      role: "canteen_manager",
      phone: data.phone || null,
    })
    .returning();

  const tier = SUBSCRIPTION_TIERS[data.subscriptionTier];

  const [canteen] = await db
    .insert(canteens)
    .values({
      ownerId: user.id,
      name: data.canteenName,
      campus: data.campus,
      location: data.location || null,
      subscriptionTier: data.subscriptionTier,
      commissionRate: String(tier.commissionRate),
      status: "pending", // an admin must approve before it goes live
    })
    .returning();

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: "canteen_manager",
    canteenId: canteen.id,
  });

  const res = NextResponse.json({
    ok: true,
    redirect: ROLE_HOME.canteen_manager,
    user: { id: user.id, name: user.name, role: user.role },
    canteen: { id: canteen.id, status: canteen.status },
  });
  res.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE.options);
  return res;
}
