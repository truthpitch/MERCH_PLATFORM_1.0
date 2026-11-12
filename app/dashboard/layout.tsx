import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Avatar } from "@/components/layout/AccountMenu";
import { SubNav } from "@/components/dashboard/SubNav";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/Icons";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s — Dashboard — TruthPitch" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/dashboard");
  const first = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="pb-24 pt-[calc(var(--tp-nav-h)+2.5rem)] sm:pt-[calc(var(--tp-nav-h)+3.5rem)]">
      <header className="container-tp">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar user={user} size={64} className="hidden sm:inline-flex" />
            <div>
              <p className="eyebrow text-brown">{user.username ? `@${user.username}` : "Your account"}</p>
              <h1 className="mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.05em]">Hey, {first}.</h1>
            </div>
          </div>
          <Button href="/studio" magnetic icon={<PlusIcon size={18} />}>
            New design
          </Button>
        </div>
        <div className="mt-10">
          <SubNav
            label="Dashboard"
            layoutId="dash-tab"
            items={[
              { label: "My designs", href: "/dashboard" },
              { label: "My orders", href: "/dashboard/orders" },
              { label: "Settings", href: "/dashboard/settings" },
            ]}
          />
        </div>
      </header>
      <div className="container-tp mt-10">{children}</div>
    </div>
  );
}
