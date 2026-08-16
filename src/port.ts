import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { renderImage, renderNotFound } from "./components";
import { el } from "./dom";
import { mountSiteNav } from "./nav";
import { parsePorters, parsePorts } from "./schema";
import { porterUrl, slugify } from "./slug";
import type { Port } from "./types";
import {
  ASSETS_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  sortByCategoryThenName,
} from "./types";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);

function specRow(key: string, value: Node | string): Node {
  return el("div", {
    class: "spec-row",
    children: [
      el("span", { class: "spec-k", children: [key] }),
      el("span", { class: "spec-v", children: [value] }),
    ],
  });
}

const notFound = (container: HTMLElement): void =>
  renderNotFound(
    container,
    "No port matches this address.",
    "← All ports",
    "index.html",
  );

function renderPort(port: Port, container: HTMLElement): void {
  document.title = `${port.name} · Miyoo Mini Ports`;

  const catalogNumber =
    [...ports]
      .sort(sortByCategoryThenName)
      .findIndex((p) => p.name === port.name) + 1;

  const porterLink = (handle: string) =>
    el("a", {
      attrs: { href: porterUrl(handle) },
      children: [porters[handle]?.name ?? handle],
    });

  const joinLinks = (): Node => {
    const cell = el("span", { class: "spec-links" });
    port.porter.forEach((handle, i) => {
      if (i > 0) cell.append(", ");
      cell.append(porterLink(handle));
    });
    return cell;
  };

  const head = el("div", {
    class: "detail-head",
    children: [
      el("p", {
        class: "detail-no",
        children: [`Cat. no. ${String(catalogNumber).padStart(3, "0")}`],
      }),
      el("h1", { class: "detail-title", children: [port.name] }),
      el("p", { class: "detail-by", children: ["by ", joinLinks()] }),
    ],
  });

  const plate = el("figure", {
    class: "plate",
    children: [
      renderImage(port.image, "plate-img", `${port.name} artwork`),
      el("figcaption", {
        class: "plate-cap",
        children: [
          `Fig. ${String(catalogNumber).padStart(3, "0")} — ${port.categories.map((c) => CATEGORY_LABELS[c]).join(" / ")}`,
        ],
      }),
    ],
  });

  const porterCell = joinLinks();

  const spec = el("div", {
    class: "spec",
    children: [
      specRow(
        "Category",
        port.categories.map((c) => CATEGORY_LABELS[c]).join(", "),
      ),
      specRow("Status", STATUS_LABELS[port.status]),
      specRow("Assets", ASSETS_LABELS[port.assets]),
      specRow("Porter", porterCell),
    ],
  });

  const stamp = el("a", {
    class: "stamp",
    attrs: { href: port.upstream, target: "_blank", rel: "noopener" },
    children: ["Get the release ↗"],
  });

  container.append(
    head,
    el("div", {
      class: "detail-grid",
      children: [
        el("div", {
          class: "detail-main",
          children: [
            plate,
            el("p", { class: "detail-notes", children: [port.notes] }),
          ],
        }),
        el("div", {
          class: "detail-side",
          children: [spec, stamp],
        }),
      ],
    }),
  );
}

function main(): void {
  const container = document.getElementById("detail");
  if (!container) throw new Error("missing element: #detail");

  const wanted = new URLSearchParams(window.location.search).get("p");
  const port = ports.find((p) => slugify(p.name) === wanted);

  if (port === undefined) {
    notFound(container);
  } else {
    renderPort(port, container);
  }
}

mountSiteNav(null);
main();
