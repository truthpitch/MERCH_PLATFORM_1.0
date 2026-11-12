"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { deleteDesign, withdrawDesign } from "@/lib/actions/designs";

/** Edit / withdraw / delete controls for a creator's own design. */
export function DesignActions({ id, status, slug, title }: { id: string; status: string; slug: string; title: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else {
        setConfirm(false);
        router.refresh();
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "APPROVED" ? (
        <Button href={`/shop/${slug}`} size="sm" variant="outline">
          View live
        </Button>
      ) : (
        <Button href={`/studio/${id}`} size="sm" variant={status === "REJECTED" ? "primary" : "outline"}>
          {status === "REJECTED" ? "Edit & resubmit" : status === "PENDING" ? "Edit" : "Continue editing"}
        </Button>
      )}
      {status === "PENDING" && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => withdrawDesign(id))}>
          Withdraw
        </Button>
      )}
      {status !== "APPROVED" && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirm(true)}>
          Delete
        </Button>
      )}
      {error && (
        <p role="alert" className="w-full text-sm font-medium text-[#b42318]">
          {error}
        </p>
      )}
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete this design?"
        footer={
          <div className="flex justify-end gap-3 px-5 py-4">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Keep it
            </Button>
            <Button variant="brown" disabled={pending} onClick={() => run(() => deleteDesign(id))}>
              {pending ? "Deleting…" : "Delete for good"}
            </Button>
          </div>
        }
      >
        <p className="px-5 py-6 sm:px-6">
          “{title || "Untitled"}” and its artwork will be permanently deleted. This can&apos;t be undone.
        </p>
      </Dialog>
    </div>
  );
}
