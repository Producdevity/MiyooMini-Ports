import type { FilterKey, FilterState, Port } from "./types";
import { CATEGORY_LABELS, STATUS_LABELS } from "./types";

const FILTER_KEYS: readonly FilterKey[] = ["status", "assets", "category"];

export function matches(port: Port, state: FilterState): boolean {
  const q = state.q.trim().toLowerCase();
  if (q) {
    const haystack = [
      port.name,
      port.categories.join(" "),
      ...port.categories.map((c) => CATEGORY_LABELS[c]),
      port.notes,
      port.porter.join(" "),
      port.status,
      STATUS_LABELS[port.status],
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (
    state.active.category.length > 0 &&
    !port.categories.some((c) => state.active.category.includes(c))
  ) {
    return false;
  }
  for (const key of FILTER_KEYS) {
    if (key === "category") continue;
    const want = state.active[key];
    if (want.length > 0 && !want.includes(port[key])) return false;
  }
  return true;
}

export function filterPorts(ports: Port[], state: FilterState): Port[] {
  return ports.filter((p) => matches(p, state));
}
