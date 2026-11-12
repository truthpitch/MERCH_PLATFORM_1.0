"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { UserIcon } from "@/components/ui/Icons";
import { signOutAction } from "@/lib/actions/auth";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface NavUser {
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
}

export function initials(name: string | null, email: string) {
  const src = (name || email).trim();
  const parts = src.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "TP";
}

export function Avatar({ user, size = 36, className }: { user: Pick<NavUser, "name" | "email" | "image">; size?: number; className?: string }) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sand font-bold text-navy", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {user.image ? <Image src={user.image} alt="" fill sizes={`${size}px`} className="object-cover" /> : initials(user.name, user.email)}
    </span>
  );
}

export function accountLinks(user: NavUser) {
  return [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Design studio", href: "/studio" },
    { label: "My orders", href: "/dashboard/orders" },
    { label: "Settings", href: "/dashboard/settings" },
    ...(user.username ? [{ label: "Public profile", href: `/creators/${user.username}` }] : []),
    ...(user.role === "ADMIN" ? [{ label: "Admin", href: "/admin" }] : []),
  ];
}

/** Signed-in dropdown (or a "Sign in" link when signed out). */
export function AccountMenu({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [lastPath, setLastPath] = useState(pathname);

  // Close when the route changes (adjusting state during render, per React docs).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href={`/sign-in${pathname && pathname !== "/" ? `?callbackUrl=${encodeURIComponent(pathname)}` : ""}`}
        className="hidden h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold hover:bg-navy/5 sm:inline-flex"
      >
        <UserIcon size={18} /> Sign in
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${user.name ?? user.email}`}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-navy/15 bg-white/70 pl-1 pr-3 text-sm font-semibold transition-colors hover:border-navy"
      >
        <Avatar user={user} />
        <span className="max-w-28 truncate">{user.name?.split(" ")[0] ?? "Account"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="absolute right-0 top-full mt-2 w-64 origin-top-right overflow-hidden rounded-lg border border-navy/10 bg-white shadow-lift"
          >
            <div className="border-b border-navy/10 px-4 py-3">
              <p className="truncate font-semibold">{user.name ?? "Your account"}</p>
              <p className="truncate text-sm text-muted">{user.username ? `@${user.username}` : user.email}</p>
            </div>
            <nav aria-label="Account">
              <ul className="py-1.5">
                {accountLinks(user).map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={cn(
                        "block px-4 py-2.5 text-sm font-medium hover:bg-navy/5",
                        l.href === "/admin" && "text-brown",
                        pathname === l.href && "text-accent",
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <form action={signOutAction} className="border-t border-navy/10">
              <button type="submit" className="w-full px-4 py-3 text-left text-sm font-medium text-muted hover:bg-navy/5 hover:text-navy">
                Sign out
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
