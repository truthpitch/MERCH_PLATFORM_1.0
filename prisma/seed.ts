/**
 * Seed script — safe to run on every deploy (idempotent).
 *
 *  1. Ensures the admin user exists (ADMIN_EMAIL / ADMIN_PASSWORD).
 *  2. Migrates the Phase 1 catalog (data/products.ts) into Designs owned by
 *     the admin, status APPROVED, with their photos and variants.
 *  3. Optionally (SEED_DEMO_CONTENT=true) adds demo creators + community
 *     designs so the marketplace and admin queue aren't empty.
 *
 * Existing rows are never overwritten, so edits made in the app survive.
 *
 * Run: npm run db:seed
 */
import { products as phase1 } from "../data/products";
import { catalogVariants, sku, typeForPhase1, type ProductTypeId } from "../lib/catalog";
import { db } from "../lib/db";
import { hashPassword, randomToken } from "../lib/password";

const toCents = (n: number) => Math.round(n * 100);

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@truthpitch.com").toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") await db.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    console.log(`✓ admin exists: ${email}`);
    return existing.id;
  }
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = randomToken(12);
    console.log(`! ADMIN_PASSWORD not set — generated one-time password for ${email}: ${password}`);
    console.log("  Sign in and change it from /dashboard/settings.");
  }
  const admin = await db.user.create({
    data: {
      email,
      name: "TruthPitch",
      username: "truthpitch",
      role: "ADMIN",
      passwordHash: await hashPassword(password),
      emailVerified: new Date(),
    },
  });
  console.log(`✓ created admin: ${email}`);
  return admin.id;
}

async function seedPhase1(adminId: string) {
  let created = 0;
  for (const p of phase1) {
    const exists = await db.design.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (exists) continue;
    const type: ProductTypeId = typeForPhase1(p.category, p.slug);
    await db.design.create({
      data: {
        id: p.id,
        title: p.name,
        slug: p.slug,
        tagline: p.tagline,
        description: p.description,
        story: p.story,
        details: p.details.join("\n"),
        imageUrl: p.images[0].src,
        status: "APPROVED",
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        creatorId: adminId,
        createdAt: new Date(p.createdAt),
        submittedAt: new Date(p.createdAt),
        approvedAt: new Date(p.createdAt),
        images: {
          create: p.images.map((img, i) => ({ url: img.src, alt: img.alt, width: img.width, height: img.height, position: i })),
        },
        variants: {
          create: p.colors.flatMap((color) =>
            p.sizes.map((size) => ({
              productType: type,
              size,
              colorName: color.name,
              colorHex: color.hex,
              priceCents: toCents(p.price),
              compareAtCents: p.compareAtPrice ? toCents(p.compareAtPrice) : null,
              sku: sku(p.id, type, size, color.name),
            })),
          ),
        },
      },
    });
    created += 1;
  }
  console.log(`✓ Phase 1 catalog: ${created} created, ${phase1.length - created} already present`);
}

const DEMO_CREATORS = [
  { email: "maya@demo.truthpitch.test", name: "Maya Okafor", username: "maya", bio: "Writer. Says the quiet part out loud, kindly." },
  { email: "jordan@demo.truthpitch.test", name: "Jordan Reyes", username: "jordanreyes", bio: "Designer and coach. Clear beats clever." },
];

const DEMO_DESIGNS: {
  slug: string;
  title: string;
  creator: string;
  art: string;
  types: ProductTypeId[];
  status: "APPROVED" | "PENDING" | "REJECTED";
  tagline: string;
  description: string;
  story: string;
  placement?: { x: number; y: number; scale: number };
  rejectionReason?: string;
}[] = [
  {
    slug: "quiet-work-loud",
    title: "Quiet Work, Loud Results",
    creator: "maya",
    art: "/seed-art/quiet-loud.svg",
    types: ["TEE", "HOODIE"],
    status: "APPROVED",
    tagline: "Do the work. Let it talk.",
    description: "Stacked type in signal blue and sand. Big on the chest, nothing extra.",
    story: "Most of the work that matters happens where nobody claps. This is for the people who keep going anyway — the results are loud enough.",
  },
  {
    slug: "no-cap-seal",
    title: "No Cap Seal",
    creator: "jordanreyes",
    art: "/seed-art/no-cap.svg",
    types: ["TEE", "HAT", "HOODIE"],
    status: "APPROVED",
    tagline: "Certified honest.",
    description: "A badge-style seal for people who don't exaggerate.",
    story: "I got tired of everything being 'the best ever'. This seal is a promise: what I tell you is the real size of it.",
    placement: { x: 0, y: -4, scale: 0.85 },
  },
  {
    slug: "honest-hours",
    title: "Honest Hours",
    creator: "maya",
    art: "/seed-art/honest-hours.svg",
    types: ["TEE"],
    status: "PENDING",
    tagline: "No shortcuts.",
    description: "Editorial type for the long-haul crowd.",
    story: "There's no hack for showing up. Just honest hours, stacked.",
  },
  {
    slug: "have-the-hard-talk",
    title: "Have the Hard Talk",
    creator: "jordanreyes",
    art: "/seed-art/hard-conversations.svg",
    types: ["HOODIE"],
    status: "REJECTED",
    tagline: "Say it now.",
    description: "Speech bubble line art.",
    story: "Every relationship I've saved started with a conversation I didn't want to have.",
    rejectionReason: "Love the message. The white line art disappears on light colours — send a version with a dark outline and we'll approve it.",
  },
];

async function seedDemo() {
  const ids = new Map<string, string>();
  for (const c of DEMO_CREATORS) {
    const user = await db.user.upsert({
      where: { email: c.email },
      update: {},
      create: { ...c, role: "USER", passwordHash: await hashPassword("demo-password-123"), emailVerified: new Date() },
    });
    ids.set(c.username, user.id);
  }
  let created = 0;
  for (const d of DEMO_DESIGNS) {
    if (await db.design.findUnique({ where: { slug: d.slug }, select: { id: true } })) continue;
    const now = new Date();
    const design = await db.design.create({
      data: {
        slug: d.slug,
        title: d.title,
        tagline: d.tagline,
        description: d.description,
        story: d.story,
        imageUrl: d.art,
        placementX: d.placement?.x ?? 0,
        placementY: d.placement?.y ?? 0,
        placementScale: d.placement?.scale ?? 1,
        status: d.status,
        rejectionReason: d.rejectionReason,
        creatorId: ids.get(d.creator)!,
        submittedAt: now,
        approvedAt: d.status === "APPROVED" ? now : null,
      },
    });
    await db.productVariant.createMany({ data: catalogVariants(design.id, d.types).map((v) => ({ ...v, designId: design.id })) });
    created += 1;
  }
  console.log(`✓ demo content: ${DEMO_CREATORS.length} creators, ${created} new designs (password for demo users: demo-password-123)`);
}

async function main() {
  const adminId = await ensureAdmin();
  await seedPhase1(adminId);
  if (process.env.SEED_DEMO_CONTENT === "true") await seedDemo();
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
