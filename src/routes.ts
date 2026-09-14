import { SITE_BASE } from "./site";
import { slugify } from "./slug";

export { SITE_BASE } from "./site";

export function detailSlug(kind: "port" | "porter"): string | null {
  const match = window.location.pathname.match(
    kind === "port"
      ? /\/port\/([^/]+)(?:\/index\.html|\/)?$/
      : /\/porter\/([^/]+)(?:\/index\.html|\/)?$/,
  );
  if (match === null) {
    return window.location.pathname === `${SITE_BASE}${kind}.html`
      ? new URLSearchParams(window.location.search).get("p")
      : null;
  }
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
  return `${SITE_BASE}porter/${encodeURIComponent(handle)}/`;
}
