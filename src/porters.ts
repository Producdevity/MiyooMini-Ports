import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { PORTER_LINK_LABELS, renderImage, renderLinkTag } from "./components";
import { el } from "./dom";
import { parsePorters, parsePorts } from "./schema";
import { porterUrl, portUrl } from "./slug";
import { initThemeToggle } from "./theme";
import type { Port, Porter } from "./types";
import { STATUS_LABELS } from "./types";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);

function renderPorter(handle: string, porter: Porter, index: number): Node {
  const owned = ports
    .filter((p: Port) => p.porter.includes(handle))
    .sort((a, b) => a.name.localeCompare(b.name));

  const links = PORTER_LINK_LABELS.flatMap(([key, label]) => {
    const url = porter[key];
    return url === undefined ? [] : [renderLinkTag(label, url)];
  });

  const avatar = porter.image
    ? renderImage(porter.image, "avatar", `Avatar of ${porter.name ?? handle}`)
    : el("div", {
        class: "avatar ph",
        attrs: { "aria-hidden": "true" },
        children: [handle.charAt(0).toUpperCase()],
      });

  const infoChildren: (Node | string)[] = [
    el("h2", {
      class: "porter-name",
      children: [
        el("a", {
          attrs: { href: porterUrl(handle) },
          children: [porter.name ?? handle],
        }),
      ],
    }),
  ];
  if (porter.name !== undefined) {
    infoChildren.push(
      el("p", { class: "porter-handle", children: [`@${handle}`] }),
    );
  }
  if (porter.bio !== undefined) {
    infoChildren.push(el("p", { class: "porter-bio", children: [porter.bio] }));
  }
  infoChildren.push(el("div", { class: "tags", children: links }));

  const portsList = el("ul", {
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
  });

  return el("div", {
    class: "porter",
    attrs: { style: `animation-delay: ${Math.min(index * 40, 400)}ms` },
    children: [
      el("span", {
        class: "idx",
        children: [String(index + 1).padStart(3, "0")],
      }),
      el("a", {
        class: "porter-avatar-link",
        attrs: {
          href: porterUrl(handle),
          "aria-hidden": "true",
          tabindex: "-1",
        },
        children: [avatar],
      }),
      el("div", {
        class: "porter-info",
        children: [...infoChildren, portsList],
      }),
    ],
  });
}

function main(): void {
  const container = document.getElementById("porters");
  if (!container) throw new Error("missing element: #porters");

  const sorted = Object.entries(porters).sort((a, b) => {
    const countA = ports.filter((p) => p.porter.includes(a[0])).length;
    const countB = ports.filter((p) => p.porter.includes(b[0])).length;
    return countB - countA || a[0].localeCompare(b[0]);
  });

  container.replaceChildren(
    ...sorted.map(([h, p], i) => renderPorter(h, p, i)),
  );
}

initThemeToggle();
main();
