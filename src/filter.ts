import type { FilterState, Port } from "./types";
import { CATEGORY_LABELS, STATUS_LABELS } from "./types";

const FILTER_KEYS = ["status", "assets", "category"] as const;

export function matches(port: Port, state: FilterState): boolean {
  const q = state.q.trim().toLowerCase();
  if (q) {
    const haystack = [
      port.name,
      port.category,
      CATEGORY_LABELS[port.category],
      port.notes,
      port.status,
      STATUS_LABELS[port.status],
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  for (const key of FILTER_KEYS) {
    const want = state.active[key];
    if (want !== undefined && want !== port[key]) return false;
  }
  return true;
}

export function filterPorts(ports: Port[], state: FilterState): Port[] {
  return ports.filter((p) => matches(p, state));
}
