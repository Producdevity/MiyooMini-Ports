import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { slugify } from "../src/slug";
import type { Port, Porter } from "../src/types";
import {
  addUniqueSlug,
  buildDetailPage,
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
  noscript: "<noscript>by TestHandle</noscript>",
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

  it("inserts the canonical block and noscript content", () => {
    const page = buildDetailPage(TEMPLATE, SEO);
    expect(page).toContain(`<link rel="canonical" href="${SEO.url}" />`);
    expect(page).toContain(`<meta property="og:url" content="${SEO.url}" />`);
    expect(page).toContain(
      `<meta property="og:image" content="${SEO.image}" />`,
    );
    expect(page).not.toContain("<!-- seo:canonical -->");
    expect(page).toMatch(/<main class="wrap" id="detail">\s*<noscript>/);
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

  it("escapes markup in the noscript block and encodes hrefs", () => {
    const hostile: Port = {
      ...port,
      porter: ['"onclick="x'],
      upstream: "https://example.com/r?amp=1&and=2",
    };
    const noscript = portSeo(hostile, {}).seo.noscript;
    expect(noscript).toContain("porter/%22onclick%3D%22x/");
    expect(noscript).toContain("r?amp=1&amp;and=2");
    expect(noscript).toContain("&quot;onclick=&quot;x</a>");
    expect(noscript).not.toContain('porter/"onclick');
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

describe("build output", () => {
  const ROOT = resolve(import.meta.dirname, "..");

  // CI builds before running the tests; rebuild locally only when the
  // generated output is older than everything that shapes it.
  const buildIsStale = (): boolean => {
    const marker = statSync(resolve(ROOT, "dist/sitemap.xml"), {
      throwIfNoEntry: false,
    });
    if (marker === undefined) return true;
    return [
      "ports.json",
      "porters.json",
      "index.html",
      "porters.html",
      "port.html",
      "porter.html",
      "vite.config.ts",
      "scripts/gen-pages.ts",
    ].some((f) => statSync(resolve(ROOT, f)).mtimeMs > marker.mtimeMs);
  };

  it("generates detail pages, sitemap, and robots from real data", {
    timeout: 120_000,
  }, () => {
    if (buildIsStale()) {
      execSync("pnpm build", { cwd: ROOT, stdio: "pipe" });
    }

    const ports = JSON.parse(readFileSync(resolve(ROOT, "ports.json"), "utf8"))
      .ports as { name: string }[];
    const porters = JSON.parse(
      readFileSync(resolve(ROOT, "porters.json"), "utf8"),
    ).porters as Record<string, unknown>;

    const first = ports[0];
    const slug = slugify(first.name);
    const handle = Object.keys(porters)[0];

    const page = readFileSync(
      resolve(ROOT, `dist/port/${slug}/index.html`),
      "utf8",
    );
    expect(page).toContain(`<title>${first.name} · Miyoo Mini Ports</title>`);
    expect(page).toContain(
      `<link rel="canonical" href="${SITE}/port/${slug}/" />`,
    );
    expect(page).toContain('name="twitter:card" content="summary_large_image"');
    expect(page).toMatch(/<main class="wrap" id="detail">\s*<noscript>/);

    const shell = readFileSync(resolve(ROOT, "dist/port.html"), "utf8");
    expect(shell).toContain('<meta name="robots" content="noindex" />');

    const sitemap = readFileSync(resolve(ROOT, "dist/sitemap.xml"), "utf8");
    const expectedCount = 2 + ports.length + Object.keys(porters).length;
    expect(sitemap.match(/<loc>/g)).toHaveLength(expectedCount);
    expect(sitemap).toContain(`${SITE}/port/${slug}/`);
    expect(sitemap).toContain(`${SITE}/porter/${handle}/`);

    const robots = readFileSync(resolve(ROOT, "dist/robots.txt"), "utf8");
    expect(robots).toBe(
      `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
    );
  });
});
