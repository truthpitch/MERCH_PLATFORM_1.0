"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendDesignDecision } from "@/lib/email";
import { fulfillment } from "@/lib/fulfillment";
import { rejectSchema } from "@/lib/schemas";
import { AuthorizationError, assertAdmin } from "@/lib/session";
import { appBaseUrl } from "@/lib/url";

export interface AdminResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function fail(e: unknown, fallback: string): AdminResult {
  if (e instanceof AuthorizationError) return { ok: false, error: e.message };
  console.error("[admin]", e);
  return { ok: false, error: fallback };
}

function revalidateCatalog() {
  for (const p of ["/admin", "/admin/designs", "/marketplace", "/shop", "/", "/dashboard"]) revalidatePath(p);
}

export async function approveDesign(designId: string): Promise<AdminResult> {
  try {
    await assertAdmin();
    const design = await db.design.findUnique({
      where: { id: String(designId) },
      include: { creator: { select: { email: true } }, _count: { select: { variants: true } } },
    });
    if (!design) return { ok: false, error: "Design not found." };
    if (design.status === "APPROVED") return { ok: true };
    if (design._count.variants === 0) return { ok: false, error: "This design has no products selected — reject it with a note instead." };

    await db.design.update({
      where: { id: design.id },
      data: { status: "APPROVED", approvedAt: new Date(), rejectionReason: null },
    });
    await sendDesignDecision(design.creator.email, {
      title: design.title,
      approved: true,
      url: `${await appBaseUrl()}/shop/${design.slug}`,
    });
    revalidateCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e, "Couldn't approve that design.");
  }
}

export async function rejectDesign(input: { designId: string; reason: string }): Promise<AdminResult> {
  try {
    await assertAdmin();
    const parsed = rejectSchema.safeParse(input);
    if (!parsed.success) return { ok: false, fieldErrors: { reason: parsed.error.issues[0]?.message ?? "Add a reason." } };
    const design = await db.design.findUnique({ where: { id: parsed.data.designId }, include: { creator: { select: { email: true } } } });
    if (!design) return { ok: false, error: "Design not found." };
    if (design.status === "APPROVED") {
      // Taking a live design down: only if nobody has ordered it.
      const ordered = await db.orderItem.count({ where: { variant: { designId: design.id } } });
      if (ordered > 0) return { ok: false, error: "This design has orders, so it can't be pulled back to review. Deactivate its variants instead." };
    }
    await db.design.update({
      where: { id: design.id },
      data: { status: "REJECTED", rejectionReason: parsed.data.reason, approvedAt: null },
    });
    await sendDesignDecision(design.creator.email, {
      title: design.title,
      approved: false,
      reason: parsed.data.reason,
      url: `${await appBaseUrl()}/studio/${design.id}`,
    });
    revalidateCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e, "Couldn't reject that design.");
  }
}

export async function setDesignFlags(input: { designId: string; isNew?: boolean; isBestSeller?: boolean }): Promise<AdminResult> {
  try {
    await assertAdmin();
    const data = z.object({ designId: z.string().min(1), isNew: z.boolean().optional(), isBestSeller: z.boolean().optional() }).parse(input);
    await db.design.update({ where: { id: data.designId }, data: { isNew: data.isNew, isBestSeller: data.isBestSeller } });
    revalidateCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e, "Couldn't update that design.");
  }
}

export async function setUserRole(input: { userId: string; role: "USER" | "ADMIN" }): Promise<AdminResult> {
  try {
    const me = await assertAdmin();
    const data = z.object({ userId: z.string().min(1), role: z.enum(["USER", "ADMIN"]) }).parse(input);
    if (data.userId === me.id) return { ok: false, error: "You can't change your own role." };
    if (data.role === "USER") {
      const admins = await db.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) return { ok: false, error: "There has to be at least one admin." };
    }
    await db.user.update({ where: { id: data.userId }, data: { role: data.role } });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return fail(e, "Couldn't change that role.");
  }
}

/** Pull the latest status from the print-on-demand provider. */
export async function refreshFulfillment(orderId: string): Promise<AdminResult> {
  try {
    await assertAdmin();
    const order = await db.order.findUnique({ where: { id: String(orderId) } });
    if (!order?.fulfillmentId) return { ok: false, error: "This order hasn't been sent to fulfillment." };
    const status = await fulfillment.getStatus(order.fulfillmentId);
    await db.order.update({
      where: { id: order.id },
      data: { fulfillmentStatus: status.status, status: status.orderStatus ?? order.status },
    });
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    return fail(e, "Couldn't reach the fulfillment provider.");
  }
}
