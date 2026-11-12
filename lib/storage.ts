/**
 * File storage abstraction for uploads (design artwork, avatars).
 *
 * MVP driver: local disk at UPLOAD_DIR — set it to a folder OUTSIDE the
 * deployed app (e.g. /home/<user>/truthpitch-uploads on Hostinger) so a
 * redeploy from GitHub never wipes uploads. Files are served by
 * app/uploads/[...path]/route.ts at /uploads/<key>.
 *
 * Later: implement `StorageDriver` for S3-compatible storage (Hostinger
 * Object Storage, Cloudflare R2, AWS S3) and switch on STORAGE_DRIVER.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomToken } from "@/lib/password";

export interface StoredFile {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  url(key: string): string;
}

export function uploadRoot(): string {
  return path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads"));
}

/** Rejects absolute paths, traversal and odd characters. */
export function safeKey(key: string): string | null {
  if (!/^[a-z0-9/_.-]+$/i.test(key) || key.includes("..") || key.startsWith("/")) return null;
  const full = path.resolve(uploadRoot(), key);
  return full.startsWith(uploadRoot() + path.sep) ? key : null;
}

const localDriver: StorageDriver = {
  async put(key, data) {
    const full = path.join(uploadRoot(), key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
  },
  async get(key) {
    const k = safeKey(key);
    if (!k) return null;
    try {
      return await readFile(path.join(uploadRoot(), k));
    } catch {
      return null;
    }
  },
  async delete(key) {
    const k = safeKey(key);
    if (k) await rm(path.join(uploadRoot(), k), { force: true });
  },
  url(key) {
    return `/uploads/${key}`;
  },
};

export const storage: StorageDriver = localDriver;

export const MAX_UPLOAD_BYTES = (Number(process.env.UPLOAD_MAX_MB) || 10) * 1024 * 1024;

const TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
} as const;

export function contentTypeFor(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  return ext === "png" ? TYPES.png : ext === "webp" ? TYPES.webp : ext === "jpg" || ext === "jpeg" ? TYPES.jpg : "application/octet-stream";
}

/** Detects the real file type from magic bytes (never trust the filename). */
function sniff(buf: Buffer): keyof typeof TYPES | null {
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

export class UploadError extends Error {}

export async function saveImageUpload(file: File, folder: "designs" | "avatars"): Promise<StoredFile> {
  if (file.size === 0) throw new UploadError("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`Keep it under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB.`);
  const data = Buffer.from(await file.arrayBuffer());
  const ext = sniff(data);
  if (!ext) throw new UploadError("Upload a PNG, JPG or WebP image. (Transparent PNGs look best on garments.)");
  const now = new Date();
  const key = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomToken(12)}.${ext}`;
  await storage.put(key, data, TYPES[ext]);
  return { key, url: storage.url(key), contentType: TYPES[ext], size: data.length };
}

/** True if a stored URL points at our upload store. */
export function keyFromUrl(url: string | null | undefined): string | null {
  if (!url?.startsWith("/uploads/")) return null;
  return safeKey(url.slice("/uploads/".length));
}
