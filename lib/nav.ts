"use client";

/**
 * Tracks whether the user has client-navigated since the document loaded.
 * Imported by the root AppShell so `initialPath` is captured on first load.
 */
const initialPath = typeof window !== "undefined" ? window.location.pathname : null;
let lastPath: string | null = null;
let navigated = false;

export function trackPath(pathname: string) {
  if (lastPath !== null && lastPath !== pathname) navigated = true;
  lastPath = pathname;
}

/** True when the current page is the first document load (no client nav yet). */
export function isFirstDocumentLoad(): boolean {
  if (navigated) return false;
  return initialPath === null || initialPath === window.location.pathname;
}
