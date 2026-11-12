import { headers } from "next/headers";
import { siteConfig } from "@/lib/site";

/**
 * Absolute base URL for links in emails.
 * Production: always NEXT_PUBLIC_SITE_URL (never trust the Host header — a
 * forged header could otherwise point password-reset links at another site).
 * Development: the request host, so links work on localhost.
 */
export async function appBaseUrl(): Promise<string> {
  if (process.env.NODE_ENV === "production") return siteConfig.url;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // outside a request (scripts)
  }
  return siteConfig.url;
}
