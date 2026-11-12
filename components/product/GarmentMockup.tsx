import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductMockup, ProductTypeId } from "@/types";

/** Print area per product type, in % of the 4:5 frame. */
export const PRINT_AREAS: Record<ProductTypeId, { left: number; top: number; width: number; height: number }> = {
  TEE: { left: 32, top: 23, width: 36, height: 38 },
  HOODIE: { left: 33, top: 31, width: 34, height: 31 },
  HAT: { left: 33, top: 33, width: 34, height: 19 },
  TOTE: { left: 25, top: 32, width: 50, height: 46 },
  MUG: { left: 22, top: 30, width: 46, height: 40 },
  BOTTLE: { left: 38, top: 30, width: 24, height: 46 },
};

const LIGHT = new Set(["#FFFFFF", "#F2EDE4", "#D9C3A5", "#A4A7AB"]);

function Garment({ type, color }: { type: ProductTypeId; color: string }) {
  const stroke = LIGHT.has(color.toUpperCase()) ? "rgb(11 37 69 / 0.18)" : "rgb(255 255 255 / 0.12)";
  const shade = "url(#tp-shade)";
  const common = { fill: color, stroke, strokeWidth: 2, strokeLinejoin: "round" as const };
  switch (type) {
    case "HOODIE":
      return (
        <g>
          <path {...common} d="M128 92 L82 108 L28 300 L36 420 L82 418 L92 302 L96 455 Q200 470 304 455 L308 302 L318 418 L364 420 L372 300 L318 108 L272 92 Z" />
          <path {...common} d="M135 104 Q118 26 200 20 Q282 26 265 104 Q200 146 135 104 Z" />
          <path fill="none" stroke={stroke} strokeWidth={2} d="M158 100 Q200 128 242 100 M190 122 L186 190 M210 122 L214 190" />
          <path fill="none" stroke={stroke} strokeWidth={2} d="M136 340 L264 340 L284 412 L116 412 Z" />
          <path fill={shade} d="M128 92 L82 108 L28 300 L36 420 L82 418 L92 302 L96 455 Q200 470 304 455 L308 302 L318 418 L364 420 L372 300 L318 108 L272 92 Z" />
        </g>
      );
    case "HAT":
      return (
        <g>
          <path {...common} d="M72 302 Q66 136 200 122 Q334 136 328 302 Z" />
          <path fill="none" stroke={stroke} strokeWidth={2} d="M200 124 L200 300 M136 140 Q120 220 128 300 M264 140 Q280 220 272 300" />
          <circle cx="200" cy="124" r="7" fill={color} stroke={stroke} strokeWidth={2} />
          <path {...common} d="M44 304 Q200 274 356 304 Q372 334 340 350 Q200 324 60 350 Q28 334 44 304 Z" />
          <path fill={shade} d="M72 302 Q66 136 200 122 Q334 136 328 302 Z" />
        </g>
      );
    case "TEE":
    default:
      return (
        <g>
          <path {...common} d="M142 58 Q200 92 258 58 L332 84 L388 166 L336 198 L310 178 L310 452 Q200 466 90 452 L90 178 L64 198 L12 166 L68 84 Z" />
          <path fill="none" stroke={stroke} strokeWidth={3} d="M142 58 Q200 108 258 58" />
          <path fill={shade} d="M142 58 Q200 92 258 58 L332 84 L388 166 L336 198 L310 178 L310 452 Q200 466 90 452 L90 178 L64 198 L12 166 L68 84 Z" />
        </g>
      );
  }
}

interface GarmentMockupProps {
  type: ProductTypeId;
  color: string;
  mockup: ProductMockup;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Draw the print-area guide (studio) */
  showGuide?: boolean;
  alt?: string;
}

/**
 * Community design rendered on a drawn garment. Artwork is positioned in the
 * print area with transform only (translate + scale), same maths as the studio.
 */
export function GarmentMockup({ type, color, mockup, className, sizes = "400px", priority, showGuide, alt = "" }: GarmentMockupProps) {
  const area = PRINT_AREAS[type] ?? PRINT_AREAS.TEE;
  const svgArt = mockup.artworkUrl.toLowerCase().endsWith(".svg");
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#ffffff_0%,#ebdfcf_100%)]", className)}>
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full drop-shadow-[0_18px_24px_rgb(11_37_69/0.18)]" aria-hidden>
        <defs>
          <linearGradient id="tp-shade" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.10" />
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.14" />
          </linearGradient>
        </defs>
        <Garment type={type} color={color} />
      </svg>
      <div
        className={cn("absolute", showGuide && "outline-1 outline-dashed outline-offset-0 outline-accent/60")}
        style={{ left: `${area.left}%`, top: `${area.top}%`, width: `${area.width}%`, height: `${area.height}%` }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${mockup.x}%, ${mockup.y}%) scale(${mockup.scale})` }}
        >
          <Image
            src={mockup.artworkUrl}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={svgArt}
            className="object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
