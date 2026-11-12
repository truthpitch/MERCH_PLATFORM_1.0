import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { PageHeader } from "@/components/shop/PageHeader";
import { ShopView } from "@/components/shop/ShopView";
import { getFilterOptions, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Heavyweight tees, hoodies, hats and goods from TruthPitch. Every design says one thing, clearly.",
  alternates: { canonical: "/shop" },
  openGraph: { title: "Shop — TruthPitch", url: "/shop" },
};

export default async function ShopPage() {
  const [products, options] = await Promise.all([getProducts(), getFilterOptions()]);

  return (
    <>
      <PageHeader
        eyebrow={`${products.length} pieces · Printed to order`}
        title={"Wear what\nyou mean."}
        highlight={["mean."]}
        description="Every piece starts with a sentence we actually believe. Pick yours."
      />
      <Suspense
        fallback={
          <div className="container-tp pb-24">
            <ul className="mt-24 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 xl:grid-cols-3 lg:ml-[18rem]">
              {products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <ShopView products={products} options={options} />
      </Suspense>
    </>
  );
}
