import type { Metadata } from "next";
import Link from "next/link";
import { DesignThumb } from "@/components/dashboard/DesignThumb";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { PRODUCT_TYPE_SPECS } from "@/lib/catalog";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { ProductTypeId } from "@/types";

export const metadata: Metadata = { title: "Designs" };

const TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Live" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DRAFT", label: "Drafts" },
  { value: "ALL", label: "All" },
] as const;
type Tab = (typeof TABS)[number]["value"];

export default async function AdminDesignsPage({ searchParams }: PageProps<"/admin/designs">) {
  await requireAdmin();
  const sp = await searchParams;
  const status: Tab = TABS.some((t) => t.value === sp.status) ? (sp.status as Tab) : "PENDING";

  const [designs, grouped] = await Promise.all([
    db.design.findMany({
      where: status === "ALL" ? {} : { status },
      orderBy: status === "PENDING" ? { submittedAt: "asc" } : { updatedAt: "desc" },
      include: {
        creator: { select: { name: true, username: true, role: true } },
        variants: { select: { productType: true }, distinct: ["productType"] },
      },
      take: 200,
    }),
    db.design.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s: Tab) => (s === "ALL" ? grouped.reduce((n, g) => n + g._count._all, 0) : (grouped.find((g) => g.status === s)?._count._all ?? 0));

  return (
    <div>
      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "PENDING" ? "/admin/designs" : `/admin/designs?status=${t.value}`}
            aria-current={status === t.value ? "true" : undefined}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold",
              status === t.value ? "border-navy bg-navy text-white" : "border-navy/15 bg-white hover:border-navy",
            )}
          >
            {t.label} <span className="text-xs tabular-nums opacity-70">{count(t.value)}</span>
          </Link>
        ))}
      </nav>

      {designs.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-navy/20 px-6 py-20 text-center">
          <p className="text-3xl font-bold tracking-tight">{status === "PENDING" ? "Inbox zero." : "Nothing here."}</p>
          <p className="mt-2 text-muted">{status === "PENDING" ? "No designs waiting. Go make something yourself." : "No designs with this status."}</p>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {designs.map((d) => {
            const types = d.variants.map((v) => v.productType as ProductTypeId);
            const community = d.creator.role !== "ADMIN";
            return (
              <li key={d.id}>
                <Link href={`/admin/designs/${d.id}`} className="group block overflow-hidden rounded-lg border border-navy/10 bg-white transition-colors hover:border-navy/30">
                  <DesignThumb
                    imageUrl={d.imageUrl}
                    type={types[0]}
                    placement={{ x: d.placementX, y: d.placementY, scale: d.placementScale }}
                    community={community}
                    sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-tight">{d.title || "Untitled"}</p>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {community ? `by ${d.creator.name ?? d.creator.username}` : "TruthPitch"} · {types.map((t) => PRODUCT_TYPE_SPECS[t].label).join(", ") || "—"}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                      {d.status === "PENDING" ? "Review" : "Open"} <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
