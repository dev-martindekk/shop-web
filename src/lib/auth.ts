import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret"
);

export type SessionUser = {
  uid: number;
  role: "CUSTOMER" | "ADMIN" | "SUPERADMIN";
  name: string;
  email: string;
};

export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      uid: payload.uid as number,
      role: payload.role as SessionUser["role"],
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new AuthError(401, "unauthorized");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new AuthError(401, "unauthorized");
  if (session.role !== "ADMIN" && session.role !== "SUPERADMIN") throw new AuthError(403, "forbidden");
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function handleApiError(e: unknown): NextResponse {
  if (e instanceof AuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error(e);
  return NextResponse.json({ error: "internal error" }, { status: 500 });
}

export async function setAuthCookie(user: SessionUser) {
  const token = await signToken(user);
  const store = await cookies();
  store.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete("token");
}

export async function verifyAdminOrNull(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) return null;
  const user = await db.user.findUnique({ where: { id: session.uid } });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return null;
  return session;
}
