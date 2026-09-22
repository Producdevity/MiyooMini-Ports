import type { CatalogState } from "./catalog";
import { SITE_BASE } from "./routes";
import { catalogQuery, parseCatalogState } from "./urlstate";

export function rememberCatalog(state: CatalogState): void {
  try {
    sessionStorage.setItem("catalog-query", catalogQuery(state));
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function readCatalogSelection(): string | null {
  try {
    return sessionStorage.getItem("catalog-selection");
  } catch {
    return null;
  }
}

export function rememberCatalogSelection(slug: string): void {
  try {
    sessionStorage.setItem("catalog-selection", slug);
  } catch {
    // Selection still works without optional session persistence.
  }
}

export function libraryReturnUrl(): string {
  let query = "";
  try {
    query = catalogQuery(
      parseCatalogState(sessionStorage.getItem("catalog-query") ?? ""),
    );
  } catch {
    // The static library link remains usable when storage is unavailable.
  }
  const selected = readCatalogSelection();
  const anchor =
    selected && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selected)
      ? `port-${selected}`
      : "library";
  return `${SITE_BASE}${query ? `?${query}` : ""}#${anchor}`;
}
