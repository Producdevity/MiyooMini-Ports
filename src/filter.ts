import type { FilterKey, FilterState, Port } from "./types";

export function matches(port: Port, state: FilterState): boolean {
  const q = state.q.trim().toLowerCase();
  if (q) {
    const haystack = [port.name, port.category, port.notes, port.status]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  for (const key of Object.keys(state.active) as FilterKey[]) {
    const want = state.active[key];
    if (want && port[key] !== want) return false;
  }
  return true;
}

export function filterPorts(ports: Port[], state: FilterState): Port[] {
  return ports.filter((p) => matches(p, state));
}
