import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/checkout", "/cart", "/dashboard", "/studio", "/admin", "/orders/", "/sign-in", "/forgot-password", "/reset-password"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
