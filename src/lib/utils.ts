import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BASE_PATH = (() => {
  const raw = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
  if (!raw || raw === "/") return "";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.replace(/\/+$/, "");
})();

export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (raw) {
    const normalized =
      raw.startsWith("http://") && raw.includes(".github.io")
        ? `https://${raw.slice("http://".length)}`
        : raw;
    return normalized.replace(/\/+$/, "");
  }
  return BASE_PATH ? `https://jacxas.github.io${BASE_PATH}` : "https://tbcpl.lol";
}

export function normalizeAsset(p: string): string {
  if (!p) return p;
  if (
    p.startsWith("http://") ||
    p.startsWith("https://") ||
    p.startsWith("data:") ||
    p.startsWith("blob:")
  ) {
    return p;
  }
  const normalized = p.startsWith("./")
    ? `/${p.slice(2)}`
    : p.startsWith("/")
      ? p
      : `/${p}`;
  if (!BASE_PATH) return normalized;
  if (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`)) {
    return normalized;
  }
  return `${BASE_PATH}${normalized}`;
}
