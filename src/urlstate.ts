import { type CatalogState, KINDS, SORTS } from "./catalog";
import type { FilterKey, FilterState } from "./types";
import { ASSETS_VALUES, CATEGORY_VALUES, STATUS_VALUES } from "./types";

const VALID: Record<FilterKey, ReadonlySet<string>> = {
  status: new Set(STATUS_VALUES),
  assets: new Set(ASSETS_VALUES),
  category: new Set(CATEGORY_VALUES),
};
const KEYS: readonly FilterKey[] = ["status", "assets", "category"];

export function parseCatalogState(query: string): CatalogState {
  const params = new URLSearchParams(query);
  const kind = KINDS.find((value) => value === params.get("kind")) ?? "all";
  const sort =
    SORTS.find((value) => value === params.get("sort")) ?? "discovery";
  const state: CatalogState = {
    q: params.get("q") ?? "",
    active: { status: [], assets: [], category: [] },
    kind,
    sort,
  };
  for (const key of KEYS) {
    state.active[key] = [...new Set(params.getAll(key))].filter((value) =>
      VALID[key].has(value),
    );
  }
  return state;
}

export function readFilterState(input: HTMLInputElement): CatalogState {
  const state = parseCatalogState(window.location.search);
  input.value = state.q;
  return state;
}

export function catalogQuery(
  state: FilterState & Partial<CatalogState>,
): string {
  const params = new URLSearchParams();
  if (state.q.trim() !== "") params.set("q", state.q);
  if (state.kind && state.kind !== "all") params.set("kind", state.kind);
  if (state.sort && state.sort !== "discovery") params.set("sort", state.sort);
  for (const key of KEYS) {
    for (const value of state.active[key]) params.append(key, value);
  }
  return params.toString();
}

export function writeFilterState(
  state: CatalogState,
  mode: "push" | "replace",
): void {
  const query = catalogQuery(state);
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (
    url ===
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  )
    return;
  if (mode === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}
