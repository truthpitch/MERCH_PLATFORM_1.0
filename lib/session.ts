/**
 * Server-side authorization helpers. Every protected page, route handler
 * and server action calls one of these. Role is read from the DATABASE on
 * each call, so demoting an admin takes effect immediately.
 */
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export const getCurrentUser = cache(async () => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, username: true, role: true, image: true, bio: true, passwordHash: true, createdAt: true },
  });
});

/** For pages: redirect to sign-in (and back afterwards) when signed out. */
export async function requireUser(callbackPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackPath)}`);
  return user;
}

/** For pages: signed-out → sign-in; signed-in non-admin → 404 (don't reveal the area). */
export async function requireAdmin(callbackPath = "/admin"): Promise<CurrentUser> {
  const user = await requireUser(callbackPath);
  if (user.role !== "ADMIN") notFound();
  return user;
}

export class AuthorizationError extends Error {
  constructor(
    message = "You need to be signed in to do that.",
    public status = 401,
  ) {
    super(message);
  }
}

/** For server actions / route handlers: throw instead of redirecting. */
export async function assertUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthorizationError();
  return user;
}

export async function assertAdmin(): Promise<CurrentUser> {
  const user = await assertUser();
  if (user.role !== "ADMIN") throw new AuthorizationError("Admins only.", 403);
  return user;
}

/** Only allow same-site relative redirects. */
export function safeCallbackUrl(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
