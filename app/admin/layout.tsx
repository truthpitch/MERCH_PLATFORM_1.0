import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SubNav } from "@/components/dashboard/SubNav";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin — TruthPitch" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Non-admins get a 404; every admin page and action re-checks on its own too.
  await requireAdmin();
  const pending = await db.design.count({ where: { status: "PENDING" } });

  return (
    <div className="pb-24 pt-[calc(var(--tp-nav-h)+2.5rem)] sm:pt-[calc(var(--tp-nav-h)+3.5rem)]">
      <header className="container-tp">
        <p className="eyebrow flex items-center gap-3 text-brown">
          <span aria-hidden className="inline-block h-px w-8 bg-current" />
          Admin
        </p>
        <h1 className="mt-3 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.05em]">Keep it curated.</h1>
        <div className="mt-8">
          <SubNav
            label="Admin"
            layoutId="admin-tab"
            items={[
              { label: "Overview", href: "/admin" },
              { label: "Review queue", href: "/admin/designs", count: pending },
              { label: "Orders", href: "/admin/orders" },
              { label: "Users", href: "/admin/users" },
            ]}
          />
        </div>
      </header>
      <div className="container-tp mt-10">{children}</div>
    </div>
  );
}
