import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/schemas";

/**
 * Newsletter signup (mocked). Phase 2: forward to your email provider
 * (e.g. Klaviyo / ConvertKit) or store in a `subscribers` table.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
