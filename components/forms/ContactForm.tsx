"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { EASE_OUT } from "@/lib/motion";
import { contactFormSchema, type ContactFormInput } from "@/lib/schemas";

const TOPICS = [
  { value: "order", label: "An order" },
  { value: "sizing", label: "Sizing & fit" },
  { value: "collab", label: "Collab / partnership" },
  { value: "press", label: "Press" },
  { value: "other", label: "Something else" },
];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", topic: undefined, orderNumber: "", message: "" },
  });
  const topic = useWatch({ control, name: "topic" });
  const message = useWatch({ control, name: "message" }) ?? "";

  const onSubmit = async (data: ContactFormInput) => {
    setFailed(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      reset();
    } catch {
      setFailed(true);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div
          key="sent"
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="rounded-lg bg-white p-8 shadow-soft sm:p-10"
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
            <CheckIcon size={28} />
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Got it. Straight to the inbox.</h2>
          <p className="mt-3 text-muted">A real person reads every message. Expect a reply within two business days.</p>
          <Button className="mt-8" variant="outline" onClick={() => setSent(false)}>
            Send another
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid gap-5 rounded-lg bg-white p-6 shadow-soft sm:grid-cols-2 sm:p-10"
          aria-labelledby="contact-form-title"
        >
          <h2 id="contact-form-title" className="text-2xl font-bold tracking-tight sm:col-span-2">
            Send a message
          </h2>
          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Select
            label="What's it about?"
            options={TOPICS}
            placeholder="Choose a topic"
            defaultValue=""
            error={errors.topic?.message}
            wrapperClassName={topic === "order" ? undefined : "sm:col-span-2"}
            {...register("topic")}
          />
          {topic === "order" && <Input label="Order number" optional placeholder="TP-123456" error={errors.orderNumber?.message} {...register("orderNumber")} />}
          <Textarea
            label="Message"
            wrapperClassName="sm:col-span-2"
            rows={6}
            placeholder="Say it straight. We can take it."
            hint={`${message.length}/2000`}
            error={errors.message?.message}
            {...register("message")}
          />
          {failed && (
            <p role="alert" className="text-sm font-medium text-[#b42318] sm:col-span-2">
              That didn&apos;t send. Check your connection and try again.
            </p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" disabled={isSubmitting} magnetic icon={<ArrowRightIcon size={18} />}>
              {isSubmitting ? "Sending…" : "Send message"}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
