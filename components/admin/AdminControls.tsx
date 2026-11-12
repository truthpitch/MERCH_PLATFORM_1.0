"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { CheckIcon } from "@/components/ui/Icons";
import { approveDesign, refreshFulfillment, rejectDesign, setDesignFlags, setUserRole, type AdminResult } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

const QUICK_REASONS = [
  "The artwork is too low-resolution to print sharply — upload a larger file (3000px+).",
  "This uses someone else's logo or trademark. Designs must be your own work.",
  "The message is great, but the artwork disappears on most garment colours. Add contrast or an outline.",
  "The story behind it is missing or too short — tell people why this exists.",
];

/** Approve / reject with reason (review page). */
export function ReviewPanel({ designId, status, nextHref }: { designId: string; status: string; nextHref?: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<AdminResult | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [pending, start] = useTransition();

  const go = (fn: () => Promise<AdminResult>, outcome: "approved" | "rejected") =>
    start(async () => {
      const res = await fn();
      setResult(res);
      if (res.ok) {
        setDone(outcome);
        router.refresh();
      }
    });

  if (done) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <p role="status" className="flex items-center gap-2 text-lg font-bold">
          <CheckIcon className={done === "approved" ? "text-[#17603c]" : "text-brown"} />
          {done === "approved" ? "Approved. It's live." : "Rejected. The creator has been emailed."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {nextHref ? (
            <Button href={nextHref}>Next in queue</Button>
          ) : (
            <Button href="/admin/designs">Back to queue</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-soft">
      <h2 className="text-lg font-bold">Decision</h2>
      {status === "APPROVED" && <p className="mt-1 text-sm text-muted">This design is live. Rejecting it takes it down (only possible if nobody has ordered it).</p>}
      {result?.error && (
        <p role="alert" className="mt-4 rounded-md bg-[#b42318]/10 px-4 py-3 text-sm font-medium text-[#b42318]">
          {result.error}
        </p>
      )}
      {status !== "APPROVED" && (
        <Button className="mt-5" fullWidth size="lg" disabled={pending} onClick={() => go(() => approveDesign(designId), "approved")} icon={<CheckIcon size={18} />}>
          {pending ? "Working…" : "Approve & publish"}
        </Button>
      )}
      <div className="mt-6 border-t border-navy/10 pt-6">
        <Textarea
          label="Reason for rejection"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Be specific and kind. The creator sees this word for word."
          hint={`${reason.length}/600`}
          maxLength={600}
          error={result?.fieldErrors?.reason}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_REASONS.map((r) => (
            <button key={r} type="button" onClick={() => setReason(r)} className="rounded-full border border-navy/15 px-3 py-1.5 text-left text-xs hover:border-navy">
              {r.split(" — ")[0].split(".")[0]}
            </button>
          ))}
        </div>
        <Button className="mt-5" variant="brown" fullWidth disabled={pending} onClick={() => go(() => rejectDesign({ designId, reason }), "rejected")}>
          Reject with reason
        </Button>
      </div>
    </div>
  );
}

export function FlagToggles({ designId, isNew, isBestSeller }: { designId: string; isNew: boolean; isBestSeller: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const toggle = (patch: { isNew?: boolean; isBestSeller?: boolean }) =>
    start(async () => {
      await setDesignFlags({ designId, ...patch });
      router.refresh();
    });
  return (
    <div className="flex flex-wrap gap-2">
      {(
        [
          ["New", isNew, { isNew: !isNew }],
          ["Best seller", isBestSeller, { isBestSeller: !isBestSeller }],
        ] as const
      ).map(([label, on, patch]) => (
        <button
          key={label}
          type="button"
          aria-pressed={on}
          disabled={pending}
          onClick={() => toggle(patch)}
          className={cn("h-9 rounded-full border px-4 text-sm font-semibold transition-colors", on ? "border-navy bg-navy text-white" : "border-navy/20 bg-white hover:border-navy")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function RoleToggle({ userId, role, self }: { userId: string; role: "USER" | "ADMIN"; self: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (self) return <span className="text-xs text-muted">You</span>;
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setUserRole({ userId, role: role === "ADMIN" ? "USER" : "ADMIN" });
            if (!res.ok) setError(res.error ?? "Failed");
            else router.refresh();
          })
        }
        className="h-9 rounded-full border border-navy/20 px-3 text-xs font-semibold hover:border-navy disabled:opacity-50"
      >
        {role === "ADMIN" ? "Remove admin" : "Make admin"}
      </button>
      {error && <p className="mt-1 text-xs text-[#b42318]">{error}</p>}
    </div>
  );
}

export function RefreshFulfillmentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await refreshFulfillment(orderId);
            if (!res.ok) setError(res.error ?? "Failed");
            else router.refresh();
          })
        }
        className="text-xs font-semibold text-accent underline-offset-4 hover:underline disabled:opacity-50"
      >
        {pending ? "Checking…" : "Refresh status"}
      </button>
      {error && <span className="text-xs text-[#b42318]">{error}</span>}
    </span>
  );
}
