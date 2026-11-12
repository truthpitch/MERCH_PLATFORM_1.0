/**
 * Mock product catalog — Phase 1 only.
 *
 * DO NOT import this file from pages or components. Go through
 * `lib/products.ts` so the source can switch to a database in Phase 2.
 */
import type { Designer, Product, ProductColor, ProductImage, ProductSize } from "@/types";

export const TRUTHPITCH_DESIGNER: Designer = { id: "truthpitch", name: "TruthPitch" };

const img = (id: string, alt: string): ProductImage => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1500&q=80`,
  alt,
  width: 1200,
  height: 1500,
});

const C = {
  white: { name: "White", hex: "#FFFFFF" },
  bone: { name: "Bone", hex: "#F2EDE4" },
  black: { name: "Black", hex: "#141414" },
  navy: { name: "Deep Navy", hex: "#0B2545" },
  blue: { name: "Signal Blue", hex: "#1E5AA8" },
  sand: { name: "Sand", hex: "#D9C3A5" },
  clay: { name: "Clay", hex: "#8B5E3C" },
  grey: { name: "Heather Grey", hex: "#A4A7AB" },
  orange: { name: "Burnt Orange", hex: "#C2571A" },
  sage: { name: "Sage", hex: "#7C8F7A" },
} satisfies Record<string, ProductColor>;

const APPAREL: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL"];
const ONE: ProductSize[] = ["One Size"];

type Seed = Omit<Product, "currency" | "designer" | "status"> & Partial<Pick<Product, "designer" | "status">>;

const seeds: Seed[] = [
  {
    id: "tp-001",
    slug: "say-it-straight-tee",
    name: "Say It Straight Tee",
    tagline: "The one that started it.",
    price: 38,
    category: "tees",
    colors: [C.white, C.navy, C.black],
    sizes: APPAREL,
    description:
      "Heavyweight 240gsm cotton, boxy fit, dropped shoulder. Front chest hit, full manifesto on the back. Built to be worn hard and washed harder.",
    story:
      "Most people soften the message until it means nothing. This tee is the reminder: say the thing, say it once, say it clean. No disclaimers, no hedging. If it's true, it doesn't need decoration.",
    details: ["240gsm 100% combed cotton", "Boxy, dropped-shoulder fit", "Screen-printed front and back", "Pre-shrunk. Wash cold, hang dry."],
    images: [
      img("1521572163474-6864f9cf17ab", "Model wearing the white Say It Straight tee, front view"),
      img("1622445275463-afa2ab738c34", "Say It Straight tee worn outdoors, relaxed fit"),
      img("1581655353564-df123a1eb820", "Say It Straight tee hanging on a concrete wall"),
    ],
    isNew: true,
    isBestSeller: true,
    tags: ["core", "manifesto"],
    createdAt: "2026-10-28",
  },
  {
    id: "tp-002",
    slug: "no-filter-heavyweight-tee",
    name: "No Filter Heavyweight Tee",
    tagline: "Unedited. Uncut. Unbothered.",
    price: 42,
    category: "tees",
    colors: [C.black, C.navy],
    sizes: APPAREL,
    description:
      "Our heaviest tee. Thick collar that holds its shape, a cut that sits right, and a tonal back print you only notice up close.",
    story:
      "Filters make everything look the same. This design is a refusal to sand the edges off who you are. Show up as is — the right people will recognise it.",
    details: ["280gsm organic cotton", "Rib collar, double-needle hems", "Tonal puff-print back graphic", "Made to order"],
    images: [
      img("1583743814966-8936f5b7be1a", "Black No Filter tee on a wooden hanger"),
      img("1618517351616-38fb9c5210c6", "Model in the black No Filter tee outdoors"),
      img("1503341504253-dff4815485f1", "No Filter tee styled with black jeans"),
    ],
    isNew: false,
    isBestSeller: true,
    tags: ["core"],
    createdAt: "2026-06-04",
  },
  {
    id: "tp-003",
    slug: "truth-over-comfort-tee",
    name: "Truth Over Comfort Tee",
    tagline: "Pick one. We picked.",
    price: 38,
    category: "tees",
    colors: [C.black, C.bone, C.clay],
    sizes: APPAREL,
    description:
      "Classic fit, soft hand, small circular emblem on the chest. Quiet on the front, loud in meaning.",
    story:
      "Comfortable lies are easy. Uncomfortable truths build things. This one's for anyone who chose the hard conversation and came out better for it.",
    details: ["200gsm ring-spun cotton", "Classic fit", "Embroidered chest emblem", "Wash cold, tumble low"],
    images: [
      img("1618354691373-d851c5c3a990", "Truth Over Comfort tee in black with chest emblem"),
      img("1503342217505-b0a15ec3261c", "Model wearing the Truth Over Comfort tee against a pink wall"),
      img("1562157873-818bc0726f68", "Folded Truth Over Comfort tees in several colours"),
    ],
    isNew: false,
    isBestSeller: false,
    tags: ["core"],
    createdAt: "2026-04-12",
  },
  {
    id: "tp-004",
    slug: "loud-and-clear-graphic-tee",
    name: "Loud & Clear Graphic Tee",
    tagline: "Volume up. Message intact.",
    price: 44,
    compareAtPrice: 52,
    category: "tees",
    colors: [C.orange, C.white, C.sage],
    sizes: APPAREL,
    description:
      "Oversized graphic tee with a full-front print in our Drop 04 type treatment. Statement piece, everyday weight.",
    story:
      "Being heard isn't about being the loudest. It's about being clear. This graphic stacks the words until they can't be misread.",
    details: ["220gsm cotton", "Oversized fit — size down for regular", "Water-based full-front print", "Limited run"],
    images: [
      img("1529139574466-a303027c1d8b", "Model in a bold Loud & Clear graphic tee"),
      img("1586790170083-2f9ceadc732d", "Loud & Clear graphic tee worn with a relaxed fit"),
      img("1523381210434-271e8be1f52b", "Loud & Clear tees hanging on a rail"),
    ],
    isNew: true,
    isBestSeller: false,
    tags: ["drop-04", "graphic"],
    createdAt: "2026-11-01",
  },
  {
    id: "tp-005",
    slug: "pitch-black-hoodie",
    name: "Pitch Black Hoodie",
    tagline: "Heavy, warm, no apologies.",
    price: 88,
    category: "hoodies",
    colors: [C.black, C.navy],
    sizes: APPAREL,
    description:
      "450gsm brushed fleece, double-lined hood, kangaroo pocket. Small chest wordmark, long-form manifesto down the sleeve.",
    story:
      "Named for the moment before you speak up — when it's dark and you're not sure anyone will back you. Wear it like armour. Speak anyway.",
    details: ["450gsm brushed-back fleece", "Double-layer hood, no drawcords", "Sleeve print + chest embroidery", "Relaxed fit"],
    images: [
      img("1578681994506-b8f463449011", "Model in the Pitch Black hoodie with a bucket hat"),
      img("1556821840-3a63f95609a7", "Pitch Black hoodie back view, hood up, outdoors"),
    ],
    isNew: true,
    isBestSeller: true,
    tags: ["drop-04", "fleece"],
    createdAt: "2026-10-30",
  },
  {
    id: "tp-006",
    slug: "ground-level-hoodie",
    name: "Ground Level Hoodie",
    tagline: "Stand ten toes down.",
    price: 92,
    category: "hoodies",
    colors: [C.orange, C.clay, C.sand],
    sizes: APPAREL,
    description:
      "Garment-dyed heavyweight hoodie with a lived-in feel from day one. Raw-edge back panel print.",
    story:
      "Ground level is where the real work happens. No stage, no spotlight — just you holding a position because it's right. This colourway is for the ones who don't move.",
    details: ["420gsm garment-dyed fleece", "Raw-edge appliqué back panel", "Ribbed cuffs and hem", "Each piece varies slightly in tone"],
    images: [
      img("1509942774463-acf339cf87d5", "Model in the Burnt Orange Ground Level hoodie"),
      img("1556905055-8f358a7a47b2", "Ground Level hoodie styled flat with knitwear and denim"),
    ],
    isNew: true,
    isBestSeller: false,
    tags: ["drop-04", "fleece"],
    createdAt: "2026-11-05",
  },
  {
    id: "tp-007",
    slug: "own-your-word-crewneck",
    name: "Own Your Word Crewneck",
    tagline: "Say it. Mean it. Keep it.",
    price: 74,
    category: "hoodies",
    colors: [C.white, C.grey, C.navy],
    sizes: APPAREL,
    description:
      "Midweight crewneck sweatshirt with a clean embroidered statement across the chest. Layer it or wear it solo.",
    story:
      "Your word is the only currency that never inflates. Keep it, and people trust you with everything else.",
    details: ["340gsm loopback cotton", "Tonal chest embroidery", "Ribbed collar, cuffs and hem", "Regular fit"],
    images: [
      img("1620799140408-edc6dcb6d633", "White Own Your Word crewneck laid flat"),
      img("1516826957135-700dedea698c", "Model wearing the Own Your Word crewneck"),
    ],
    isNew: false,
    isBestSeller: true,
    tags: ["core"],
    createdAt: "2026-03-18",
  },
  {
    id: "tp-008",
    slug: "straight-talk-dad-cap",
    name: "Straight Talk Dad Cap",
    tagline: "Low profile. High conviction.",
    price: 32,
    category: "hats",
    colors: [C.sand, C.navy, C.black],
    sizes: ONE,
    description:
      "Unstructured six-panel cap in washed cotton twill with a small embroidered TP mark and brass buckle strap.",
    story:
      "Straight talk doesn't need a big logo. A small mark, worn every day, says more than a billboard ever could.",
    details: ["100% washed cotton twill", "Unstructured, low profile", "Adjustable brass buckle", "Embroidered front mark"],
    images: [
      img("1575428652377-a2d80e2277fc", "Sand Straight Talk dad cap worn against a yellow wall"),
      img("1564859228273-274232fdb516", "Straight Talk cap worn backwards with a white tee"),
    ],
    isNew: false,
    isBestSeller: true,
    tags: ["headwear"],
    createdAt: "2026-02-09",
  },
  {
    id: "tp-009",
    slug: "signal-trucker-cap",
    name: "Signal Trucker Cap",
    tagline: "Cut through the noise.",
    price: 34,
    category: "hats",
    colors: [C.white, C.grey],
    sizes: ONE,
    description:
      "Structured foam-front trucker with mesh back and a woven Signal patch. Snapback closure.",
    story:
      "There's a lot of noise out there. Be the signal — the one clear thing people can find in the static.",
    details: ["Foam front, polyester mesh back", "Woven front patch", "Plastic snapback", "Mid-high crown"],
    images: [
      img("1588850561407-ed78c282e89b", "White Signal trucker cap on a plain background"),
      img("1521369909029-2afed882baee", "Washed grey Signal cap, side profile"),
    ],
    isNew: true,
    isBestSeller: false,
    tags: ["headwear", "drop-04"],
    createdAt: "2026-10-22",
  },
  {
    id: "tp-010",
    slug: "manifesto-tote",
    name: "Manifesto Tote",
    tagline: "Carry the message.",
    price: 28,
    category: "accessories",
    colors: [C.sand, C.bone],
    sizes: ONE,
    description:
      "Heavy canvas tote with the full TruthPitch manifesto printed on one side. Long handles, inner pocket.",
    story:
      "The whole manifesto, unabridged, on something you'll actually use every day. Groceries, gym kit, laptop — the message goes where you go.",
    details: ["16oz natural cotton canvas", "Reinforced 28\" handles", "Inner zip pocket", "38 × 42 cm"],
    images: [
      img("1544816155-12df9643f363", "Manifesto canvas tote hanging on a white wall"),
      img("1490481651871-ab68de25d43d", "Manifesto tote alongside a rail of TruthPitch clothing"),
    ],
    isNew: false,
    isBestSeller: true,
    tags: ["carry"],
    createdAt: "2026-01-20",
  },
  {
    id: "tp-011",
    slug: "hard-truth-mug",
    name: "Hard Truth Mug",
    tagline: "Coffee first. Then honesty.",
    price: 22,
    category: "accessories",
    colors: [C.white, C.navy],
    sizes: ONE,
    description:
      "Ceramic 12oz mug with a matte glaze and a wraparound statement. Dishwasher and microwave safe.",
    story:
      "Every good conversation starts somewhere. Ours start with coffee and the stuff nobody else wants to say out loud.",
    details: ["12oz / 350ml ceramic", "Matte exterior glaze", "Dishwasher & microwave safe", "Printed wraparound text"],
    images: [
      img("1514228742587-6b1558fcca3d", "White Hard Truth ceramic mug on a white surface"),
      img("1434389677669-e08b4cac3105", "Hard Truth mug in a morning flat-lay"),
    ],
    isNew: false,
    isBestSeller: false,
    tags: ["home"],
    createdAt: "2025-12-02",
  },
  {
    id: "tp-012",
    slug: "steady-insulated-bottle",
    name: "Steady Insulated Bottle",
    tagline: "Stay cold. Stay steady.",
    price: 36,
    category: "accessories",
    colors: [C.sage, C.navy, C.black],
    sizes: ONE,
    description:
      "Double-wall stainless bottle that keeps drinks cold for 24 hours. Laser-etched TP mark, powder-coat finish.",
    story:
      "Steady beats loud. The people who win long-term are the ones who keep showing up the same way, day after day.",
    details: ["500ml / 17oz", "Double-wall vacuum insulation", "Powder-coat grip finish", "Laser-etched mark"],
    images: [
      img("1602143407151-7111542de6e8", "Sage green Steady insulated bottle"),
      img("1553062407-98eeb64c6a62", "Steady bottle packed with a navy backpack"),
    ],
    isNew: false,
    isBestSeller: false,
    tags: ["carry"],
    createdAt: "2026-05-15",
  },
];

export const products: Product[] = seeds.map((s) => ({
  ...s,
  currency: "USD",
  designer: s.designer ?? TRUTHPITCH_DESIGNER,
  status: s.status ?? "approved",
}));
