import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { MediaReveal } from "@/components/ui/MediaReveal";
import { Reveal } from "@/components/ui/Reveal";

export function StoryTeaser() {
  return (
    <section aria-labelledby="story-title" className="bg-sand-200 py-24 sm:py-32">
      <div className="container-tp grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="relative lg:col-span-6">
          <MediaReveal
            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1400&h=1700&q=80"
            alt="The founder of TruthPitch seated on a wooden stool in the studio"
            sizes="(min-width: 1024px) 45vw, 100vw"
            parallax={8}
            className="aspect-[4/5] rounded-lg"
          />
          <div className="absolute -bottom-8 -right-2 w-[42%] rounded-lg border-[6px] border-sand-200 sm:-right-6 lg:-right-12">
            <MediaReveal
              src="https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&h=800&q=80"
              alt="Folded TruthPitch tees stacked by colour"
              sizes="(min-width: 1024px) 18vw, 40vw"
              delay={0.2}
              className="aspect-square rounded-md"
            />
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <p className="eyebrow flex items-center gap-3 text-brown">
            <span aria-hidden className="inline-block h-px w-8 bg-current" />
            The story
          </p>
          <AnimatedText
            as="h2"
            id="story-title"
            text={"Started with\none honest\nsentence."}
            className="mt-5 text-5xl font-bold leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-7xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg text-navy/80">
              TruthPitch began as a voice note: say the thing you&apos;re afraid to say, then say it better. That became a channel, then a
              community, then something you could wear.
            </p>
            <p className="mt-4 text-navy/70">
              Every design starts with a line we actually believe. If it doesn&apos;t hold up in a real conversation, it doesn&apos;t make it onto
              a shirt.
            </p>
            <div className="mt-10">
              <Button href="/about" variant="brown" size="lg" magnetic icon={<ArrowRightIcon size={18} />}>
                Read the full story
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
