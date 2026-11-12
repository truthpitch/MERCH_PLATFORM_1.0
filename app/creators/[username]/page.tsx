import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Avatar } from "@/components/layout/AccountMenu";
import { ProductCard } from "@/components/product/ProductCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { db } from "@/lib/db";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const getCreator = cache(async (username: string) =>
  db.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, name: true, username: true, bio: true, image: true, role: true, createdAt: true },
  }),
);

export async function generateMetadata({ params }: PageProps<"/creators/[username]">): Promise<Metadata> {
  const { username } = await params;
  const creator = await getCreator(username);
  if (!creator || creator.role === "ADMIN") return { title: "Creator not found" };
  const name = creator.name ?? `@${creator.username}`;
  return {
    title: `${name} (@${creator.username})`,
    description: creator.bio ?? `Approved TruthPitch designs by ${name}.`,
    alternates: { canonical: `/creators/${creator.username}` },
  };
}

export default async function CreatorPage({ params }: PageProps<"/creators/[username]">) {
  const { username } = await params;
  const creator = await getCreator(username);
  // The admin account is "TruthPitch" itself — send people to the shop instead.
  if (!creator || creator.role === "ADMIN") notFound();

  const designs = await getProducts({ community: true, creatorUsername: creator.username!, sort: "newest" });
  const name = creator.name ?? `@${creator.username}`;
  const sold = designs.reduce((n, d) => n + d.unitsSold, 0);

  return (
    <>
      <header className="container-tp pb-12 pt-[calc(var(--tp-nav-h)+3rem)] sm:pt-[calc(var(--tp-nav-h)+4.5rem)]">
        <p className="eyebrow flex items-center gap-3 text-brown">
          <span aria-hidden className="inline-block h-px w-8 bg-current" />
          Creator
        </p>
        <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-6">
            <Avatar user={{ name: creator.name, email: creator.username ?? "", image: creator.image }} size={96} className="ring-4 ring-white" />
            <div>
              <AnimatedText as="h1" text={name} play className="text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.88] tracking-[-0.055em]" />
              <p className="mt-2 text-lg font-medium text-muted">@{creator.username}</p>
            </div>
          </div>
          <dl className="flex gap-8">
            <div>
              <dt className="text-sm text-muted">Live designs</dt>
              <dd className="text-3xl font-bold tabular-nums">{designs.length}</dd>
            </div>
            {sold > 0 && (
              <div>
                <dt className="text-sm text-muted">Pieces sold</dt>
                <dd className="text-3xl font-bold tabular-nums">{sold}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted">Since</dt>
              <dd className="text-3xl font-bold tabular-nums">{creator.createdAt.getFullYear()}</dd>
            </div>
          </dl>
        </div>
        {creator.bio && <p className="mt-8 max-w-2xl text-xl text-navy/80">{creator.bio}</p>}
      </header>

      <section aria-label={`Designs by ${name}`} className="container-tp pb-24 sm:pb-32">
        {designs.length ? (
          <ul className="grid grid-cols-1 gap-x-6 gap-y-12 border-t border-navy/10 pt-12 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {designs.map((p, i) => (
              <Reveal as="li" key={p.id} delay={Math.min(i, 8) * 0.06}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-navy/20 px-6 py-20 text-center">
            <p className="text-3xl font-bold tracking-tight">Nothing live yet.</p>
            <p className="mx-auto mt-3 max-w-md text-muted">{name} is working on it. Good things take an honest minute.</p>
            <Button href="/marketplace" variant="outline" className="mt-8">
              Browse the marketplace
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
