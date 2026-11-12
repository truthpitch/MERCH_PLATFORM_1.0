"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import {
  requestPasswordReset,
  resetPassword,
  signInWithGoogle,
  signInWithPassword,
  signUp,
  type FormState,
} from "@/lib/actions/auth";

const initial: FormState = {};

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending} icon={pending ? undefined : <ArrowRightIcon size={18} />}>
      {pending ? "One sec…" : children}
    </Button>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-[#b42318]/10 px-4 py-3 text-sm font-medium text-[#b42318]">
      {message}
    </p>
  );
}

function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="flex items-start gap-2 rounded-md bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
      <CheckIcon size={18} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}

function GoogleButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <button
        type="submit"
        className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-navy/20 bg-white font-semibold transition-colors hover:border-navy"
      >
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}

function Divider() {
  return (
    <div className="my-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted" aria-hidden>
      <span className="h-px flex-1 bg-navy/15" />
      or
      <span className="h-px flex-1 bg-navy/15" />
    </div>
  );
}

export function SignInForm({ callbackUrl, googleEnabled, notice }: { callbackUrl: string; googleEnabled: boolean; notice?: string }) {
  const [state, action] = useActionState(signInWithPassword, initial);
  return (
    <div>
      {googleEnabled && (
        <>
          <GoogleButton callbackUrl={callbackUrl} />
          <Divider />
        </>
      )}
      <form action={action} noValidate className="grid gap-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <FormError message={state.error ?? notice} />
        <Input label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required error={state.fieldErrors?.password} />
        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Submit>Sign in</Submit>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        New here?{" "}
        <Link href={`/sign-up${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="font-semibold text-navy underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function SignUpForm({ callbackUrl, googleEnabled }: { callbackUrl: string; googleEnabled: boolean }) {
  const [state, action] = useActionState(signUp, initial);
  return (
    <div>
      {googleEnabled && (
        <>
          <GoogleButton callbackUrl={callbackUrl} />
          <Divider />
        </>
      )}
      <form action={action} noValidate className="grid gap-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <FormError message={state.error} />
        <Input label="Name" name="name" autoComplete="name" required defaultValue={state.values?.name} error={state.fieldErrors?.name} />
        <Input
          label="Username"
          name="username"
          autoComplete="username"
          required
          defaultValue={state.values?.username}
          hint="Your public creator handle: truthpitch.com/creators/you"
          error={state.fieldErrors?.username}
        />
        <Input label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="8+ characters, with a letter and a number."
          error={state.fieldErrors?.password}
        />
        <Submit>Create account</Submit>
        <p className="text-xs text-muted">
          By signing up you agree to keep it honest. Submitted designs must be your own work.
        </p>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-navy underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} noValidate className="grid gap-5">
      <FormSuccess message={state.success} />
      <FormError message={state.error} />
      <Input label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <Submit>Send reset link</Submit>
      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-semibold text-navy underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, initial);
  if (state.success) {
    return (
      <div className="grid gap-6">
        <FormSuccess message={state.success} />
        <Button href="/sign-in" size="lg" fullWidth icon={<ArrowRightIcon size={18} />}>
          Sign in
        </Button>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="token" value={token} />
      <FormError message={state.error ?? state.fieldErrors?.token} />
      <Input label="New password" name="password" type="password" autoComplete="new-password" required hint="8+ characters, with a letter and a number." error={state.fieldErrors?.password} />
      <Input label="Confirm password" name="confirm" type="password" autoComplete="new-password" required error={state.fieldErrors?.confirm} />
      <Submit>Set new password</Submit>
    </form>
  );
}
