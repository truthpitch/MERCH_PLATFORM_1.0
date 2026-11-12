import type { Metadata } from "next";
import Link from "next/link";
import { DesignActions } from "@/components/dashboard/DesignActions";
import { DesignThumb } from "@/components/dashboard/DesignThumb";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { PRODUCT_TYPE_SPECS } from "@/lib/catalog";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { ProductTypeId } from "@/types";

export const metadata: Metadata = { title: "My designs" };

const ORDER = { REJECTED: 0, DRAFT: 1, PENDING: 2, APPROVED: 3 } as const;

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser("/dashboard");
  const { submitted } = await searchParams;

  const designs = await db.design.findMany({
    where: { creatorId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { variants: { select: { productType: true }, distinct: ["productType"] } },
  });
  designs.sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const counts = designs.reduce<Record<string, number>>((acc, d) => ((acc[d.status] = (acc[d.status] ?? 0) + 1), acc), {});
  const isAdmin = user.role === "ADMIN";

  return (
    <div>
      {typeof submitted === "string" && (
        <p role="status" className="mb-8 flex items-start gap-3 rounded-lg bg-accent/10 p-5 text-accent">
          <CheckIcon size={20} className="mt-0.5 shrink-0" />
          <span>
            <strong>“{submitted}” is in the queue.</strong> We review every design by hand and usually reply within a few days. You&apos;ll get an
            email either way.
          </span>
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["APPROVED", "Live"],
            ["PENDING", "In review"],
            ["DRAFT", "Drafts"],
            ["REJECTED", "Needs changes"],
          ] as const
        ).map(([k, label]) => (
          <div key={k} className="rounded-lg border border-navy/10 bg-white p-5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums">{counts[k] ?? 0}</dd>
          </div>
        ))}
      </dl>

      {isAdmin && (
        <p className="mt-6 text-sm text-muted">
          You&apos;re an admin — TruthPitch products are managed from the{" "}
          <Link href="/admin/designs?status=ALL" className="font-semibold text-accent underline-offset-4 hover:underline">
            admin area
          </Link>
          .
        </p>
      )}

      {designs.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-navy/20 px-6 py-20 text-center">
          <p className="text-3xl font-bold tracking-tight">Nothing here yet. That&apos;s fine.</p>
          <p className="mx-auto mt-3 max-w-md text-muted">Every design starts with one line you actually believe. Upload your artwork and we&apos;ll put it on a tee.</p>
          <Button href="/studio" size="lg" className="mt-8" icon={<ArrowRightIcon size={18} />}>
            Open the studio
          </Button>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4">
          {designs.map((d, i) => {
            const types = d.variants.map((v) => v.productType as ProductTypeId);
            return (
              <Reveal as="li" key={d.id} delay={Math.min(i, 6) * 0.05} y={16}>
                <article className="flex flex-col gap-5 rounded-lg border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
                  <DesignThumb
                    imageUrl={d.imageUrl}
                    type={types[0]}
                    placement={{ x: d.placementX, y: d.placementY, scale: d.placementScale }}
                    community={!isAdmin || Boolean(d.imageKey)}
                    className="w-full shrink-0 rounded-md sm:w-28"
                    alt=""
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="truncate text-xl font-bold tracking-tight">{d.title || "Untitled"}</h2>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {types.length ? types.map((t) => PRODUCT_TYPE_SPECS[t].label).join(" · ") : "No products chosen"} · Updated{" "}
                      {d.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    {d.status === "REJECTED" && d.rejectionReason && (
                      <p className="mt-3 rounded-md bg-sand-200 px-3 py-2 text-sm">
                        <span className="font-semibold text-brown">Why: </span>
                        {d.rejectionReason}
                      </p>
                    )}
                    {d.status === "PENDING" && d.submittedAt && (
                      <p className="mt-2 text-sm text-accent">Submitted {d.submittedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — in the queue.</p>
                    )}
                  </div>
                  <DesignActions id={d.id} status={d.status} slug={d.slug} title={d.title} />
                </article>
              </Reveal>
            );
          })}
        </ul>
      )}
    </div>
  );
}
