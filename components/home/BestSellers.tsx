import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Product } from "@/types";

export function BestSellers({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="best-sellers" className="py-24 sm:py-32">
      <div className="container-tp">
        <SectionHeading
          id="best-sellers"
          eyebrow="Best sellers"
          title="Proven in the wild."
          highlight={["wild."]}
          description="The pieces people keep coming back for. Worn hard, washed harder, still saying the same thing."
          action={
            <Button href="/shop" variant="outline" magnetic icon={<ArrowRightIcon size={18} />}>
              Shop everything
            </Button>
          }
        />
        <ul className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
