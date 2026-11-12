import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { ArrowUpRightIcon, socialIcons } from "@/components/ui/Icons";
import { siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Tees", href: "/shop?category=tees" },
      { label: "Hoodies", href: "/shop?category=hoodies" },
      { label: "Hats", href: "/shop?category=hats" },
      { label: "Accessories", href: "/shop?category=accessories" },
    ],
  },
  {
    title: "Brand",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Shipping & returns", href: "/contact#faq" },
      { label: "Cart", href: "/cart" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="surface-dark relative overflow-hidden bg-navy text-white grain">
      <div className="container-tp pt-20 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-sand">The list</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
              First to the drop. <span className="text-sand">Straight to your inbox.</span>
            </h2>
            <NewsletterForm tone="dark" className="mt-8 max-w-md" />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="eyebrow text-sand/80">{col.title}</h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-white/80 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div>
              <h3 className="eyebrow text-sand/80">Follow</h3>
              <ul className="mt-5 space-y-3">
                {siteConfig.socials.map((s) => {
                  const Icon = socialIcons[s.label];
                  return (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
                      >
                        <Icon size={16} />
                        {s.label}
                        <span className="sr-only">(opens in new tab)</span>
                        <ArrowUpRightIcon size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="container-tp mt-20 select-none" aria-hidden>
        <p className="translate-y-[0.14em] whitespace-nowrap text-center text-[clamp(4rem,19.5vw,22rem)] font-bold leading-[0.8] tracking-[-0.065em]">
          Truth<span className="text-sand">Pitch</span>
        </p>
      </div>

      <div className="relative border-t border-white/10 bg-navy">
        <div className="container-tp flex flex-col gap-3 py-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} TruthPitch. Say it straight.</p>
          <p>
            Questions?{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-white/85 underline-offset-4 hover:underline">
              {siteConfig.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
