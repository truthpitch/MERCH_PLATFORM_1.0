import type { Metadata } from "next";
import { ScrollQuote } from "@/components/about/ScrollQuote";
import { StoryChapters } from "@/components/about/StoryChapters";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { MediaReveal } from "@/components/ui/MediaReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind TruthPitch: one rule — say it straight — and the people who live by it.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About — TruthPitch", url: "/about" },
};

const u = (id: string, w = 1200, h = 1500) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const VALUES = [
  { n: "01", title: "Clarity over cleverness", body: "If it needs explaining, it isn't finished. Every design says one thing you can repeat out loud." },
  { n: "02", title: "Kind, not soft", body: "Honesty without care is just noise. We say the hard thing the way we'd want to hear it." },
  { n: "03", title: "Built to be worn hard", body: "Heavyweight blanks, honest stitching, printed to order so nothing sits in a warehouse." },
  { n: "04", title: "Own the miss", body: "Wrong size, late parcel, bad call — we say so first and make it right. No scripts." },
];

export default function AboutPage() {
  return (
    <>
      <section aria-labelledby="about-title" className="pt-[calc(var(--tp-nav-h)+3rem)] sm:pt-[calc(var(--tp-nav-h)+4.5rem)]">
        <div className="container-tp">
          <p className="eyebrow flex items-center gap-3 text-brown">
            <span aria-hidden className="inline-block h-px w-8 bg-current" />
            About TruthPitch
          </p>
          <AnimatedText
            as="h1"
            id="about-title"
            text={"One rule.\nSay it straight."}
            play
            highlight={["straight."]}
            className="mt-5 text-[clamp(3.25rem,11vw,10.5rem)] font-bold leading-[0.86] tracking-[-0.055em]"
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.3}>
              <p className="text-xl text-navy/80">
                TruthPitch is a personal brand built by one person who got tired of hedging. It&apos;s a channel, a community, and now a set of
                things you can wear — all running on the same idea: if it&apos;s true, say it once and say it clean.
              </p>
            </Reveal>
          </div>
        </div>
        <div className="container-tp mt-14">
          <MediaReveal
            src={u("1488161628813-04466f872be2", 2000, 1100)}
            alt="The founder standing in front of a circular window, looking out over the city"
            sizes="100vw"
            priority
            play
            parallax={12}
            className="aspect-[4/5] rounded-lg sm:aspect-[16/9]"
          />
        </div>
      </section>

      <StoryChapters />

      <ScrollQuote />

      <section aria-labelledby="values-title" className="py-24 sm:py-32">
        <div className="container-tp">
          <SectionHeading id="values-title" eyebrow="What we stand on" title="Four things we won't negotiate." highlight={["won't"]} />
          <ul className="mt-14 grid gap-px overflow-hidden rounded-lg bg-navy/10 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal as="li" key={v.n} delay={i * 0.08} className="group bg-paper p-8 transition-colors duration-500 hover:bg-white sm:p-10">
                <p className="text-sm font-semibold tabular-nums text-brown">{v.n}</p>
                <h3 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{v.title}</h3>
                <p className="mt-3 max-w-md text-navy/70">{v.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="studio-title" className="bg-sand-200 py-24 sm:py-32">
        <div className="container-tp">
          <SectionHeading id="studio-title" eyebrow="Behind the scenes" title="Where the words get made." />
          {/* Photo placeholders — swap for real studio / founder photography. */}
          <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-12">
            <MediaReveal src={u("1544441893-675973e31985")} alt="Studio flat-lay of notebooks and fabric swatches" sizes="(min-width: 1024px) 40vw, 50vw" className="col-span-2 aspect-[4/3] rounded-lg lg:col-span-7" parallax={6} />
            <MediaReveal src={u("1523381210434-271e8be1f52b")} alt="Sample tees hanging on the studio rail" sizes="(min-width: 1024px) 30vw, 50vw" delay={0.1} className="aspect-[4/5] rounded-lg lg:col-span-5" />
            <MediaReveal src={u("1556905055-8f358a7a47b2")} alt="Folded hoodies and knitwear ready for a shoot" sizes="(min-width: 1024px) 30vw, 50vw" delay={0.15} className="aspect-[4/5] rounded-lg lg:col-span-5" />
            <MediaReveal src={u("1517486808906-6ca8b3f04846", 1400, 1050)} alt="The TruthPitch community gathered for a group photo" sizes="(min-width: 1024px) 40vw, 100vw" delay={0.2} className="col-span-2 aspect-[4/3] rounded-lg lg:col-span-7" parallax={6} />
          </div>
        </div>
      </section>

      <section aria-labelledby="about-cta" className="py-24 sm:py-32">
        <div className="container-tp text-center">
          <AnimatedText as="h2" id="about-cta" text={"Got something\nto say?"} className="text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.88] tracking-[-0.055em]" />
          <Reveal delay={0.2} className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/shop" size="lg" magnetic icon={<ArrowRightIcon size={18} />}>
              Wear it
            </Button>
            <Button href="/contact" size="lg" variant="outline" magnetic>
              Say it to us
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
