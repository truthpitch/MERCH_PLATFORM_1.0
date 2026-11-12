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

/* ------------------------------------------------------------------
   Phase 2 — accounts, designs, admin
   ------------------------------------------------------------------ */

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(200, "That's a bit long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "At least 3 characters")
  .max(30, "30 characters max")
  .regex(/^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/, "Letters, numbers, - and _ only");

export const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  username: usernameSchema,
  email: z.email("Enter a valid email"),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email: z.email("Enter a valid email") });

export const resetPasswordSchema = z
  .object({ token: z.string().min(20), password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  username: usernameSchema,
  bio: z.string().trim().max(280, "Keep it under 280 characters"),
  image: z.string().max(500).optional().nullable(),
});

export const changePasswordSchema = z
  .object({ current: z.string().optional(), password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export const designSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Give it a title").max(60, "60 characters max"),
  tagline: z.string().trim().max(80, "80 characters max"),
  description: z.string().trim().min(20, "Describe it in at least 20 characters").max(600),
  story: z.string().trim().min(30, "Tell us the truth behind it (30+ characters)").max(1200),
  imageKey: z.string().min(1, "Upload your artwork"),
  productTypes: z.array(z.enum(["TEE", "HOODIE", "HAT"])).min(1, "Pick at least one product"),
  placementX: z.number().min(-50).max(50),
  placementY: z.number().min(-50).max(50),
  placementScale: z.number().min(0.3).max(1.6),
  intent: z.enum(["draft", "submit"]),
});

export const rejectSchema = z.object({
  designId: z.string().min(1),
  reason: z.string().trim().min(10, "Give the creator a real reason (10+ characters)").max(600),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type DesignInput = z.infer<typeof designSchema>;
