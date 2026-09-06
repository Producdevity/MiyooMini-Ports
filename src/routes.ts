import { slugify } from "./slug";

export const SITE_BASE: string = import.meta.env.BASE_URL;

export function detailSlug(kind: "port" | "porter"): string | null {
  const match = window.location.pathname.match(
    kind === "port" ? /\/port\/([^/]+)\/?$/ : /\/porter\/([^/]+)\/?$/,
  );
  if (match === null) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function portUrl(name: string): string {
  return `${SITE_BASE}port/${slugify(name)}/`;
}

export function porterUrl(handle: string): string {
  return `${SITE_BASE}porter/${handle}/`;
}
