import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/schemas";

/**
 * Contact form (mocked). Phase 2: send via an email API (Resend, Postmark)
 * or store in a `messages` table for the admin dashboard.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
