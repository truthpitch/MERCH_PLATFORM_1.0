"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

function FieldShell({ label, error, hint, optional, className, children }: FieldShellProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "w-full rounded-md border bg-white px-4 text-[0.9375rem] text-navy placeholder:text-muted/70 transition-[border-color,box-shadow] duration-200 focus:outline-none focus-visible:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20";

type InputProps = ComponentProps<"input"> & { label: string; error?: string; hint?: string; optional?: boolean; wrapperClassName?: string };

export function Input({ label, error, hint, optional, wrapperClassName, className, ...props }: InputProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(control, "h-12", invalid ? "border-[#b42318]" : "border-navy/20", className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type TextareaProps = ComponentProps<"textarea"> & { label: string; error?: string; hint?: string; optional?: boolean; wrapperClassName?: string };

export function Textarea({ label, error, hint, optional, wrapperClassName, className, ...props }: TextareaProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(control, "min-h-32 py-3", invalid ? "border-[#b42318]" : "border-navy/20", className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type SelectProps = ComponentProps<"select"> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  wrapperClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({ label, error, hint, optional, wrapperClassName, className, options, placeholder, ...props }: SelectProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(control, "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230B2545%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10", invalid ? "border-[#b42318]" : "border-navy/20", className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode };

export function Checkbox({ label, description, className, ...props }: CheckboxProps) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-navy/30 accent-[var(--tp-accent)]"
        {...props}
      />
      <label htmlFor={id} className="cursor-pointer text-sm">
        <span className="font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-muted">{description}</span>}
      </label>
    </div>
  );
}

type SwitchProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode; icon?: ReactNode };

/** Toggle switch built on a native checkbox (role="switch"). */
export function Switch({ label, description, icon, className, ...props }: SwitchProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-lg border border-navy/15 bg-white p-4 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5",
        className,
      )}
    >
      {icon && <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-200 text-brown">{icon}</span>}
      <span className="flex-1">
        <span className="block font-semibold">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full bg-navy/20 transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-300 peer-checked:after:translate-x-5"
      />
    </label>
  );
}
