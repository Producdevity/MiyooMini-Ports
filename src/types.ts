export type Status = "playable" | "experimental" | "prerelease" | "source only";

export type Assets = "free" | "owned";

export interface Port {
  name: string;
  category: string;
  status: Status;
  assets: Assets;
  upstream: string;
  image?: string;
  notes: string;
}

export type FilterKey = "status" | "assets" | "category";

export interface FilterState {
  q: string;
  active: Partial<Record<FilterKey, string>>;
}

// Display order is significant — chips render in this order.
export const STATUS_VALUES = [
  "playable",
  "experimental",
  "prerelease",
  "source only",
] as const;

export const ASSETS_VALUES = ["free", "owned"] as const;

export function categoryValues(ports: Port[]): string[] {
  return [...new Set(ports.map((p) => p.category))].sort();
}
