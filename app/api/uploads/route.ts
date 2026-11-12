import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { AuthorizationError, assertUser } from "@/lib/session";
import { saveImageUpload, UploadError } from "@/lib/storage";

/** Signed-in users upload artwork or an avatar. Returns { key, url }. */
export async function POST(request: Request) {
  try {
    const user = await assertUser();
    const limit = rateLimit(`upload:${user.id}`, 30, 60 * 60_000);
    if (!limit.ok) return NextResponse.json({ error: "Upload limit reached. Try again in a bit." }, { status: 429 });

    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind") === "avatar" ? "avatars" : "designs";
    if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });

    const stored = await saveImageUpload(file, kind);
    return NextResponse.json({ key: stored.key, url: stored.url }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthorizationError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[uploads] failed", err);
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
}
