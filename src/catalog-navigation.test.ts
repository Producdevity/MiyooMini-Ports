import { afterEach, expect, it, vi } from "vitest";
import {
  libraryReturnUrl,
  readCatalogSelection,
  rememberCatalog,
  rememberCatalogSelection,
} from "./catalog-navigation";
import { SITE_BASE } from "./routes";
import { parseCatalogState } from "./urlstate";

afterEach(() => vi.unstubAllGlobals());

it("returns to the current session's search, filters and sort", () => {
  const saved = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    setItem: (key: string, value: string) => saved.set(key, value),
    getItem: (key: string) => saved.get(key) ?? null,
  });
  rememberCatalog(
    parseCatalogState("q=Balatro&kind=game&sort=name&status=playable"),
  );
  expect(libraryReturnUrl()).toBe(
    `${SITE_BASE}?q=Balatro&kind=game&sort=name&status=playable#library`,
  );
  rememberCatalog(parseCatalogState(""));
  expect(libraryReturnUrl()).toBe(`${SITE_BASE}#library`);
});

it("keeps return links inside the catalog and removes invalid filters", () => {
  vi.stubGlobal("sessionStorage", {
    getItem: () => "https://example.com/?kind=invalid&status=missing&q=RPG",
  });
  expect(libraryReturnUrl()).toBe(`${SITE_BASE}?q=RPG#library`);
});

it("keeps navigation usable when session storage is blocked", () => {
  vi.stubGlobal("sessionStorage", {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  });
  expect(() => rememberCatalog(parseCatalogState("q=RPG"))).not.toThrow();
  expect(libraryReturnUrl()).toBe(`${SITE_BASE}#library`);
  expect(readCatalogSelection()).toBeNull();
  expect(() => rememberCatalogSelection("balatro")).not.toThrow();
});

it("returns to the opened card and rejects unsafe saved anchors", () => {
  const saved = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    setItem: (key: string, value: string) => saved.set(key, value),
    getItem: (key: string) => saved.get(key) ?? null,
  });
  expect(readCatalogSelection()).toBeNull();
  rememberCatalogSelection("stardew-valley");
  expect(readCatalogSelection()).toBe("stardew-valley");
  expect(libraryReturnUrl()).toBe(`${SITE_BASE}#port-stardew-valley`);
  rememberCatalogSelection("//example.com/#bad");
  expect(libraryReturnUrl()).toBe(`${SITE_BASE}#library`);
});
