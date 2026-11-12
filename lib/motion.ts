import type { Transition } from "framer-motion";

/** Signature easing curves — mirrored in CSS as --tp-ease-* */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;

export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 0.6 };
export const springSnappy: Transition = { type: "spring", stiffness: 500, damping: 32 };
