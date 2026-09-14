import {
  PORTER_LINK_LABELS,
  renderImage,
  renderLinkTag,
  renderPortListItem,
} from "./components";
import { el } from "./dom";
import type { Port, Porter } from "./types";

export function renderPorter(
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
    el("h2", {
      class: "detail-section",
      children: [
        "Catalogued ports",
        el("span", {
          class: "n",
          children: [String(owned.length)],
        }),
      ],
    }),
    el("ul", {
      class: "porter-ports",
      children: owned.map((p) => renderPortListItem(p)),
    }),
  );
}
