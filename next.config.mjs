// Plain JavaScript (not next.config.ts) on purpose: Hostinger's build servers
// run an older glibc, so Next.js falls back to its WebAssembly compiler, which
// cannot transpile a TypeScript config file.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Database drivers stay as runtime requires (loaded by lib/db.ts).
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "mariadb", "@prisma/adapter-mariadb"],
  images: {
    // Local images next/image may optimise: user uploads (served from UPLOAD_DIR).
    localPatterns: [{ pathname: "/uploads/**" }, { pathname: "/seed-art/**" }],
    // Next.js 16 requires an explicit allowlist of qualities.
    qualities: [60, 75, 90],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      // Phase 2: add your CDN / storage bucket for user-submitted designs here,
      // e.g. { protocol: "https", hostname: "cdn.truthpitch.com" }
    ],
  },
};

export default nextConfig;
