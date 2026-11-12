import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shop/PageHeader";
import { DesignStudio, type StudioInitial } from "@/components/studio/DesignStudio";
import { Button } from "@/components/ui/Button";
import { STUDIO_PRODUCT_TYPES, type StudioProductType } from "@/lib/catalog";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Edit design",
  robots: { index: false, follow: false },
};

export default async function EditDesignPage({ params }: PageProps<"/studio/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/studio/${id}`);
  const design = await db.design.findUnique({
    where: { id },
    include: { variants: { select: { productType: true }, distinct: ["productType"] } },
  });
  // Someone else's design looks exactly like a missing one.
  if (!design || design.creatorId !== user.id) notFound();

  if (design.status === "APPROVED") {
    return (
      <>
        <PageHeader eyebrow="Design studio" title={"It's live."} description="Approved designs are locked so orders always match what people bought. Need a change? Get in touch." />
        <div className="container-tp flex flex-wrap gap-3 pb-24">
          <Button href={`/shop/${design.slug}`}>See it live</Button>
          <Button href="/dashboard" variant="outline">
            Back to dashboard
          </Button>
        </div>
      </>
    );
  }

  const types = design.variants.map((v) => v.productType).filter((t): t is StudioProductType => (STUDIO_PRODUCT_TYPES as readonly string[]).includes(t));
  const initial: StudioInitial = {
    id: design.id,
    title: design.title,
    tagline: design.tagline ?? "",
    description: design.description,
    story: design.story,
    imageKey: design.imageKey ?? "",
    imageUrl: design.imageKey ? design.imageUrl : "",
    productTypes: types,
    placementX: design.placementX,
    placementY: design.placementY,
    placementScale: design.placementScale,
    status: design.status as StudioInitial["status"],
    rejectionReason: design.rejectionReason,
  };

  return (
    <>
      <PageHeader eyebrow="Design studio" title={design.title || "Untitled"} description="Keep refining. Save a draft any time, submit when it says exactly what you mean." />
      <DesignStudio initial={initial} />
    </>
  );
}
