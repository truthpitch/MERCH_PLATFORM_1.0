"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "@/components/ui/Icons";

export function ConfirmationCheck() {
  return (
    <motion.span
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
      className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white"
      aria-hidden
    >
      <CheckIcon size={36} />
    </motion.span>
  );
}
