"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";
import { hashPassword, randomToken, sha256 } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/schemas";
import { safeCallbackUrl } from "@/lib/session";
import { appBaseUrl } from "@/lib/url";
import { isUsernameTaken } from "@/lib/username";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  /** Echoed back so React 19 form resets keep what the user typed */
  values?: Record<string, string>;
}

function keep(formData: FormData, ...keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? "form");
    out[key] ??= i.message;
  }
  return out;
}

async function clientKey(scope: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

export async function signInWithPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = keep(formData, "email");
  const parsed = signInSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues), values };

  const limit = rateLimit(await clientKey(`signin:${parsed.data.email.toLowerCase()}`), 8, 10 * 60_000);
  if (!limit.ok) return { error: `Too many attempts. Take a breath and try again in ${Math.ceil(limit.retryInSec / 60)} min.`, values };

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) return { error: "That email and password don't match. Straight up.", values };
    throw err; // NEXT_REDIRECT on success
  }
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const values = keep(formData, "name", "username", "email");
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues), values };

  const limit = rateLimit(await clientKey("signup"), 5, 60 * 60_000);
  if (!limit.ok) return { error: "Too many sign-ups from here. Try again later.", values };

  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { fieldErrors: { email: "There's already an account with that email. Sign in instead?" }, values };
  }
  if (await isUsernameTaken(parsed.data.username)) {
    return { fieldErrors: { username: "That handle's taken. Try another." }, values };
  }

  await db.user.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      email,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl"), "/studio"),
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) return { error: "Account created, but we couldn't sign you in. Try signing in." };
    throw err;
  }
}

export async function signInWithGoogle(formData: FormData) {
  await signIn("google", { redirectTo: safeCallbackUrl(formData.get("callbackUrl")) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

const GENERIC_RESET = "If there's an account for that email, a reset link is on its way. Check your inbox (and spam).";

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues), values: keep(formData, "email") };

  const limit = rateLimit(await clientKey("forgot"), 5, 30 * 60_000);
  if (!limit.ok) return { success: GENERIC_RESET };

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (user) {
    const token = randomToken();
    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 60 * 60_000) },
    });
    await sendPasswordReset(user.email, `${await appBaseUrl()}/reset-password?token=${token}`);
  }
  // Same answer either way — don't reveal which emails have accounts.
  return { success: GENERIC_RESET };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };

  const record = await db.passwordResetToken.findUnique({ where: { tokenHash: sha256(parsed.data.token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "That reset link has expired or was already used. Request a new one." };
  }

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
  ]);
  return { success: "Password updated. Sign in with your new one." };
}
