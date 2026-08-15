import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import {
  PORTER_LINK_LABELS,
  renderImage,
  renderLinkTag,
  renderNotFound,
} from "./components";
import { el } from "./dom";
import { mountSiteNav } from "./nav";
import { parsePorters, parsePorts } from "./schema";
import { portUrl } from "./slug";
import type { Port, Porter } from "./types";
import { STATUS_LABELS } from "./types";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);

const notFound = (container: HTMLElement): void =>
  renderNotFound(
    container,
    "No porter matches this address.",
    "← All porters",
    "porters.html",
  );

function renderPorter(
  handle: string,
  porter: Porter,
  owned: Port[],
  container: HTMLElement,
): void {
  document.title = `${porter.name ?? handle} · Miyoo Mini Ports`;

  const displayName = porter.name ?? handle;
  const avatar = porter.image
    ? renderImage(porter.image, "avatar avatar-lg", `Avatar of ${displayName}`)
    : el("div", {
        class: "avatar avatar-lg ph",
        attrs: { "aria-hidden": "true" },
        children: [handle.charAt(0).toUpperCase()],
      });

  const infoChildren: (Node | string)[] = [
    el("h1", { class: "detail-title", children: [displayName] }),
  ];
  if (porter.name !== undefined) {
    infoChildren.push(
      el("p", { class: "porter-handle", children: [`@${handle}`] }),
    );
  }
  if (porter.bio !== undefined) {
    infoChildren.push(el("p", { class: "porter-bio", children: [porter.bio] }));
  }
  infoChildren.push(
    el("div", {
      class: "tags",
      children: PORTER_LINK_LABELS.flatMap(([key, label]) => {
        const url = porter[key];
        return url === undefined ? [] : [renderLinkTag(label, url)];
      }),
    }),
  );

  container.append(
    el("div", {
      class: "porter-detail",
      children: [
        avatar,
        el("div", { class: "porter-detail-info", children: infoChildren }),
      ],
    }),
    el("h2", { class: "detail-section", children: ["Catalogued ports"] }),
    el("ul", {
      class: "porter-ports",
      children: owned.map((p) =>
        el("li", {
          children: [
            el("a", {
              attrs: { href: portUrl(p.name) },
              children: [p.name],
            }),
            el("span", {
              class: "tag",
              children: [STATUS_LABELS[p.status]],
            }),
          ],
        }),
      ),
    }),
  );
}

function main(): void {
  const container = document.getElementById("detail");
  if (!container) throw new Error("missing element: #detail");

  const wanted = new URLSearchParams(window.location.search).get("p");

  if (wanted === null || porters[wanted] === undefined) {
    notFound(container);
  } else {
    const porter = porters[wanted];
    const owned = ports
      .filter((p) => p.porter.includes(wanted))
      .sort((a, b) => a.name.localeCompare(b.name));
    renderPorter(wanted, porter, owned, container);
  }
}

mountSiteNav(null);
main();
