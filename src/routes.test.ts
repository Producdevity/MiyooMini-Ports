import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type * as routesModule from "./routes";

// Vitest forces base "/" in the test environment; stub the project base
// before the module captures import.meta.env.BASE_URL.
vi.stubEnv("BASE_URL", "/MiyooMini-Ports/");

let routes: typeof routesModule;
beforeAll(async () => {
  routes = await import("./routes");
});

const at = (pathname: string): void => {
  vi.stubGlobal("window", { location: { pathname } });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("detailSlug", () => {
  it("reads the slug from port paths", () => {
    at("/port/undertale/");
    expect(routes.detailSlug("port")).toBe("undertale");
  });

  it("reads the slug without a trailing slash", () => {
    at("/port/undertale");
    expect(routes.detailSlug("port")).toBe("undertale");
  });

  it("matches the suffix regardless of the mount point", () => {
    at("/MiyooMini-Ports/port/stardew-valley/");
    expect(routes.detailSlug("port")).toBe("stardew-valley");
  });

  it("decodes percent-encoded slugs", () => {
    at("/port/stardew%2Dvalley/");
    expect(routes.detailSlug("port")).toBe("stardew-valley");
  });

  it("keeps port and porter kinds apart", () => {
    at("/porter/cobaltgit/");
    expect(routes.detailSlug("porter")).toBe("cobaltgit");
    expect(routes.detailSlug("port")).toBeNull();
  });

  it("returns null for non-detail paths", () => {
    at("/MiyooMini-Ports/index.html");
    expect(routes.detailSlug("port")).toBeNull();
    expect(routes.detailSlug("porter")).toBeNull();
  });

  it("returns null instead of throwing on malformed escapes", () => {
    at("/port/%/");
    expect(routes.detailSlug("port")).toBeNull();
  });
});

describe("portUrl", () => {
  it("builds a base-absolute URL from the slugified name", () => {
    expect(routes.portUrl("Stardew Valley")).toBe(
      "/MiyooMini-Ports/port/stardew-valley/",
    );
  });

  it("slugifies punctuation out of names", () => {
    expect(routes.portUrl("Minecraft: Bedrock Edition 1.2")).toBe(
      "/MiyooMini-Ports/port/minecraft-bedrock-edition-12/",
    );
  });
});

describe("porterUrl", () => {
  it("builds a base-absolute URL from the handle", () => {
    expect(routes.porterUrl("Producdevity")).toBe(
      "/MiyooMini-Ports/porter/Producdevity/",
    );
  });

  it("encodes handles that are not URL-safe", () => {
    expect(routes.porterUrl("a b")).toBe("/MiyooMini-Ports/porter/a%20b/");
  });
});
