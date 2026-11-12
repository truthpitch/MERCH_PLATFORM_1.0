"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type KeyboardEvent, type PointerEvent } from "react";
import { GarmentMockup, PRINT_AREAS } from "@/components/product/GarmentMockup";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { ArrowRightIcon, CheckIcon, CloseIcon, PlusIcon } from "@/components/ui/Icons";
import { saveDesign } from "@/lib/actions/designs";
import { PRODUCT_TYPE_SPECS, STUDIO_PRODUCT_TYPES, type StudioProductType } from "@/lib/catalog";
import { EASE_OUT } from "@/lib/motion";
import { clamp, cn, formatPrice } from "@/lib/utils";

export interface StudioInitial {
  id?: string;
  title: string;
  tagline: string;
  description: string;
  story: string;
  imageKey: string;
  imageUrl: string;
  productTypes: StudioProductType[];
  placementX: number;
  placementY: number;
  placementScale: number;
  status?: "DRAFT" | "PENDING" | "REJECTED";
  rejectionReason?: string | null;
}

export const EMPTY_DESIGN: StudioInitial = {
  title: "",
  tagline: "",
  description: "",
  story: "",
  imageKey: "",
  imageUrl: "",
  productTypes: ["TEE"],
  placementX: 0,
  placementY: 0,
  placementScale: 1,
};

const STEPS = ["Artwork", "Details", "Products"] as const;

export function DesignStudio({ initial }: { initial: StudioInitial }) {
  const router = useRouter();
  const [d, setD] = useState<StudioInitial>(initial);
  const [previewType, setPreviewType] = useState<StudioProductType>(initial.productTypes[0] ?? "TEE");
  const [previewColor, setPreviewColor] = useState(PRODUCT_TYPE_SPECS[previewType].colors[0].hex);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const set = <K extends keyof StudioInitial>(k: K, v: StudioInitial[K]) => {
    setD((prev) => ({ ...prev, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  const mockup = { artworkUrl: d.imageUrl, x: d.placementX, y: d.placementY, scale: d.placementScale };
  const area = PRINT_AREAS[previewType];

  async function upload(file: File) {
    setUploadError(null);
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setUploadError("Upload a PNG, JPG or WebP. Transparent PNGs look best.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", "design");
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = (await res.json()) as { key?: string; url?: string; error?: string };
      if (!res.ok || !json.key || !json.url) throw new Error(json.error || "Upload failed.");
      setD((prev) => ({ ...prev, imageKey: json.key!, imageUrl: json.url! }));
      setErrors((e) => ({ ...e, imageKey: "" }));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  // Drag the artwork inside the print area (pointer), or nudge with arrow keys.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!d.imageUrl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, startX: d.placementX, startY: d.placementY };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !areaRef.current) return;
    const r = areaRef.current.getBoundingClientRect();
    const nx = drag.current.startX + ((e.clientX - drag.current.x) / r.width) * 100;
    const ny = drag.current.startY + ((e.clientY - drag.current.y) / r.height) * 100;
    setD((prev) => ({ ...prev, placementX: Math.round(clamp(nx, -50, 50)), placementY: Math.round(clamp(ny, -50, 50)) }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 5 : 1;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setD((prev) => ({ ...prev, placementX: clamp(prev.placementX + m[0], -50, 50), placementY: clamp(prev.placementY + m[1], -50, 50) }));
  };

  const toggleType = (t: StudioProductType) => {
    const next = d.productTypes.includes(t) ? d.productTypes.filter((x) => x !== t) : [...d.productTypes, t];
    set("productTypes", STUDIO_PRODUCT_TYPES.filter((x) => next.includes(x)));
  };

  function save(intent: "draft" | "submit") {
    setFormError(null);
    startTransition(async () => {
      const res = await saveDesign({
        id: d.id,
        title: d.title,
        tagline: d.tagline,
        description: d.description,
        story: d.story,
        imageKey: d.imageKey,
        productTypes: d.productTypes,
        placementX: d.placementX,
        placementY: d.placementY,
        placementScale: d.placementScale,
        intent,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error ?? "Something went wrong.");
        document.getElementById("studio-errors")?.focus();
        return;
      }
      setErrors({});
      if (intent === "submit") {
        router.push(`/dashboard?submitted=${encodeURIComponent(d.title)}`);
        router.refresh();
      } else {
        setSavedAt(new Date());
        if (!d.id && res.id) {
          setD((prev) => ({ ...prev, id: res.id, status: "DRAFT" }));
          router.replace(`/studio/${res.id}`, { scroll: false });
        }
      }
    });
  }

  const stepDone = [Boolean(d.imageUrl), d.title.trim().length >= 3 && d.story.trim().length >= 30 && d.description.trim().length >= 20, d.productTypes.length > 0];

  return (
    <div className="container-tp pb-24">
      {d.status === "REJECTED" && d.rejectionReason && (
        <div className="mb-8 rounded-lg border border-brown/30 bg-sand-200 p-5">
          <p className="eyebrow text-brown">Not approved yet — here&apos;s why</p>
          <p className="mt-2 text-lg font-semibold">{d.rejectionReason}</p>
          <p className="mt-1 text-sm text-muted">Make the changes, then resubmit. We review every design by hand.</p>
        </div>
      )}
      {d.status === "PENDING" && (
        <div className="mb-8 rounded-lg border border-accent/30 bg-accent/5 p-5 text-sm">
          <strong>In review.</strong> Saving changes as a draft takes it out of the queue — submit again when you&apos;re ready.
        </div>
      )}

      <ol className="mb-10 grid grid-cols-3 gap-2" aria-label="Studio steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-col gap-2">
            <span className="h-1 overflow-hidden rounded-full bg-navy/10">
              <motion.span className="block h-full origin-left bg-accent" initial={false} animate={{ scaleX: stepDone[i] ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE_OUT }} />
            </span>
            <span className={cn("flex items-center gap-2 text-sm font-semibold", stepDone[i] ? "text-accent" : "text-muted")}>
              {stepDone[i] && <CheckIcon size={14} />}
              {i + 1}. {s}
              {stepDone[i] && <span className="sr-only">(done)</span>}
            </span>
          </li>
        ))}
      </ol>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* ---------------- Preview ---------------- */}
        <section aria-labelledby="preview-title" className="lg:col-span-6">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 id="preview-title" className="text-lg font-bold">
                Live preview
              </h2>
              <div role="tablist" aria-label="Preview product" className="inline-flex rounded-full border border-navy/15 bg-white p-1 text-sm font-semibold">
                {STUDIO_PRODUCT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={previewType === t}
                    onClick={() => {
                      setPreviewType(t);
                      setPreviewColor(PRODUCT_TYPE_SPECS[t].colors[0].hex);
                    }}
                    className={cn("h-8 rounded-full px-3 transition-colors sm:px-4", previewType === t ? "bg-navy text-white" : "hover:bg-navy/5")}
                  >
                    {PRODUCT_TYPE_SPECS[t].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-lg">
              {d.imageUrl ? (
                <GarmentMockup type={previewType} color={previewColor} mockup={mockup} showGuide sizes="(min-width: 1024px) 45vw, 100vw" alt="Preview of your design on the garment" />
              ) : (
                <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 bg-sand-200 p-8 text-center">
                  <p className="text-2xl font-bold tracking-tight">Your design goes here.</p>
                  <p className="max-w-xs text-sm text-muted">Upload artwork to see it on a tee, hoodie or cap.</p>
                </div>
              )}
              {d.imageUrl && (
                <div
                  ref={areaRef}
                  role="slider"
                  tabIndex={0}
                  aria-label="Artwork position. Drag, or use arrow keys (Shift for bigger steps)."
                  aria-valuetext={`Horizontal ${d.placementX}, vertical ${d.placementY}`}
                  aria-valuenow={d.placementX}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onKeyDown={onKeyDown}
                  data-cursor="Drag"
                  className="absolute cursor-grab touch-none rounded-sm active:cursor-grabbing"
                  style={{ left: `${area.left}%`, top: `${area.top}%`, width: `${area.width}%`, height: `${area.height}%` }}
                />
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2" role="radiogroup" aria-label="Preview colour">
                {PRODUCT_TYPE_SPECS[previewType].colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={previewColor === c.hex}
                    aria-label={c.name}
                    onClick={() => setPreviewColor(c.hex)}
                    className={cn("h-8 w-8 rounded-full border border-navy/20", previewColor === c.hex && "ring-2 ring-navy ring-offset-2 ring-offset-paper")}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted">Dashed box = print area. Drag to position.</p>
            </div>

            {d.imageUrl && (
              <div className="mt-6 grid gap-4 rounded-lg border border-navy/10 bg-white p-5 sm:grid-cols-3">
                {(
                  [
                    ["placementScale", "Scale", 0.3, 1.6, 0.05, `${Math.round(d.placementScale * 100)}%`],
                    ["placementX", "Left / right", -50, 50, 1, `${d.placementX}`],
                    ["placementY", "Up / down", -50, 50, 1, `${d.placementY}`],
                  ] as const
                ).map(([k, label, min, max, step, out]) => (
                  <label key={k} className="text-sm">
                    <span className="flex justify-between font-medium">
                      {label} <span className="tabular-nums text-muted">{out}</span>
                    </span>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={d[k]}
                      onChange={(e) => set(k, Number(e.target.value))}
                      className="mt-2 w-full accent-[var(--tp-accent)]"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setD((p) => ({ ...p, placementX: 0, placementY: 0, placementScale: 1 }))}
                  className="text-left text-sm font-medium text-accent underline-offset-4 hover:underline sm:col-span-3"
                >
                  Reset position
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ---------------- Form ---------------- */}
        <section aria-label="Design details" className="lg:col-span-6">
          <div id="studio-errors" tabIndex={-1} className="outline-none">
            <AnimatePresence>
              {formError && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 rounded-md bg-[#b42318]/10 px-4 py-3 text-sm font-medium text-[#b42318]"
                >
                  {formError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* 1. Artwork */}
          <fieldset className="border-b border-navy/10 pb-10">
            <legend className="text-2xl font-bold tracking-tight">1. Artwork</legend>
            <p className="mt-1 text-sm text-muted">PNG, JPG or WebP up to 10MB. Transparent PNG at 3000px+ prints sharpest.</p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDropActive(true);
              }}
              onDragLeave={() => setDropActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDropActive(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void upload(f);
              }}
              className={cn(
                "mt-5 flex items-center gap-5 rounded-lg border-2 border-dashed p-5 transition-colors",
                dropActive ? "border-accent bg-accent/5" : errors.imageKey ? "border-[#b42318]/60" : "border-navy/20 bg-white",
              )}
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[repeating-conic-gradient(#ebdfcf_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
                {d.imageUrl ? (
                  <Image src={d.imageUrl} alt="Your uploaded artwork" fill sizes="96px" unoptimized={d.imageUrl.endsWith(".svg")} className="object-contain p-1" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-muted">
                    <PlusIcon />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{d.imageUrl ? "Artwork uploaded" : "Drop your artwork here"}</p>
                <p className="text-sm text-muted">{uploading ? "Uploading…" : d.imageUrl ? "Replace it any time." : "or choose a file"}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    {d.imageUrl ? "Replace" : "Choose file"}
                  </Button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  aria-label="Upload artwork"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            {(uploadError || errors.imageKey) && (
              <p role="alert" className="mt-2 text-sm font-medium text-[#b42318]">
                {uploadError || errors.imageKey}
              </p>
            )}
          </fieldset>

          {/* 2. Details */}
          <fieldset className="grid gap-5 border-b border-navy/10 py-10">
            <legend className="mb-5 text-2xl font-bold tracking-tight">2. Details</legend>
            <Input label="Title" value={d.title} maxLength={60} onChange={(e) => set("title", e.target.value)} error={errors.title} />
            <Input label="Tagline" optional value={d.tagline} maxLength={80} placeholder="One short line, e.g. “Certified honest.”" onChange={(e) => set("tagline", e.target.value)} error={errors.tagline} />
            <Textarea
              label="Description"
              rows={3}
              value={d.description}
              maxLength={600}
              placeholder="What's on it, where it sits, how it looks."
              hint={`${d.description.length}/600`}
              onChange={(e) => set("description", e.target.value)}
              error={errors.description}
            />
            <Textarea
              label="The truth behind it"
              rows={5}
              value={d.story}
              maxLength={1200}
              placeholder="Why does this need to exist? Say it straight."
              hint={`${d.story.length}/1200 — shown on the product page`}
              onChange={(e) => set("story", e.target.value)}
              error={errors.story}
            />
          </fieldset>

          {/* 3. Products */}
          <fieldset className="py-10">
            <legend className="text-2xl font-bold tracking-tight">3. Products</legend>
            <p className="mt-1 text-sm text-muted">Where should it be available? TruthPitch sets prices so everything stays consistent.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {STUDIO_PRODUCT_TYPES.map((t) => {
                const on = d.productTypes.includes(t);
                const spec = PRODUCT_TYPE_SPECS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleType(t)}
                    className={cn(
                      "relative flex flex-col items-start rounded-lg border p-4 text-left transition-colors",
                      on ? "border-accent bg-accent/5" : "border-navy/15 bg-white hover:border-navy/40",
                    )}
                  >
                    <span className={cn("absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border", on ? "border-accent bg-accent text-white" : "border-navy/20")}>
                      {on ? <CheckIcon size={14} /> : null}
                    </span>
                    <span className="font-semibold">{spec.label}</span>
                    <span className="text-sm text-muted">{formatPrice(spec.priceCents / 100, { whole: true })}</span>
                    <span className="mt-2 text-xs text-muted">{spec.colors.length} colours · {spec.sizes.length > 1 ? `${spec.sizes[0]}–${spec.sizes.at(-1)}` : "One size"}</span>
                  </button>
                );
              })}
            </div>
            {errors.productTypes && (
              <p role="alert" className="mt-2 text-sm font-medium text-[#b42318]">
                {errors.productTypes}
              </p>
            )}
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-navy/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted" aria-live="polite">
              {pending ? "Saving…" : savedAt ? `Draft saved at ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Drafts are private until you submit."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" disabled={pending || uploading} onClick={() => save("draft")}>
                Save draft
              </Button>
              <Button disabled={pending || uploading} onClick={() => save("submit")} icon={<ArrowRightIcon size={18} />}>
                Submit for review
              </Button>
            </div>
          </div>
          {d.id && (
            <p className="mt-6 text-right">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-1 text-sm text-muted underline-offset-4 hover:text-navy hover:underline"
              >
                <CloseIcon size={14} /> Close studio
              </button>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
