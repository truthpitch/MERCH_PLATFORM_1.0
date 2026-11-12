"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { catalogVariants } from "@/lib/catalog";
import { db } from "@/lib/db";
import { randomToken } from "@/lib/password";
import { designSchema, type DesignInput } from "@/lib/schemas";
import { AuthorizationError, assertUser } from "@/lib/session";
import { keyFromUrl, safeKey, storage } from "@/lib/storage";
import { slugify } from "@/lib/utils";

export interface DesignActionResult {
  ok: boolean;
  id?: string;
  status?: "DRAFT" | "PENDING";
  error?: string;
  fieldErrors?: Record<string, string>;
}

/** Drafts only need a title + artwork; submissions need everything. */
const draftSchema = designSchema.extend({
  title: z.string().trim().min(1, "Give it a working title").max(60, "60 characters max"),
  tagline: z.string().trim().max(80),
  description: z.string().trim().max(600),
  story: z.string().trim().max(1200),
  productTypes: z.array(z.enum(["TEE", "HOODIE", "HAT"])),
});

function flatten(issues: z.core.$ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

async function uniqueSlug(title: string, exceptId?: string): Promise<string> {
  const base = slugify(title).slice(0, 60) || "design";
  for (let i = 0; i < 5; i += 1) {
    const candidate = i === 0 ? base : `${base}-${randomToken(3).toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    const hit = await db.design.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!hit || hit.id === exceptId) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveDesign(input: DesignInput): Promise<DesignActionResult> {
  let user;
  try {
    user = await assertUser();
  } catch (e) {
    return { ok: false, error: e instanceof AuthorizationError ? e.message : "Sign in first." };
  }

  const schema = input?.intent === "submit" ? designSchema : draftSchema;
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: flatten(parsed.error.issues), error: "A few things need fixing first." };
  const data = parsed.data;

  // Artwork must be one of our design uploads.
  const key = safeKey(data.imageKey);
  if (!key || !key.startsWith("designs/") || !(await storage.get(key))) {
    return { ok: false, fieldErrors: { imageKey: "Upload your artwork again — we couldn't find it." } };
  }

  let existing: { id: string; creatorId: string; status: string; imageUrl: string } | null = null;
  if (data.id) {
    existing = await db.design.findUnique({ where: { id: data.id }, select: { id: true, creatorId: true, status: true, imageUrl: true } });
    if (!existing || existing.creatorId !== user.id) return { ok: false, error: "That design isn't yours to edit." };
    if (existing.status === "APPROVED") return { ok: false, error: "Approved designs are locked. Contact us to make changes." };
  }

  const status = data.intent === "submit" ? "PENDING" : "DRAFT";
  const fields = {
    title: data.title,
    tagline: data.tagline || null,
    description: data.description,
    story: data.story,
    imageUrl: storage.url(key),
    imageKey: key,
    placementX: data.placementX,
    placementY: data.placementY,
    placementScale: data.placementScale,
    status,
    rejectionReason: null,
    submittedAt: status === "PENDING" ? new Date() : null,
  } as const;

  const id = await db.$transaction(async (tx) => {
    const slug = await uniqueSlug(data.title, existing?.id);
    const design = existing
      ? await tx.design.update({ where: { id: existing.id }, data: { ...fields, slug } })
      : await tx.design.create({ data: { ...fields, slug, creatorId: user.id } });
    // Never-approved designs have no orders, so variants can be rebuilt freely.
    await tx.productVariant.deleteMany({ where: { designId: design.id } });
    if (data.productTypes.length) {
      await tx.productVariant.createMany({
        data: catalogVariants(design.id, data.productTypes).map((v) => ({ ...v, designId: design.id })),
      });
    }
    return design.id;
  });

  // Clean up replaced artwork.
  const oldKey = keyFromUrl(existing?.imageUrl);
  if (oldKey && oldKey !== key) await storage.delete(oldKey);

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true, id, status };
}

async function ownDesign(id: string) {
  const user = await assertUser();
  const design = await db.design.findUnique({ where: { id }, select: { id: true, creatorId: true, status: true, imageUrl: true } });
  if (!design || design.creatorId !== user.id) throw new AuthorizationError("That design isn't yours.", 403);
  return design;
}

export async function withdrawDesign(id: string): Promise<DesignActionResult> {
  try {
    const design = await ownDesign(String(id));
    if (design.status !== "PENDING") return { ok: false, error: "Only designs in review can be withdrawn." };
    await db.design.update({ where: { id: design.id }, data: { status: "DRAFT", submittedAt: null } });
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { ok: true, id: design.id, status: "DRAFT" };
  } catch (e) {
    return { ok: false, error: e instanceof AuthorizationError ? e.message : "Couldn't withdraw that design." };
  }
}

export async function deleteDesign(id: string): Promise<DesignActionResult> {
  try {
    const design = await ownDesign(String(id));
    if (design.status === "APPROVED") return { ok: false, error: "Live designs can't be deleted from here. Contact us." };
    await db.design.delete({ where: { id: design.id } });
    const key = keyFromUrl(design.imageUrl);
    if (key) await storage.delete(key);
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AuthorizationError ? e.message : "Couldn't delete that design." };
  }
}
