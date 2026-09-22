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

export function libraryReturnUrl(): string {
  let query = "";
  try {
    query = catalogQuery(
      parseCatalogState(sessionStorage.getItem("catalog-query") ?? ""),
    );
  } catch {
    // The static library link remains usable when storage is unavailable.
  }
  return `${SITE_BASE}${query ? `?${query}` : ""}#library`;
}
