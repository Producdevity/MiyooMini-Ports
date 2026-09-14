import {
  PORTER_LINK_LABELS,
  renderImage,
  renderLinkTag,
  renderPortListItem,
} from "./components";
import { el } from "./dom";
import { porterUrl } from "./routes";
import type { Port, Porter } from "./types";

export function renderPorterCard(
  handle: string,
  porter: Porter,
  index: number,
  ports: Port[],
): Node {
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

  const countLine = el("p", {
    class: "porter-handle",
    children: [
      el("span", {
        class: "porter-count",
        children: [`${owned.length} ${owned.length === 1 ? "port" : "ports"}`],
      }),
    ],
  });
  if (porter.name !== undefined) {
    countLine.prepend(`@${handle}`);
  }

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
    countLine,
  ];
  if (porter.bio !== undefined) {
    infoChildren.push(el("p", { class: "porter-bio", children: [porter.bio] }));
  }
  infoChildren.push(el("div", { class: "tags", children: links }));

  const portsList = el("ul", {
    class: "porter-ports",
    children: owned.map((p) => renderPortListItem(p)),
  });

  return el("article", {
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
