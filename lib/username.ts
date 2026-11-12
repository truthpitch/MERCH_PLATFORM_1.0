import { db } from "@/lib/db";

export const USERNAME_RE = /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$/;

/** Usernames that would collide with routes or confuse people. */
export const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "truthpitch", "support", "help", "api", "shop", "studio",
  "dashboard", "marketplace", "creators", "settings", "sign-in", "sign-up", "about", "contact",
]);

export function normaliseUsername(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_-]+/g, "")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 30);
}

export async function isUsernameTaken(username: string, exceptUserId?: string): Promise<boolean> {
  if (RESERVED_USERNAMES.has(username)) return true;
  const existing = await db.user.findUnique({ where: { username }, select: { id: true } });
  return Boolean(existing && existing.id !== exceptUserId);
}

/** Derives a free username from a name/email ("Maya O." → "mayao", "mayao2", …). */
export async function uniqueUsername(seed: string): Promise<string> {
  let base = normaliseUsername(seed);
  if (base.length < 3) base = `creator${base}`;
  base = base.slice(0, 26);
  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? base : `${base}${i + 1}`;
    if (!(await isUsernameTaken(candidate))) return candidate;
  }
  return `${base}${Date.now().toString(36).slice(-4)}`;
}
