export type Status = "playable" | "experimental" | "prerelease" | "source-only";

export type Assets = "free" | "owned";

export type Category =
  | "app"
  | "arcade"
  | "engine"
  | "fps"
  | "platform"
  | "puzzle"
  | "racing"
  | "reflex"
  | "rpg"
  | "shooter"
  | "simulation";

export interface Porter {
  name?: string;
  github: string;
  social?: string;
  website?: string;
  donate?: string;
  bio?: string;
  image?: string;
}

export type Porters = Record<string, Porter>;

export interface Port {
  name: string;
  category: Category;
  status: Status;
  assets: Assets;
  porter: string[];
  upstream: string;
  image?: string;
  notes: string;
}

export type FilterKey = "status" | "assets" | "category";

export interface FilterState {
  q: string;
  active: Partial<Record<FilterKey, string>>;
}

// Chip order follows these arrays; don't reorder.
export const STATUS_VALUES = [
  "playable",
  "experimental",
  "prerelease",
  "source-only",
] as const;

export const ASSETS_VALUES = ["free", "owned"] as const;

export const CATEGORY_VALUES = [
  "app",
  "arcade",
  "engine",
  "fps",
  "platform",
  "puzzle",
  "racing",
  "reflex",
  "rpg",
  "shooter",
  "simulation",
] as const;

export const STATUS_LABELS: Record<Status, string> = {
  playable: "Playable",
  experimental: "Experimental",
  prerelease: "Prerelease",
  "source-only": "Source only",
};

export const ASSETS_LABELS: Record<Assets, string> = {
  free: "Free",
  owned: "Owned data",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  app: "App",
  arcade: "Arcade",
  engine: "Engine",
  fps: "FPS",
  platform: "Platform",
  puzzle: "Puzzle",
  racing: "Racing",
  reflex: "Reflex",
  rpg: "RPG",
  shooter: "Shooter",
  simulation: "Simulation",
};

const LABELS: Record<FilterKey, Record<string, string>> = {
  status: STATUS_LABELS,
  assets: ASSETS_LABELS,
  category: CATEGORY_LABELS,
};

export function labelFor(key: FilterKey, value: string): string {
  return LABELS[key][value] ?? value;
}

export function sortByCategoryThenName(a: Port, b: Port): number {
  return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
}
