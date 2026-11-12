import Image from "next/image";
import { InstagramIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=1000&q=75`;

// Placeholder community posts — Phase 2: pull from Instagram API or a UGC table.
const POSTS = [
  { src: u("1529156069898-49953e39b3ac"), alt: "Friends sitting together arm in arm, looking out at the city", handle: "@maya.speaks", span: "row-span-2" },
  { src: u("1503342217505-b0a15ec3261c"), alt: "Community member in a black TruthPitch tee against a pink wall", handle: "@jordanfromthe6", span: "" },
  { src: u("1492684223066-81342ee5ff30"), alt: "Crowd at a TruthPitch live event under falling confetti", handle: "@truthpitch", span: "" },
  { src: u("1517841905240-472988babdf9"), alt: "Community member in a hoodie and denim jacket, smiling", handle: "@ellie.writes", span: "row-span-2" },
  { src: u("1522202176988-66273c2fd55f"), alt: "Group working together around a table with laptops", handle: "@buildclub", span: "" },
  { src: u("1475721027785-f74eccf877e2"), alt: "Microphone on stage before a talk", handle: "@truthpitch", span: "" },
];

export function Community() {
  const instagram = siteConfig.socials.find((s) => s.label === "Instagram")!;
  return (
    <section aria-labelledby="community-title" className="py-24 sm:py-32">
      <div className="container-tp">
        <SectionHeading
          id="community-title"
          eyebrow="#SayItStraight"
          title="Worn by people who mean it."
          highlight={["mean", "it."]}
          description="Tag @truthpitch and #SayItStraight. We feature the real ones here every month."
          action={
            <a
              href={instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-navy/40 pb-1 font-semibold hover:border-navy"
            >
              <InstagramIcon size={18} /> Follow {instagram.handle}
              <span className="sr-only">(opens in new tab)</span>
            </a>
          }
        />
        <ul className="mt-14 grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] sm:gap-4 lg:auto-rows-[14rem] lg:grid-cols-4">
          {POSTS.map((p, i) => (
            <Reveal as="li" key={i} delay={(i % 4) * 0.08} className={cn("relative", p.span)}>
              <a
                href={instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Follow"
                className="group relative block h-full overflow-hidden rounded-lg bg-sand-200"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-[1.2s] ease-[var(--tp-ease-out)] group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center gap-2 bg-gradient-to-t from-navy/80 to-transparent p-4 text-sm font-semibold text-white opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <InstagramIcon size={16} /> {p.handle}
                </span>
                <span className="sr-only">(opens Instagram in a new tab)</span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
