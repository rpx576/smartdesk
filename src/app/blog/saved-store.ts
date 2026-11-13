"use client";

import { useSyncExternalStore } from "react";

/** Articles the reader saved for later, kept only in this browser. */
const KEY = "smarthub.blog.saved";
const EMPTY: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: ReadonlySet<string> } = { raw: null, value: EMPTY };

function read(): ReadonlySet<string> {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cache.value;
  }
  if (raw === cache.raw) return cache.value;
  let ids: unknown = [];
  try {
    ids = raw ? JSON.parse(raw) : [];
  } catch {
    ids = [];
  }
  const value = new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []);
  cache = { raw, value };
  return value;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function toggleSaved(id: string) {
  const next = new Set(read());
  if (next.has(id)) next.delete(id);
  else next.add(id);
  const raw = JSON.stringify([...next]);
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    // Storage blocked (private mode): keep it for this visit only.
  }
  cache = { raw, value: next };
  listeners.forEach((listener) => listener());
}

export function useSavedArticles(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

const noop = () => () => {};

/** Today's local day (YYYY-MM-DD) on the client, `null` while rendering on the server. */
export function useToday(): string | null {
  return useSyncExternalStore(
    noop,
    () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    },
    () => null,
  );
}
