import { execSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { parseHTML } from "linkedom";
import { describe, expect, it, vi } from "vitest";
import { renderPort } from "../src/port-view";
import { parsePorters, parsePorts } from "../src/schema";
import { slugify } from "../src/slug";
import type { Port, Porter } from "../src/types";
import {
  addUniqueSlug,
  buildDetailPage,
  generatePages,
  porterSeo,
  portSeo,
} from "./gen-pages";

const SITE = "https://producdevity.github.io/MiyooMini-Ports";

const TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Port · Miyoo Mini Ports</title>
    <meta name="description" content="template description" />
    <meta property="og:title" content="Port · Miyoo Mini Ports" />
    <meta property="og:description" content="template description" />
    <!-- seo:canonical -->
    <link rel="stylesheet" href="/MiyooMini-Ports/assets/schema-x.css" />
  </head>
  <body>
    <main class="wrap" id="detail"></main>
  </body>
</html>`;

const SEO = {
  title: "Fake Port · Miyoo Mini Ports",
  description: "Fake Port description",
  url: `${SITE}/port/fake-port/`,
  image: "https://example.com/cover.png",
};

describe("buildDetailPage", () => {
  it("replaces title, description, and og tags", () => {
    const page = buildDetailPage(TEMPLATE, SEO);
    expect(page).toContain(`<title>${SEO.title}</title>`);
    expect(page).toContain(
      'name="description" content="Fake Port description"',
    );
    expect(page).toContain(
      'property="og:description" content="Fake Port description"',
    );
    expect(page).not.toContain("template description");
  });

  it("inserts the canonical block", () => {
    const page = buildDetailPage(TEMPLATE, SEO);
    expect(page).toContain(`<link rel="canonical" href="${SEO.url}" />`);
    expect(page).toContain(`<meta property="og:url" content="${SEO.url}" />`);
    expect(page).toContain(
      `<meta property="og:image" content="${SEO.image}" />`,
    );
    expect(page).not.toContain("<!-- seo:canonical -->");
    expect(page).not.toContain("<noscript>");
  });

  it("escapes HTML in meta values", () => {
    const page = buildDetailPage(TEMPLATE, {
      ...SEO,
      description: 'a "quoted" & <tagged> description',
    });
    expect(page).toContain(
      'content="a &quot;quoted&quot; &amp; &lt;tagged&gt; description"',
    );
  });

  it("throws when the vite base is missing from asset URLs", () => {
    expect(() =>
      buildDetailPage(
        TEMPLATE.replace('href="/MiyooMini-Ports/assets/', 'href="/assets/'),
        SEO,
      ),
    ).toThrow("base is not baked");
  });

  it("throws when a template marker is missing", () => {
    expect(() =>
      buildDetailPage(TEMPLATE.replace("<!-- seo:canonical -->", ""), SEO),
    ).toThrow("canonical mark");
  });
});

const port: Port = {
  name: "Fake Port",
  categories: ["rpg", "simulation"],
  status: "playable",
  assets: "owned",
  porter: ["TestHandle"],
  upstream: "https://example.com/releases?ch=1&lang=en",
  image: "https://example.com/cover.png",
  notes: 'Setup needs "game data" & patience.',
};

const porter: Porter = { github: "https://github.com/TestHandle" };

describe("portSeo", () => {
  it("builds the description from catalog data", () => {
    const { seo } = portSeo(port, { TestHandle: porter });
    expect(seo.description).toContain("Fake Port — Playable RPG / Simulation");
    expect(seo.description).toContain("by TestHandle");
    expect(seo.description).toContain(port.notes);
  });

  it("passes through raster images and falls back for SVG", () => {
    expect(portSeo(port, {}).seo.image).toBe(port.image);
    expect(
      portSeo({ ...port, image: "https://example.com/i.svg" }, {}).seo.image,
    ).toBe(`${SITE}/icon-512.png`);
    expect(
      portSeo({ ...port, image: "https://example.com/i.svg?v=2" }, {}).seo
        .image,
    ).toBe(`${SITE}/icon-512.png`);
  });

  it("renders untrusted catalog text as text and encodes links", () => {
    const { document } = parseHTML("<html><body><main></main></body></html>");
    vi.stubGlobal("document", document);
    try {
      const hostile = {
        ...port,
        name: '<img src=x onerror="bad()">',
        porter: ['"onclick="x'],
      };
      const main = document.querySelector("main");
      if (!main) throw new Error("missing main");
      renderPort(hostile, [hostile], {}, main as unknown as HTMLElement);
      expect(main.querySelector("h1")?.textContent).toBe(hostile.name);
      expect(main.querySelector("h1 img")).toBeNull();
      expect(
        main.querySelector(".detail-by a")?.getAttribute("href"),
      ).toContain("porter/%22onclick%3D%22x/");
      expect(main.querySelector(".stamp")?.getAttribute("href")).toBe(
        port.upstream,
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("porterSeo", () => {
  const owned = (names: string[]): Port[] =>
    names.map((name, i) => ({
      ...port,
      name,
      upstream: `https://example.com/${i}`,
    }));

  it("lists ports by name and collapses long lists", () => {
    expect(porterSeo("h", porter, owned(["One"])).description).toContain(
      "porter of One for the Miyoo Mini",
    );
    expect(porterSeo("h", porter, owned(["One", "Two"])).description).toContain(
      "porter of One and Two",
    );
    expect(
      porterSeo("h", porter, owned(["One", "Two", "Three", "Four"]))
        .description,
    ).toContain("One, Two, Three, and 1 more");
  });

  it("falls back to a count line for porters with no ports", () => {
    expect(porterSeo("h", porter, []).description).not.toContain("porter of");
  });

  it("accepts handles with spaces and encodes the canonical URL", () => {
    const profiles = parsePorters({ porters: { "A B": porter } });
    expect(porterSeo("A B", profiles["A B"], []).url).toBe(
      `${SITE}/porter/A%20B/`,
    );
  });

  it("rejects path separators and Windows-invalid filename characters", () => {
    for (const handle of [
      "",
      ".",
      "..",
      "a/b",
      "a\\b",
      "C:foo",
      "D:foo",
      "a*b",
      "a?b",
      'a"b',
      "a<b",
      "a>b",
      "a|b",
    ]) {
      expect(() => parsePorters({ porters: { [handle]: porter } })).toThrow(
        "single directory name",
      );
    }
  });

  it("uses the avatar when present and the site icon otherwise", () => {
    expect(
      porterSeo("h", { ...porter, image: "https://x/y.png" }, []).image,
    ).toBe("https://x/y.png");
    expect(porterSeo("h", porter, []).image).toBe(`${SITE}/icon-512.png`);
  });
});

describe("addUniqueSlug", () => {
  it("accepts fresh slugs and rejects collisions and empties", () => {
    const seen = new Set<string>();
    addUniqueSlug("one", "One", seen);
    expect(() => addUniqueSlug("one", "Two", seen)).toThrow(
      'slug collision on "one" (Two)',
    );
    expect(() => addUniqueSlug("", "No Slug", new Set())).toThrow("empty slug");
  });
});

it("writes raw directory names while encoding links and sitemap URLs", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "miyoo-pages-"));
  try {
    const template = TEMPLATE.replace(
      "<body>",
      '<body><nav id="site-nav"></nav>',
    );
    for (const file of [
      "index.html",
      "porters.html",
      "port.html",
      "porter.html",
    ]) {
      writeFileSync(resolve(dir, file), template);
    }
    generatePages([{ ...port, porter: ["A B"] }], { "A B": porter }, dir);
    const page = readFileSync(resolve(dir, "porter/A B/index.html"), "utf8");
    expect(page).toContain(`${SITE}/porter/A%20B/`);
    expect(readFileSync(resolve(dir, "sitemap.xml"), "utf8")).toContain(
      `${SITE}/porter/A%20B/`,
    );
    expect(
      readFileSync(resolve(dir, "port/fake-port/index.html"), "utf8"),
    ).toContain('href="/MiyooMini-Ports/porter/A%20B/"');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("build output", () => {
  const ROOT = resolve(import.meta.dirname, "..");

  it("generates crawlable pages and a sitemap from real data", {
    timeout: 120_000,
  }, () => {
    // CI builds in the preceding Build step; locally always rebuild so
    // stale output is never asserted.
    if (process.env.GEN_PAGES_TEST_SKIP_BUILD === undefined) {
      execSync("pnpm build", { cwd: ROOT, stdio: "pipe" });
    }

    const ports = parsePorts(
      JSON.parse(readFileSync(resolve(ROOT, "ports.json"), "utf8")),
    );
    const porters = parsePorters(
      JSON.parse(readFileSync(resolve(ROOT, "porters.json"), "utf8")),
    );
    const read = (file: string) =>
      parseHTML(readFileSync(resolve(ROOT, "dist", file), "utf8")).document;
    const catalog = read("index.html");
    expect(catalog.querySelectorAll(".row")).toHaveLength(ports.length);
    expect(
      read("porters.html").querySelectorAll("article.porter"),
    ).toHaveLength(Object.keys(porters).length);
    for (const link of read("porters.html").querySelectorAll(
      ".porter-avatar-link",
    )) {
      expect(link.getAttribute("aria-hidden")).toBeNull();
      expect(link.getAttribute("tabindex")).toBeNull();
      expect(link.getAttribute("aria-label")).toMatch(/^View .+ profile$/);
    }
    for (const port of ports) {
      const slug = slugify(port.name);
      const page = read(`port/${slug}/index.html`);
      expect(page.querySelectorAll("h1")).toHaveLength(1);
      expect(page.querySelector("h1")?.textContent).toBe(port.name);
      expect(page.querySelector(".detail-notes")?.textContent).toBe(port.notes);
      expect(page.querySelector(".spec")?.textContent).toContain("Assets");
      expect(page.querySelector(".stamp")?.getAttribute("href")).toBe(
        port.upstream,
      );
      expect(
        page.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ).toBe(`${SITE}/port/${slug}/`);
      expect(page.querySelector("noscript")).toBeNull();
      expect(page.querySelector('meta[name="robots"]')).toBeNull();
      expect(
        catalog.querySelector(`a[href="/MiyooMini-Ports/port/${slug}/"]`),
      ).not.toBeNull();
    }
    for (const [handle, porter] of Object.entries(porters)) {
      const page = read(`porter/${handle}/index.html`);
      expect(page.querySelectorAll("h1")).toHaveLength(1);
      expect(page.querySelector("h1")?.textContent).toBe(porter.name ?? handle);
      expect(page.querySelectorAll(".porter-ports li")).toHaveLength(
        ports.filter((p) => p.porter.includes(handle)).length,
      );
      expect(
        page.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ).toBe(`${SITE}/porter/${encodeURIComponent(handle)}/`);
    }
    for (const file of [
      "index.html",
      "porters.html",
      "port.html",
      "porter.html",
    ]) {
      const page = read(file);
      expect(page.querySelectorAll("#site-nav a")).toHaveLength(3);
      for (const asset of page.querySelectorAll(
        'script[src], link[rel="stylesheet"]',
      )) {
        const url =
          asset.getAttribute("src") ?? asset.getAttribute("href") ?? "";
        expect(url).toMatch(/^\/MiyooMini-Ports\/assets\//);
        expect(
          readFileSync(
            resolve(ROOT, "dist", url.replace("/MiyooMini-Ports/", "")),
          ).length,
        ).toBeGreaterThan(0);
      }
    }
    expect(
      read("port.html")
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content"),
    ).toBe("noindex");
    const slug = slugify(ports[0].name);
    const handle = Object.keys(porters)[0];

    const sitemap = readFileSync(resolve(ROOT, "dist/sitemap.xml"), "utf8");
    const expectedCount = 2 + ports.length + Object.keys(porters).length;
    expect(sitemap.match(/<loc>/g)).toHaveLength(expectedCount);
    expect(sitemap).toContain(`${SITE}/port/${slug}/`);
    expect(sitemap).toContain(`${SITE}/porter/${encodeURIComponent(handle)}/`);

    expect(existsSync(resolve(ROOT, "dist/robots.txt"))).toBe(false);
  });
});
