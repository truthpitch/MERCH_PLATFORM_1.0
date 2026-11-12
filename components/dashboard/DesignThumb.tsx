import Image from "next/image";
import { GarmentMockup } from "@/components/product/GarmentMockup";
import { PRODUCT_TYPE_SPECS } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { ProductTypeId } from "@/types";

interface DesignThumbProps {
  imageUrl: string;
  type?: ProductTypeId | null;
  placement: { x: number; y: number; scale: number };
  community: boolean;
  className?: string;
  sizes?: string;
  alt?: string;
}

/** Small preview: garment mockup for community artwork, photo for TruthPitch products. */
export function DesignThumb({ imageUrl, type, placement, community, className, sizes = "160px", alt = "" }: DesignThumbProps) {
  if (!imageUrl) {
    return <div className={cn("flex aspect-[4/5] items-center justify-center bg-sand-200 text-xs text-muted", className)}>No artwork</div>;
  }
  if (community) {
    const t = type ?? "TEE";
    return (
      <GarmentMockup
        type={t}
        color={PRODUCT_TYPE_SPECS[t].colors[0].hex}
        mockup={{ artworkUrl: imageUrl, ...placement }}
        sizes={sizes}
        alt={alt}
        className={className}
      />
    );
  }
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden bg-sand-200", className)}>
      <Image src={imageUrl} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
