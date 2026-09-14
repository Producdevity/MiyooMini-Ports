import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseHTML } from "linkedom";
import { type NavPage, renderSiteNav } from "../src/nav";
import { renderPort } from "../src/port-view";
import { renderPorter } from "../src/porter-view";
import { renderPorterCard } from "../src/porters-view";
import { renderList } from "../src/render";
import { porterUrl, portUrl } from "../src/routes";
import { parsePorters, parsePorts } from "../src/schema";
import { SITE_BASE, SITE_URL } from "../src/site";
import { slugify } from "../src/slug";
import type { Port, Porters } from "../src/types";
import { CATEGORY_LABELS, STATUS_LABELS } from "../src/types";

const DIST = resolve(import.meta.dirname, "..", "dist");
const CANONICAL_MARK = "<!-- seo:canonical -->";

function loadPorts(): Port[] {
  const raw: unknown = JSON.parse(
    readFileSync(resolve(DIST, "..", "ports.json"), "utf8"),
  );
  return parsePorts(raw);
}

function loadPorters(): Porters {
  const raw: unknown = JSON.parse(
    readFileSync(resolve(DIST, "..", "porters.json"), "utf8"),
  );
  return parsePorters(raw);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function assertOne(text: string, pattern: RegExp, label: string): void {
  const count = text.match(new RegExp(pattern.source, "g"))?.length ?? 0;
  if (count !== 1) {
    throw new Error(`detail template: expected one ${label}, found ${count}`);
  }
}

function canonicalBlock(url: string, image: string): string {
  const href = escapeHtml(url);
  return [
    `<link rel="canonical" href="${href}" />`,
    `<meta property="og:url" content="${href}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
  ].join("\n    ");
}

// Unfurl consumers (Discord, X) don't render SVG images.
function ogImage(url: string): string {
  return new URL(url).pathname.toLowerCase().endsWith(".svg")
    ? `${SITE_URL}/icon-512.png`
    : url;
}

interface DetailSeo {
  title: string;
  description: string;
  url: string;
  image: string;
}

const TITLE = /<title>[^<]*<\/title>/;
const DESCRIPTION = /<meta\s+name="description"\s+content="[^"]*"/;
const OG_TITLE = /<meta\s+property="og:title"\s+content="[^"]*"/;
const OG_DESCRIPTION = /<meta\s+property="og:description"\s+content="[^"]*"/;

export function buildDetailPage(template: string, seo: DetailSeo): string {
  if (!template.includes(`href="${SITE_BASE}assets/`)) {
    throw new Error("detail template: vite base is not baked into asset URLs");
  }
  assertOne(template, TITLE, "title");
  assertOne(template, DESCRIPTION, "description");
  assertOne(template, OG_TITLE, "og:title");
  assertOne(template, OG_DESCRIPTION, "og:description");
  assertOne(template, new RegExp(CANONICAL_MARK), "canonical mark");

  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const page = template
    .replace(TITLE, () => `<title>${title}</title>`)
    .replace(
      DESCRIPTION,
      () => `<meta name="description" content="${description}"`,
    )
    .replace(OG_TITLE, () => `<meta property="og:title" content="${title}"`)
    .replace(
      OG_DESCRIPTION,
      () => `<meta property="og:description" content="${description}"`,
    )
    .replace(CANONICAL_MARK, () => canonicalBlock(seo.url, seo.image));

  return page;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  const lead = names.slice(0, -1).join(", ");
  return `${lead} and ${names.at(-1)}`;
}

export function portSeo(
  port: Port,
  porters: Porters,
): { slug: string; seo: DetailSeo } {
  const slug = slugify(port.name);
  const porterNames = port.porter
    .map((handle) => porters[handle]?.name ?? handle)
    .join(", ");
  const categories = port.categories.map((c) => CATEGORY_LABELS[c]).join(" / ");

  const description = `${port.name} — ${STATUS_LABELS[port.status]} ${categories} port for the Miyoo Mini by ${porterNames}. ${port.notes}`;

  return {
    slug,
    seo: {
      title: `${port.name} · Miyoo Mini Ports`,
      description,
      url: new URL(portUrl(port.name), SITE_URL).href,
      image: ogImage(port.image),
    },
  };
}

export function porterSeo(
  handle: string,
  porter: Porters[string],
  owned: Port[],
): DetailSeo {
  const displayName = porter.name ?? handle;
  const names = owned.map((p) => p.name);
  const portList =
    names.length === 0
      ? ""
      : names.length > 3
        ? `${names.slice(0, 3).join(", ")}, and ${names.length - 3} more`
        : joinNames(names);
  const description =
    portList === ""
      ? `${displayName} — porter in the Miyoo Mini catalog${porter.bio ? `. ${porter.bio}` : ""}.`
      : `${displayName} — porter of ${portList} for the Miyoo Mini${porter.bio ? `. ${porter.bio}` : ""}.`;

  return {
    title: `${displayName} · Miyoo Mini Ports`,
    description,
    url: new URL(porterUrl(handle), SITE_URL).href,
    image: porter.image ? ogImage(porter.image) : `${SITE_URL}/icon-512.png`,
  };
}

export function addUniqueSlug(
  slug: string,
  name: string,
  seen: Set<string>,
): void {
  if (slug === "") throw new Error(`port "${name}" has an empty slug`);
  if (seen.has(slug)) {
    throw new Error(`slug collision on "${slug}" (${name})`);
  }
  seen.add(slug);
}

function renderPage(
  template: string,
  current: NavPage,
  render: (main: HTMLElement) => void,
): string {
  const { document } = parseHTML(template);
  const previous = globalThis.document;
  globalThis.document = document as unknown as Document;
  try {
    renderSiteNav(current);
    const main = globalThis.document.querySelector("main");
    if (!main) throw new Error("template: missing main");
    render(main);
    return document.toString();
  } finally {
    globalThis.document = previous;
  }
}

export function generatePages(
  ports: Port[],
  porters: Porters,
  dist = DIST,
): void {
  const portTemplate = readFileSync(resolve(dist, "port.html"), "utf8");
  const porterTemplate = readFileSync(resolve(dist, "porter.html"), "utf8");

  const seenSlugs = new Set<string>();
  const portUrls: string[] = [];
  for (const port of ports) {
    const { slug, seo } = portSeo(port, porters);
    addUniqueSlug(slug, port.name, seenSlugs);

    const dir = resolve(dist, "port", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      resolve(dir, "index.html"),
      renderPage(buildDetailPage(portTemplate, seo), null, (main) =>
        renderPort(port, ports, porters, main),
      ),
    );
    portUrls.push(seo.url);
  }

  const porterUrls: string[] = [];
  for (const [handle, porter] of Object.entries(porters)) {
    const owned = ports
      .filter((p) => p.porter.includes(handle))
      .sort((a, b) => a.name.localeCompare(b.name));
    const seo = porterSeo(handle, porter, owned);

    const dir = resolve(dist, "porter", handle);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      resolve(dir, "index.html"),
      renderPage(buildDetailPage(porterTemplate, seo), null, (main) =>
        renderPorter(handle, porter, owned, main),
      ),
    );
    porterUrls.push(seo.url);
  }

  const icon = `${SITE_URL}/icon-512.png`;
  for (const [file, path] of [
    ["index.html", "/"],
    ["porters.html", "/porters.html"],
  ] as const) {
    let html = readFileSync(resolve(dist, file), "utf8");
    if (!html.includes(CANONICAL_MARK)) {
      throw new Error(`${file}: missing ${CANONICAL_MARK}`);
    }
    html = html.replace(CANONICAL_MARK, () =>
      canonicalBlock(`${SITE_URL}${path}`, icon),
    );
    html = renderPage(
      html,
      file === "index.html" ? "ports" : "porters",
      (main) => {
        if (file === "index.html") {
          renderList(ports, main, true, porters, {
            q: "",
            active: { status: [], assets: [], category: [] },
          });
        } else {
          const grid = document.createElement("div");
          grid.className = "porters-grid";
          const sorted = Object.entries(porters).sort(
            (a, b) =>
              ports.filter((p) => p.porter.includes(b[0])).length -
                ports.filter((p) => p.porter.includes(a[0])).length ||
              a[0].localeCompare(b[0]),
          );
          grid.append(
            ...sorted.map(([handle, porter], index) =>
              renderPorterCard(handle, porter, index, ports),
            ),
          );
          main.append(grid);
        }
      },
    );
    writeFileSync(resolve(dist, file), html);
  }

  for (const file of ["port.html", "porter.html"]) {
    let html = readFileSync(resolve(dist, file), "utf8");
    if (!html.includes(CANONICAL_MARK)) {
      throw new Error(`${file}: missing ${CANONICAL_MARK}`);
    }
    html = html.replace(
      CANONICAL_MARK,
      () => '<meta name="robots" content="noindex" />',
    );
    html = renderPage(html, null, (main) => {
      const fallback = document.createElement("noscript");
      fallback.textContent =
        "Use the catalog navigation to find this port or porter.";
      main.append(fallback);
    });
    writeFileSync(resolve(dist, file), html);
  }

  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/porters.html`,
    ...portUrls,
    ...porterUrls,
  ];
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${escapeHtml(u)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");
  writeFileSync(resolve(dist, "sitemap.xml"), sitemap);

  console.log(
    `generated ${portUrls.length} port pages, ${porterUrls.length} porter pages, sitemap.xml`,
  );
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  generatePages(loadPorts(), loadPorters());
}
