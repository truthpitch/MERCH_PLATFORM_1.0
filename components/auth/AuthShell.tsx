import Image from "next/image";
import type { ReactNode } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  quote?: string;
  children: ReactNode;
}

/** Split layout for auth pages: navy manifesto panel + form. */
export function AuthShell({ eyebrow, title, description, quote = "Say the thing.\nThen wear it.", children }: AuthShellProps) {
  return (
    <section className="grid min-h-dvh lg:grid-cols-2">
      <div className="surface-dark relative hidden overflow-hidden bg-navy text-white lg:block grain">
        <Image
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&h=1800&q=75"
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="relative flex h-full flex-col justify-end p-12 pb-16 xl:p-16">
          <p className="eyebrow text-sand">The TruthPitch community</p>
          <AnimatedText
            as="p"
            text={quote}
            play
            className="mt-6 text-[clamp(3rem,5.5vw,6rem)] font-bold leading-[0.9] tracking-[-0.055em]"
          />
          <p className="mt-8 max-w-sm text-white/75">
            Design something you actually believe. We review every submission by hand — the good ones go live.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 pb-16 pt-[calc(var(--tp-nav-h)+2.5rem)] sm:px-8">
        <div className="w-full max-w-md">
          <p className="eyebrow flex items-center gap-3 text-brown">
            <span aria-hidden className="inline-block h-px w-8 bg-current" />
            {eyebrow}
          </p>
          <AnimatedText as="h1" text={title} play className="mt-4 text-5xl font-bold leading-[0.92] tracking-[-0.05em] sm:text-6xl" />
          {description && <div className="mt-4 text-muted">{description}</div>}
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
