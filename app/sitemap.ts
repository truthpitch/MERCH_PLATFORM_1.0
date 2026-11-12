import type { MetadataRoute } from "next";
import { getMarketplaceCreators, getProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";

// Reads live catalog data from the database.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, creators] = await Promise.all([getProducts(), getMarketplaceCreators()]);
  const pages = ["/", "/shop", "/marketplace", "/about", "/contact", "/sign-up"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...products.map((p) => ({
      url: absoluteUrl(`/shop/${p.slug}`),
      lastModified: new Date(p.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...creators.map((c) => ({
      url: absoluteUrl(`/creators/${c.username}`),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
