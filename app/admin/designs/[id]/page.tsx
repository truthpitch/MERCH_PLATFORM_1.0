import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlagToggles, ReviewPanel } from "@/components/admin/AdminControls";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { GarmentMockup } from "@/components/product/GarmentMockup";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { PRODUCT_TYPE_SPECS, PRODUCT_TYPES } from "@/lib/catalog";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import type { ProductTypeId } from "@/types";

export const metadata: Metadata = { title: "Review design" };

export default async function ReviewDesignPage({ params }: PageProps<"/admin/designs/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const design = await db.design.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, username: true, email: true, role: true, createdAt: true, _count: { select: { designs: true } } } },
      variants: { orderBy: [{ productType: "asc" }] },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
  if (!design) notFound();

  const types = [...new Set(design.variants.map((v) => v.productType as ProductTypeId))].sort((a, b) => PRODUCT_TYPES.indexOf(a) - PRODUCT_TYPES.indexOf(b));
  const community = design.creator.role !== "ADMIN";
  const mockup = { artworkUrl: design.imageUrl, x: design.placementX, y: design.placementY, scale: design.placementScale };
  const svg = design.imageUrl.endsWith(".svg");
  const next = design.status === "PENDING"
    ? await db.design.findFirst({ where: { status: "PENDING", id: { not: design.id } }, orderBy: { submittedAt: "asc" }, select: { id: true } })
    : null;
  const ordered = await db.orderItem.aggregate({ _sum: { quantity: true }, where: { variant: { designId: design.id } } });

  return (
    <div>
      <Link href="/admin/designs" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-navy">
        <ArrowLeftIcon size={16} /> Back to designs
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        <section aria-label="Preview" className="lg:col-span-7">
          {community ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[repeating-conic-gradient(#ebdfcf_0%_25%,#fff_0%_50%)] bg-[length:24px_24px] sm:col-span-2 sm:aspect-[16/10]">
                <Image src={design.imageUrl} alt={`Artwork for ${design.title}`} fill sizes="(min-width: 1024px) 55vw, 100vw" unoptimized={svg} className="object-contain p-6" />
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold">Raw artwork</span>
              </div>
              {(types.length ? types : (["TEE"] as ProductTypeId[])).flatMap((t) =>
                PRODUCT_TYPE_SPECS[t].colors.slice(0, 2).map((c) => (
                  <figure key={`${t}-${c.name}`} className="overflow-hidden rounded-lg">
                    <GarmentMockup type={t} color={c.hex} mockup={mockup} showGuide sizes="(min-width: 1024px) 27vw, 50vw" />
                    <figcaption className="bg-white px-3 py-2 text-xs font-medium text-muted">
                      {PRODUCT_TYPE_SPECS[t].label} · {c.name}
                    </figcaption>
                  </figure>
                )),
              )}
            </div>
          ) : (
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand-200">
              <Image src={design.images[0]?.url ?? design.imageUrl} alt={design.title} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
          )}
        </section>

        <aside className="grid content-start gap-6 lg:col-span-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={design.status} />
              {!community && <span className="text-sm text-muted">TruthPitch product</span>}
            </div>
            <h2 className="mt-3 text-4xl font-bold leading-tight tracking-[-0.04em]">{design.title}</h2>
            {design.tagline && <p className="mt-2 text-lg font-medium text-brown">{design.tagline}</p>}
          </div>

          {design.status !== "DRAFT" && <ReviewPanel designId={design.id} status={design.status} nextHref={next ? `/admin/designs/${next.id}` : undefined} />}
          {design.status === "DRAFT" && <p className="rounded-lg bg-white p-5 text-sm text-muted shadow-soft">This is still a draft — the creator hasn&apos;t submitted it.</p>}

          {design.status === "APPROVED" && (
            <div className="rounded-lg bg-white p-6 shadow-soft">
              <h3 className="font-bold">Merchandising</h3>
              <p className="mb-4 mt-1 text-sm text-muted">Featured flags drive the home page drop and best sellers.</p>
              <FlagToggles designId={design.id} isNew={design.isNew} isBestSeller={design.isBestSeller} />
              <p className="mt-4 text-sm">
                <Link href={`/shop/${design.slug}`} className="font-semibold text-accent underline-offset-4 hover:underline">
                  View live page
                </Link>{" "}
                · {ordered._sum.quantity ?? 0} sold
              </p>
            </div>
          )}

          {design.rejectionReason && (
            <div className="rounded-lg border border-brown/30 bg-sand-200 p-5 text-sm">
              <p className="eyebrow text-brown">Last rejection reason</p>
              <p className="mt-2">{design.rejectionReason}</p>
            </div>
          )}

          <dl className="grid gap-4 rounded-lg border border-navy/10 bg-white p-6 text-sm">
            <div>
              <dt className="eyebrow text-muted">Description</dt>
              <dd className="mt-1">{design.description || "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted">The truth behind it</dt>
              <dd className="mt-1 text-base font-medium">{design.story || "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted">Products</dt>
              <dd className="mt-1">
                {types.length
                  ? types.map((t) => `${PRODUCT_TYPE_SPECS[t].label} (${formatPrice((design.variants.find((v) => v.productType === t)?.priceCents ?? 0) / 100, { whole: true })})`).join(" · ")
                  : "None selected"}{" "}
                · {design.variants.length} variants
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted">Creator</dt>
              <dd className="mt-1">
                {community && design.creator.username ? (
                  <Link href={`/creators/${design.creator.username}`} className="font-semibold hover:text-accent">
                    {design.creator.name} (@{design.creator.username})
                  </Link>
                ) : (
                  design.creator.name
                )}
                <span className="block text-muted">
                  {design.creator.email} · joined {design.creator.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })} · {design.creator._count.designs} design(s)
                </span>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted">Timeline</dt>
              <dd className="mt-1 text-muted">
                Created {design.createdAt.toLocaleString("en-US")}
                {design.submittedAt && <> · submitted {design.submittedAt.toLocaleString("en-US")}</>}
                {design.approvedAt && <> · approved {design.approvedAt.toLocaleString("en-US")}</>}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
