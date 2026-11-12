import { siteConfig } from "@/lib/site";
import type { Product } from "@/types";

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.svg"),
    slogan: siteConfig.tagline,
    email: siteConfig.email,
    sameAs: siteConfig.socials.map((s) => s.href),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/shop/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    image: product.images.map((i) => (i.src.startsWith("/") ? absoluteUrl(i.src) : i.src)),
    url,
    brand: { "@type": "Brand", name: siteConfig.name },
    ...(product.isCommunity && { creator: { "@type": "Person", name: product.designer.name } }),
    category: product.category,
    color: product.colors.map((c) => c.name).join(", "),
    ...(product.sizes[0] !== "One Size" && { size: product.sizes.join(", ") }),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: siteConfig.name },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
