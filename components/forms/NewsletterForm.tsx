"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { newsletterSchema, type NewsletterInput } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  tone?: "light" | "dark";
  className?: string;
}

export function NewsletterForm({ tone = "light", className }: NewsletterFormProps) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = async (data: NewsletterInput) => {
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const dark = tone === "dark";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("w-full", className)}>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border p-1.5 pl-5 transition-colors focus-within:border-accent",
          dark ? "border-white/25 bg-white/5" : "border-navy/20 bg-white",
          errors.email && "border-[#e5484d]",
        )}
      >
        <input
          id={id}
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={`${id}-msg`}
          className={cn(
            "h-11 min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none focus-visible:outline-none",
            dark ? "text-white placeholder:text-white/50" : "text-navy placeholder:text-muted/70",
          )}
          {...register("email", { onChange: () => status !== "idle" && setStatus("idle") })}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-60",
            dark ? "bg-sand text-navy hover:bg-white" : "bg-navy text-white hover:bg-accent",
          )}
        >
          {isSubmitting ? "Joining…" : "Join"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
      <div id={`${id}-msg`} aria-live="polite" className="mt-2 min-h-5 pl-5 text-sm">
        <AnimatePresence mode="wait">
          {errors.email ? (
            <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={dark ? "text-[#ffb4a8]" : "text-[#b42318]"}>
              {errors.email.message}
            </motion.p>
          ) : status === "done" ? (
            <motion.p key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("flex items-center gap-1.5", dark ? "text-sand" : "text-accent")}>
              <CheckIcon size={16} /> You&apos;re in. No spam — just drops and the occasional hard truth.
            </motion.p>
          ) : status === "error" ? (
            <motion.p key="fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={dark ? "text-[#ffb4a8]" : "text-[#b42318]"}>
              That didn&apos;t go through. Try again in a sec.
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
