import { parseHTML } from "linkedom";
import { afterEach, expect, it, vi } from "vitest";
import portsData from "../ports.json";
import { renderInspector } from "./inspector-view";
import { parsePorts } from "./schema";
import { adjacentPort, selectedPort } from "./selection";
import { slugify } from "./slug";

const ports = parsePorts(portsData);
afterEach(() => vi.unstubAllGlobals());

it("retains an inspected port through sorting but replaces it when filters exclude it", () => {
  const selected = ports[0];
  expect(selectedPort([...ports].reverse(), slugify(selected.name))).toBe(
    selected,
  );
  const filtered = ports.filter((port) => port !== selected);
  expect(selectedPort(filtered, slugify(selected.name))).toBe(filtered[0]);
  expect(selectedPort([], slugify(selected.name))).toBeUndefined();
  expect(selectedPort(ports, "not-in-catalog")).toBe(ports[0]);
});

it("moves only within the visible selection and stops at its boundaries", () => {
  const visible = ports.slice(0, 3);
  expect(adjacentPort(visible, visible[0], -1)).toBe(visible[0]);
  expect(adjacentPort(visible, visible[0], 1)).toBe(visible[1]);
  expect(adjacentPort(visible, visible[2], 1)).toBe(visible[2]);
  expect(adjacentPort([visible[0]], visible[0], 1)).toBe(visible[0]);
});

it("clears stale inspection links and requirements when the result set becomes empty", () => {
  const { document } = parseHTML("<html><body><aside></aside></body></html>");
  vi.stubGlobal("document", document);
  const panel = document.querySelector("aside");
  if (!panel) throw new Error("Missing fixture");
  renderInspector(ports[0], {}, panel);
  expect(panel.querySelectorAll("a").length).toBeGreaterThan(0);
  expect(panel.querySelector(".inspector-notes p")?.textContent).toBe(
    ports[0].notes,
  );
  renderInspector(undefined, {}, panel);
  expect(panel.querySelectorAll("a")).toHaveLength(0);
  expect(panel.querySelector(".inspector-facts")).toBeNull();
  expect(panel.querySelector("h2")?.textContent).toBe(
    "Nothing in this selection",
  );
});

it("does not present source-only software as an installable release", () => {
  const { document } = parseHTML("<html><body><aside></aside></body></html>");
  vi.stubGlobal("document", document);
  const panel = document.querySelector("aside");
  const source = ports.find((port) => port.status === "source-only");
  if (!panel || !source) throw new Error("Missing fixture");
  renderInspector(source, {}, panel, "preview-title");
  expect(panel.querySelector(".inspector-requirement")?.textContent).toContain(
    "No ready-to-install build",
  );
  expect(panel.querySelector('a[target="_blank"]')?.textContent).toBe(
    "Source code",
  );
  expect(panel.querySelector('a[target="_blank"]')?.getAttribute("href")).toBe(
    source.upstream,
  );
  expect(panel.querySelector("h2")?.id).toBe("preview-title");
});
