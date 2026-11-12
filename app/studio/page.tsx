import type { Metadata } from "next";
import { PageHeader } from "@/components/shop/PageHeader";
import { DesignStudio, EMPTY_DESIGN } from "@/components/studio/DesignStudio";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Design studio",
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  await requireUser("/studio");
  return (
    <>
      <PageHeader
        eyebrow="Design studio"
        title={"Make it\nwearable."}
        highlight={["wearable."]}
        description="Upload your artwork, place it, tell us the truth behind it. Submit when it's ready — we review every design by hand."
      />
      <DesignStudio initial={EMPTY_DESIGN} />
    </>
  );
}
