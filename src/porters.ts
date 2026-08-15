import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { PORTER_LINK_LABELS, renderImage, renderLinkTag } from "./components";
import { el, querySelector } from "./dom";
import { mountSiteNav } from "./nav";
import { parsePorters, parsePorts } from "./schema";
import { porterUrl, portUrl } from "./slug";
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
  const container = querySelector<HTMLElement>("#porters");
  const search = document.getElementById("porter-search");
  const count = document.getElementById("count");

  const sorted = Object.entries(porters).sort((a, b) => {
    const countA = ports.filter((p) => p.porter.includes(a[0])).length;
    const countB = ports.filter((p) => p.porter.includes(b[0])).length;
    return countB - countA || a[0].localeCompare(b[0]);
  });

  function render(q: string): void {
    const needle = q.trim().toLowerCase();
    const shown = sorted.filter(([handle, porter]) => {
      if (!needle) return true;
      const owned = ports
        .filter((p) => p.porter.includes(handle))
        .map((p) => p.name)
        .join(" ");
      const haystack = [handle, porter.name ?? "", porter.bio ?? "", owned]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
    if (shown.length === 0) {
      container.append(
        el("div", {
          class: "empty",
          attrs: { role: "status" },
          children: ["Nobody matches."],
        }),
      );
    } else {
      container.append(...shown.map(([h, p], i) => renderPorter(h, p, i)));
    }
    if (count) {
      count.textContent = `${shown.length} / ${sorted.length}`;
    }
  }

  if (search instanceof HTMLInputElement) {
    search.addEventListener("input", (event) => {
      if (event.target instanceof HTMLInputElement) {
        render(event.target.value);
      }
    });
  }

  render("");
}

mountSiteNav("porters");
main();
