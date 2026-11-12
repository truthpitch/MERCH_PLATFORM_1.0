import { cn } from "@/lib/utils";

/** Text wordmark: "Truth" in weight 700, "Pitch" accented. */
export function Wordmark({ className, accent = "text-accent" }: { className?: string; accent?: string }) {
  return (
    <span className={cn("font-bold tracking-[-0.045em]", className)}>
      Truth<span className={accent}>Pitch</span>
    </span>
  );
}
