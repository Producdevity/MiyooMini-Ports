import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parsePorters, parsePorts } from "../src/schema";
import { slugify } from "../src/slug";
import type { Port, Porters } from "../src/types";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  sortByCategoryThenName,
} from "../src/types";

const SITE_URL = "https://producdevity.github.io/MiyooMini-Ports";
const SITE_BASE = new URL(`${SITE_URL}/`).pathname;
const DIST = resolve(import.meta.dirname, "..", "dist");
const CANONICAL_MARK = "<!-- seo:canonical -->";
const DETAIL_MAIN = '<main class="wrap" id="detail"></main>';

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
  return url.split("?")[0].endsWith(".svg") ? `${SITE_URL}/icon-512.png` : url;
}

interface DetailSeo {
  title: string;
  description: string;
  url: string;
  image: string;
  noscript: string;
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
  assertOne(template, new RegExp(DETAIL_MAIN), "detail main");

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
    .replace(CANONICAL_MARK, () => canonicalBlock(seo.url, seo.image))
    .replace(
      DETAIL_MAIN,
      () =>
        `<main class="wrap" id="detail">\n      ${seo.noscript}\n    </main>`,
    );

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

  const noscript = [
    "<noscript>",
    `      <h1 class="detail-title">${escapeHtml(port.name)}</h1>`,
    `      <p class="detail-by">by ${port.porter
      .map(
        (handle) =>
          `<a href="${SITE_BASE}porter/${encodeURIComponent(handle)}/">${escapeHtml(porters[handle]?.name ?? handle)}</a>`,
      )
      .join(", ")}</p>`,
    `      <p class="detail-notes">${escapeHtml(port.notes)}</p>`,
    `      <p><a class="stamp" href="${escapeHtml(port.upstream)}" rel="noopener">Get the release ↗</a></p>`,
    `      <p><a class="nav-link" href="${SITE_BASE}">← All ports</a></p>`,
    "    </noscript>",
  ].join("\n");

  return {
    slug,
    seo: {
      title: `${port.name} · Miyoo Mini Ports`,
      description,
      url: `${SITE_URL}/port/${slug}/`,
      image: ogImage(port.image),
      noscript,
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

  const items = owned
    .map(
      (p) =>
        `        <li><a href="${SITE_BASE}port/${slugify(p.name)}/">${escapeHtml(p.name)}</a> — ${escapeHtml(
          `${STATUS_LABELS[p.status]}, ${p.categories.map((c) => CATEGORY_LABELS[c]).join(" / ")}`,
        )}</li>`,
    )
    .join("\n");

  const noscript = [
    "<noscript>",
    `      <h1 class="detail-title">${escapeHtml(displayName)}</h1>`,
    ...(porter.name === undefined
      ? []
      : [`      <p class="porter-handle">@${handle}</p>`]),
    ...(porter.bio === undefined
      ? []
      : [`      <p class="porter-bio">${escapeHtml(porter.bio)}</p>`]),
    '      <ul class="porter-ports">',
    items,
    "      </ul>",
    `      <p><a class="stamp" href="${escapeHtml(porter.github)}" rel="noopener">GitHub ↗</a></p>`,
    `      <p><a class="nav-link" href="${SITE_BASE}porters.html">← All porters</a></p>`,
    "    </noscript>",
  ].join("\n");

  return {
    title: `${displayName} · Miyoo Mini Ports`,
    description,
    url: `${SITE_URL}/porter/${handle}/`,
    image: porter.image ? ogImage(porter.image) : `${SITE_URL}/icon-512.png`,
    noscript,
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

function main(): void {
  const ports = loadPorts();
  const porters = loadPorters();

  const portTemplate = readFileSync(resolve(DIST, "port.html"), "utf8");
  const porterTemplate = readFileSync(resolve(DIST, "porter.html"), "utf8");

  const seenSlugs = new Set<string>();
  const portUrls: string[] = [];
  for (const port of ports) {
    const { slug, seo } = portSeo(port, porters);
    addUniqueSlug(slug, port.name, seenSlugs);

    const dir = resolve(DIST, "port", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      resolve(dir, "index.html"),
      buildDetailPage(portTemplate, seo),
    );
    portUrls.push(`/port/${slug}/`);
  }

  const porterUrls: string[] = [];
  for (const [handle, porter] of Object.entries(porters)) {
    if (!/^[A-Za-z0-9-]+$/.test(handle)) {
      throw new Error(
        `porter handle "${handle}" is not URL-safe; the directory name must match the handle exactly`,
      );
    }
    const owned = ports
      .filter((p) => p.porter.includes(handle))
      .sort(sortByCategoryThenName);
    const seo = porterSeo(handle, porter, owned);

    const dir = resolve(DIST, "porter", handle);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      resolve(dir, "index.html"),
      buildDetailPage(porterTemplate, seo),
    );
    porterUrls.push(`/porter/${handle}/`);
  }

  const icon = `${SITE_URL}/icon-512.png`;
  for (const [file, path] of [
    ["index.html", "/"],
    ["porters.html", "/porters.html"],
  ] as const) {
    let html = readFileSync(resolve(DIST, file), "utf8");
    if (!html.includes(CANONICAL_MARK)) {
      throw new Error(`${file}: missing ${CANONICAL_MARK}`);
    }
    html = html.replace(CANONICAL_MARK, () =>
      canonicalBlock(`${SITE_URL}${path}`, icon),
    );
    writeFileSync(resolve(DIST, file), html);
  }

  for (const file of ["port.html", "porter.html"]) {
    let html = readFileSync(resolve(DIST, file), "utf8");
    if (!html.includes(CANONICAL_MARK)) {
      throw new Error(`${file}: missing ${CANONICAL_MARK}`);
    }
    html = html.replace(
      CANONICAL_MARK,
      () => '<meta name="robots" content="noindex" />',
    );
    writeFileSync(resolve(DIST, file), html);
  }

  const urls = ["/", "/porters.html", ...portUrls, ...porterUrls];
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");
  writeFileSync(resolve(DIST, "sitemap.xml"), sitemap);

  writeFileSync(
    resolve(DIST, "robots.txt"),
    [
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      "",
    ].join("\n"),
  );

  console.log(
    `generated ${portUrls.length} port pages, ${porterUrls.length} porter pages, sitemap.xml, robots.txt`,
  );
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
