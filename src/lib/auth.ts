import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export type SessionRole = "student" | "canteen_manager" | "admin";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: SessionRole;
  canteenId?: string;
}

const SESSION_COOKIE_NAME = "cc_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a long random value in your environment variables."
    );
  }
  return new TextEncoder().encode(secret);
}

/* ------------------------------- passwords ------------------------------ */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/* --------------------------------- JWT ----------------------------------- */

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = {
  name: SESSION_COOKIE_NAME,
  maxAge: SESSION_TTL_SECONDS,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  },
};

/** Where each role should land after login, and which prefix guards their area. */
export const ROLE_HOME: Record<SessionRole, string> = {
  student: "/student",
  canteen_manager: "/canteen",
  admin: "/admin",
};
