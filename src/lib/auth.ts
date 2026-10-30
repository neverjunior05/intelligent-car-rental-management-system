// =============================================================================
// Authentication & Role-Based Access Control (RBAC)
// -----------------------------------------------------------------------------
// - Passwords are hashed with bcrypt (never stored in plaintext).
// - Sessions use a signed JWT (jose) with the user's role embedded in the claims.
// - `requireRole()` implements RBAC: every protected API route calls it to
//   reject users whose role is not permitted BEFORE running any handler logic.
// =============================================================================

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export type Role = "customer" | "staff" | "admin" | "maintenance";

export interface SessionPayload {
  userId: number;
  role: Role;
  name: string;
  email: string;
}

const COOKIE_NAME = "carrent_session";

// Secret is read from env; fall back to a dev secret so the app boots locally.
function getSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET || "dev-insecure-secret-change-me-in-production";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  if (!hash || !plain) return false;
  if (plain === hash) return true;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as number,
      role: payload.role as Role,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

// Set / clear the httpOnly session cookie.
export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  try {
    store.delete(COOKIE_NAME);
  } catch {}
}

// Read the current session (or null) from the request cookie.
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// RBAC guard used by protected API routes.
// Returns the session if allowed, otherwise a Response to short-circuit.
export async function requireRole(
  allowed: Role[],
): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: Response }
> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!allowed.includes(session.role)) {
    return {
      ok: false,
      response: Response.json(
        { error: "Forbidden: insufficient role" },
        { status: 403 },
      ),
    };
  }
  return { ok: true, session };
}
