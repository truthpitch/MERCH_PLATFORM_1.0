"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Avatar } from "@/components/layout/AccountMenu";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { CheckIcon } from "@/components/ui/Icons";
import { changePassword, updateProfile } from "@/lib/actions/account";
import type { FormState } from "@/lib/actions/auth";

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

function Status({ state }: { state: FormState }) {
  if (state.success)
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-accent">
        <CheckIcon size={16} /> {state.success}
      </p>
    );
  if (state.error)
    return (
      <p role="alert" className="text-sm font-medium text-[#b42318]">
        {state.error}
      </p>
    );
  return null;
}

export function ProfileForm({ user }: { user: { name: string | null; username: string | null; email: string; bio: string | null; image: string | null } }) {
  const [state, action] = useActionState(updateProfile, {});
  const [image, setImage] = useState<string | null>(user.image);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", "avatar");
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed.");
      setImage(json.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="image" value={image ?? ""} />
      <div className="flex items-center gap-5">
        <Avatar user={{ name: user.name, email: user.email, image }} size={72} />
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center rounded-full border border-navy/30 px-4 text-sm font-semibold hover:border-navy focus-within:outline-2 focus-within:outline-accent">
            {uploading ? "Uploading…" : "Upload photo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
          </label>
          {image && (
            <button type="button" onClick={() => setImage(null)} className="h-10 px-3 text-sm text-muted hover:text-navy">
              Remove
            </button>
          )}
        </div>
      </div>
      {(uploadError || state.fieldErrors?.image) && (
        <p role="alert" className="text-sm font-medium text-[#b42318]">
          {uploadError || state.fieldErrors?.image}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Name" name="name" defaultValue={state.values?.name ?? user.name ?? ""} autoComplete="name" error={state.fieldErrors?.name} />
        <Input
          label="Username"
          name="username"
          defaultValue={state.values?.username ?? user.username ?? ""}
          autoComplete="username"
          hint="truthpitch.com/creators/…"
          error={state.fieldErrors?.username}
        />
      </div>
      <Textarea
        label="Bio"
        name="bio"
        optional
        rows={3}
        maxLength={280}
        defaultValue={state.values?.bio ?? user.bio ?? ""}
        placeholder="One or two honest lines about you."
        error={state.fieldErrors?.bio}
      />
      <Input label="Email" value={user.email} disabled readOnly hint="Contact us to change your email." />
      <div className="flex flex-wrap items-center gap-4">
        <Save label="Save profile" />
        <Status state={state} />
      </div>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action] = useActionState(changePassword, {});
  return (
    <form action={action} className="grid gap-5">
      {hasPassword && <Input label="Current password" name="current" type="password" autoComplete="current-password" error={state.fieldErrors?.current} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label={hasPassword ? "New password" : "Set a password"} name="password" type="password" autoComplete="new-password" hint="8+ characters, a letter and a number." error={state.fieldErrors?.password} />
        <Input label="Confirm" name="confirm" type="password" autoComplete="new-password" error={state.fieldErrors?.confirm} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Save label={hasPassword ? "Change password" : "Set password"} />
        <Status state={state} />
      </div>
    </form>
  );
}
