import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SessionPayload, verifySessionToken } from "./auth";

/** Read and verify the current user's session from the request cookies. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE.name)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Throws-free helper: returns the session or null, never redirects. */
export async function requireRole(
  role: SessionPayload["role"] | SessionPayload["role"][]
): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session.role)) return null;
  return session;
}
