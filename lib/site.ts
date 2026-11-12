export const siteConfig = {
  name: "TruthPitch",
  tagline: "Say it straight.",
  description:
    "TruthPitch is a personal brand built on one rule: say it straight. Heavyweight tees, hoodies and goods for people who mean what they say.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://truthpitch.com").replace(/\/$/, ""),
  email: "hello@truthpitch.com",
  socials: [
    { label: "Instagram", href: "https://instagram.com/truthpitch", handle: "@truthpitch" },
    { label: "TikTok", href: "https://tiktok.com/@truthpitch", handle: "@truthpitch" },
    { label: "YouTube", href: "https://youtube.com/@truthpitch", handle: "TruthPitch" },
    { label: "X", href: "https://x.com/truthpitch", handle: "@truthpitch" },
  ],
  nav: [
    { label: "Shop", href: "/shop" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  slogans: [
    "Say it straight",
    "Truth over comfort",
    "No filter",
    "Own your word",
    "Stand ten toes",
    "Loud & clear",
    "Steady beats loud",
  ],
} as const;

/** Feature flags — read from public env so they work on server and client. */
export const features = {
  /** Accounts + studio. On by default in Phase 2; set NEXT_PUBLIC_ENABLE_AUTH=false to hide sign-in. */
  auth: process.env.NEXT_PUBLIC_ENABLE_AUTH !== "false",
} as const;

export const FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 75) || 75;
