/**
 * Zod schemas shared by client forms (react-hook-form) and API routes.
 */
import { z } from "zod";

const req = (label: string) => z.string().trim().min(1, `${label} is required`);

export const addressSchema = z.object({
  firstName: req("First name").max(60),
  lastName: req("Last name").max(60),
  line1: req("Address").max(120),
  line2: z.string().trim().max(120).optional(),
  city: req("City").max(80),
  region: req("State / region").max(80),
  postalCode: req("Postal code").max(16).regex(/^[A-Za-z0-9 -]{3,16}$/, "Enter a valid postal code"),
  country: z.string().length(2, "Choose a country"),
  phone: z.string().trim().max(30).optional(),
});

export const contactStepSchema = z.object({
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s().-]*$/, "Enter a valid phone number")
    .optional(),
  marketingOptIn: z.boolean(),
});

export const giftSchema = z.object({
  recipient: addressSchema,
  message: z.string().trim().max(300, "Keep it under 300 characters"),
  hidePrices: z.boolean(),
});

export const shippingStepSchema = z
  .object({
    billingAddress: addressSchema,
    shippingMethod: z.enum(["standard", "express"]),
    isGift: z.boolean(),
    gift: z
      .object({
        recipient: addressSchema.partial(),
        message: z.string().max(300, "Keep it under 300 characters"),
        hidePrices: z.boolean(),
      })
      .optional(),
  })
  .superRefine((val, ctx) => {
    // Recipient address is only validated when "This is a gift" is on.
    if (!val.isGift) return;
    const parsed = giftSchema.safeParse(val.gift);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({ code: "custom", message: issue.message, path: ["gift", ...issue.path] });
      }
    }
  });

export const orderDraftSchema = z.object({
  contact: contactStepSchema,
  billingAddress: addressSchema,
  isGift: z.boolean(),
  gift: giftSchema.nullable(),
  shippingMethod: z.enum(["standard", "express"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your cart is empty"),
});

export const contactFormSchema = z.object({
  name: req("Name").max(80),
  email: z.email("Enter a valid email"),
  topic: z.enum(["order", "sizing", "collab", "press", "other"], "Pick a topic"),
  orderNumber: z.string().trim().max(32).optional(),
  message: z.string().trim().min(20, "Give us a bit more — at least 20 characters").max(2000),
});

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email"),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type ContactStepInput = z.infer<typeof contactStepSchema>;
export type ShippingStepInput = z.infer<typeof shippingStepSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
