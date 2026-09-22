import { parseHTML } from "linkedom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderImage } from "./components";
import { renderPort } from "./port-view";
import { renderPorter } from "./porter-view";
import type { Port } from "./types";

const port: Port = {
  name: "Example Port",
  categories: ["rpg"],
  status: "experimental",
  assets: "owned",
  porter: ["maker"],
  upstream: "https://example.com/releases",
  image: "https://example.com/art.png",
  notes: "Mini Flip only. Mini and Mini Plus are untested.",
};

beforeEach(() => {
  const { document } = parseHTML(
    "<html><head></head><body><main></main></body></html>",
  );
  vi.stubGlobal("document", document);
});
afterEach(() => vi.unstubAllGlobals());

function main(): HTMLElement {
  const element = document.querySelector("main");
  if (!element) throw new Error("missing fixture");
  return element;
}

describe("installation guidance", () => {
  it("preserves compatibility warnings and distinguishes owned data from the port itself", () => {
    renderPort(port, [port], {}, main());
    expect(document.querySelector(".detail-notes")?.textContent).toBe(
      port.notes,
    );
    expect(document.querySelector(".asset-guidance")?.textContent).toContain(
      "copy you own",
    );
    expect(document.querySelector(".status-guidance")?.textContent).toContain(
      "experimental port",
    );
    expect(document.querySelector(".stamp")?.getAttribute("href")).toBe(
      port.upstream,
    );
    expect(document.querySelector(".plate-img")?.getAttribute("loading")).toBe(
      "eager",
    );
  });

  it("does not offer a release download for source-only entries", () => {
    renderPort({ ...port, status: "source-only" }, [port], {}, main());
    expect(document.querySelector(".stamp")?.textContent).toBe(
      "View source code",
    );
    expect(document.querySelector(".status-guidance")?.textContent).toContain(
      "No ready-to-install build",
    );
  });

  it("explains free assets without promising installation-free software", () => {
    renderPort({ ...port, assets: "free" }, [port], {}, main());
    expect(document.querySelector(".asset-guidance")?.textContent).toContain(
      "No purchased game data is required",
    );
    expect(document.querySelector(".asset-guidance")?.textContent).toContain(
      "setup steps",
    );
  });
});

it("shows every credited port and only supplied profile information", () => {
  const profile = { name: "A Maker", github: "https://github.com/maker" };
  renderPorter(
    "maker",
    profile,
    [port, { ...port, name: "Another Port" }],
    main(),
  );
  expect(document.querySelectorAll(".porter-ports li")).toHaveLength(2);
  expect(document.querySelector(".porter-bio")).toBeNull();
  expect(document.querySelectorAll(".profile-links a")).toHaveLength(1);
  expect(document.querySelector("h1")?.textContent).toBe("A Maker");
});

it("replaces failed artwork without dropping its accessible description", () => {
  const image = renderImage(port.image, "plate-img", "Example Port artwork");
  main().append(image);
  const window = document.defaultView;
  if (!window) throw new Error("missing fixture window");
  const event = new window.Event("error");
  image.dispatchEvent(event);
  const fallback = document.querySelector(".image-fallback");
  expect(fallback?.getAttribute("role")).toBe("img");
  expect(fallback?.getAttribute("aria-label")).toBe("Example Port artwork");
  expect(fallback?.textContent).toContain("Artwork unavailable");
  expect(document.querySelectorAll("img")).toHaveLength(0);
});
