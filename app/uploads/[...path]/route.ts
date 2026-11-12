import { contentTypeFor, safeKey, storage } from "@/lib/storage";

/** Serves uploaded files from UPLOAD_DIR (outside the deployed build). */
export async function GET(_req: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const { path } = await params;
  const key = safeKey(path.join("/"));
  if (!key) return new Response("Not found", { status: 404 });
  const data = await storage.get(key);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": contentTypeFor(key),
      "Content-Length": String(data.length),
      // Keys are random and never reused, so they can be cached forever.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
