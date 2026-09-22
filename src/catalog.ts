import { filterPorts } from "./filter";
import type { FilterState, Port } from "./types";

export const KINDS = ["all", "game", "app", "engine"] as const;
export type Kind = (typeof KINDS)[number];
export const SORTS = ["discovery", "name", "name-desc"] as const;
export type Sort = (typeof SORTS)[number];
export interface CatalogState extends FilterState {
  kind: Kind;
  sort: Sort;
}

export function portKind(port: Port): Exclude<Kind, "all"> {
  if (port.categories.includes("app")) return "app";
  if (port.categories.includes("engine")) return "engine";
  return "game";
}

export function sortCatalog(ports: Port[], sort: Sort): Port[] {
  const order = { game: 0, app: 1, engine: 2 };
  return [...ports].sort((a, b) => {
    const alphabetical = a.name.localeCompare(b.name);
    if (sort === "name") return alphabetical;
    if (sort === "name-desc") return -alphabetical;
    return order[portKind(a)] - order[portKind(b)] || alphabetical;
  });
}

export function selectCatalog(ports: Port[], state: CatalogState): Port[] {
  const filtered = filterPorts(ports, state).filter(
    (port) => state.kind === "all" || portKind(port) === state.kind,
  );
  return sortCatalog(filtered, state.sort);
}

export function pickPort(ports: Port[], previous?: Port): Port | undefined {
  const candidates =
    ports.length > 1 ? ports.filter((port) => port !== previous) : ports;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function relatedPorts(port: Port, ports: Port[]): Port[] {
  return ports
    .filter(
      (other) =>
        other.name !== port.name &&
        other.categories.some((category) => port.categories.includes(category)),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 3);
}
