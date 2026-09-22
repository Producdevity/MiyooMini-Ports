import { afterEach, describe, expect, it, vi } from "vitest";
import portsData from "../ports.json";
import { pickPort, portKind, selectCatalog, sortCatalog } from "./catalog";
import { parsePorts } from "./schema";
import { readPreference, savePreference } from "./storage";
import { catalogQuery, parseCatalogState } from "./urlstate";

const ports = parsePorts(portsData);
afterEach(() => vi.unstubAllGlobals());

describe("catalog discovery", () => {
  it("separates games, apps, and engines without dropping or duplicating records", () => {
    const kinds = ["game", "app", "engine"] as const;
    const groups = kinds.map((kind) =>
      selectCatalog(ports, { ...parseCatalogState(""), kind }),
    );
    expect(groups.map((group) => group.length)).toEqual([23, 30, 2]);
    expect(new Set(groups.flat())).toEqual(new Set(ports));
    expect(groups[0].every((port) => portKind(port) === "game")).toBe(true);
  });

  it("combines kind, search, status and asset requirements", () => {
    const state = parseCatalogState(
      "kind=game&q=fallout&status=playable&assets=owned",
    );
    expect(selectCatalog(ports, state).map((port) => port.name)).toEqual([
      "Fallout",
      "Fallout 2",
    ]);
    expect(selectCatalog(ports, { ...state, kind: "app" })).toEqual([]);
    expect(
      selectCatalog(ports, {
        ...state,
        active: { ...state.active, assets: ["free"] },
      }),
    ).toEqual([]);
  });

  it("matches any selected category or status, and intersects different filter groups", () => {
    const state = parseCatalogState(
      "category=rpg&category=simulation&status=experimental&status=prerelease&assets=owned",
    );
    const result = selectCatalog(ports, state);
    expect(result.map((port) => port.name)).toEqual([
      "Insaniquarium Deluxe",
      "Minecraft: Bedrock Edition 1.2",
      "Stardew Valley",
    ]);
  });

  it("searches setup notes and porter handles regardless of case or surrounding whitespace", () => {
    expect(
      selectCatalog(ports, parseCatalogState("q=+FONT.DAT+")).map(
        (port) => port.name,
      ),
    ).toEqual(["3D Pinball Space Cadet"]);
    expect(
      selectCatalog(ports, parseCatalogState("q=COBALTGIT")).map(
        (port) => port.name,
      ),
    ).toEqual(["Undertale"]);
  });

  it("sorts both directions and puts games before apps without mutating catalog data", () => {
    const original = [...ports];
    const alphabetical = sortCatalog(ports, "name");
    expect(sortCatalog(ports, "name-desc")).toEqual(
      [...alphabetical].reverse(),
    );
    expect(
      sortCatalog(ports, "discovery")
        .slice(0, 23)
        .every((port) => portKind(port) === "game"),
    ).toBe(true);
    expect(ports).toEqual(original);
  });

  it("does not repeat a surprise when alternatives exist and handles empty or singleton selections", () => {
    expect(pickPort([])).toBeUndefined();
    expect(pickPort([ports[0]], ports[0])).toBe(ports[0]);
    expect(pickPort([ports[0], ports[1]], ports[0])).toBe(ports[1]);
  });
});

describe("shareable browsing state", () => {
  it("round-trips unicode search, multiple filters, kind, and sort", () => {
    const state = parseCatalogState(
      "q=Jazz%C2%B2+%26+ports&kind=game&sort=name-desc&category=rpg&category=simulation&status=experimental&assets=owned",
    );
    expect(parseCatalogState(catalogQuery(state))).toEqual(state);
  });

  it("rejects unsupported values and deduplicates filter parameters", () => {
    expect(
      parseCatalogState(
        "kind=unknown&sort=newest&status=playable&status=playable&status=verified&assets=pirated&category=missing",
      ),
    ).toEqual({
      q: "",
      kind: "all",
      sort: "discovery",
      active: { status: ["playable"], assets: [], category: [] },
    });
  });

  it("keeps the default URL clean", () => {
    expect(catalogQuery(parseCatalogState(""))).toBe("");
  });
});

describe("optional preferences", () => {
  it("keeps the site usable when storage is blocked", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(readPreference("theme")).toBeNull();
    expect(savePreference("theme", "dark")).toBe(false);
  });
});
