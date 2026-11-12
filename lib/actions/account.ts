"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema, profileSchema } from "@/lib/schemas";
import { AuthorizationError, assertUser } from "@/lib/session";
import { keyFromUrl, storage } from "@/lib/storage";
import { isUsernameTaken } from "@/lib/username";
import type { FormState } from "@/lib/actions/auth";

function errorsOf(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  let user;
  try {
    user = await assertUser();
  } catch (e) {
    return { error: e instanceof AuthorizationError ? e.message : "Sign in first." };
  }
  const values = { name: String(formData.get("name") ?? ""), username: String(formData.get("username") ?? ""), bio: String(formData.get("bio") ?? "") };
  const parsed = profileSchema.safeParse({ ...values, image: formData.get("image") || null });
  if (!parsed.success) return { fieldErrors: errorsOf(parsed.error.issues), values };

  if (parsed.data.username !== user.username && (await isUsernameTaken(parsed.data.username, user.id))) {
    return { fieldErrors: { username: "That handle's taken. Try another." }, values };
  }
  // Avatar must be one of our uploads (or unchanged / removed).
  const image = parsed.data.image ?? null;
  if (image && image !== user.image && !keyFromUrl(image)?.startsWith("avatars/")) {
    return { fieldErrors: { image: "Upload your avatar again." }, values };
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, username: parsed.data.username, bio: parsed.data.bio || null, image },
  });
  const oldKey = keyFromUrl(user.image);
  if (oldKey && user.image !== image) await storage.delete(oldKey);

  revalidatePath("/", "layout");
  return { success: "Saved. Looking sharp.", values: { ...values, username: parsed.data.username } };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  let user;
  try {
    user = await assertUser();
  } catch (e) {
    return { error: e instanceof AuthorizationError ? e.message : "Sign in first." };
  }
  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current") || undefined,
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { fieldErrors: errorsOf(parsed.error.issues) };

  // Google-only accounts can set a first password without a current one.
  if (user.passwordHash && !(await verifyPassword(parsed.data.current ?? "", user.passwordHash))) {
    return { fieldErrors: { current: "That's not your current password." } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password) } });
  return { success: "Password updated." };
}
