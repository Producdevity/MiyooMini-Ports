import type { FilterKey, FilterState } from "./types";
import { ASSETS_VALUES, CATEGORY_VALUES, STATUS_VALUES } from "./types";

const VALID: Record<FilterKey, ReadonlySet<string>> = {
  status: new Set(STATUS_VALUES),
  assets: new Set(ASSETS_VALUES),
  category: new Set(CATEGORY_VALUES),
};

const KEYS: readonly FilterKey[] = ["status", "assets", "category"];

export function readFilterState(input: HTMLInputElement): FilterState {
  const params = new URLSearchParams(window.location.search);
  const state: FilterState = {
    q: params.get("q") ?? "",
    active: { status: [], assets: [], category: [] },
  };
  for (const key of KEYS) {
    const seen = new Set<string>();
    for (const value of params.getAll(key)) {
      if (!VALID[key].has(value) || seen.has(value)) continue;
      seen.add(value);
      state.active[key].push(value);
    }
  }
  input.value = state.q;
  return state;
}

export function writeFilterState(state: FilterState): void {
  const params = new URLSearchParams();
  if (state.q.trim() !== "") params.set("q", state.q);
  for (const key of KEYS) {
    for (const value of state.active[key]) params.append(key, value);
  }
  const query = params.toString();
  const url = `${window.location.pathname}${query === "" ? "" : `?${query}`}`;
  window.history.replaceState(null, "", url);
}
