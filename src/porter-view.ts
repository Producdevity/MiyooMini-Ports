import {
  PORTER_LINK_LABELS,
  renderImage,
  renderLinkTag,
  renderPortListItem,
} from "./components";
import { el } from "./dom";
import { icon } from "./icons";
import { SITE_BASE } from "./routes";
import type { Port, Porter } from "./types";

export function renderPorter(
  handle: string,
  porter: Porter,
  owned: Port[],
  container: HTMLElement,
): void {
  const displayName = porter.name ?? handle;
  document.title = `${displayName} · Miyoo Mini Ports`;
  const avatar = porter.image
    ? renderImage(
        porter.image,
        "avatar avatar-lg",
        `Avatar of ${displayName}`,
        "eager",
      )
    : el("div", {
        class: "avatar avatar-lg ph",
        attrs: { "aria-hidden": "true" },
        children: [displayName.charAt(0).toUpperCase()],
      });
  const info = el("div", {
    class: "porter-detail-info",
    children: [
      el("p", { class: "eyebrow", children: ["Community porter"] }),
      el("h1", { class: "detail-title", children: [displayName] }),
      el("p", { class: "porter-handle", children: [`@${handle}`] }),
    ],
  });
  if (porter.bio)
    info.append(el("p", { class: "porter-bio", children: [porter.bio] }));
  info.append(
    el("div", {
      class: "tags profile-links",
      children: PORTER_LINK_LABELS.flatMap(([key, label]) =>
        porter[key]
          ? [
              renderLinkTag(
                key === "donate" ? "Support this porter" : label,
                porter[key],
              ),
            ]
          : [],
      ),
    }),
  );
  container.append(
    el("a", {
      class: "back-link",
      attrs: { href: `${SITE_BASE}porters.html` },
      children: [icon("back"), "All community porters"],
    }),
    el("div", { class: "porter-detail", children: [avatar, info] }),
    el("div", {
      class: "section-heading profile-section-heading",
      children: [
        el("h2", { children: ["Made for your Mini."] }),
        el("p", {
          class: "count",
          children: [
            `${owned.length} ${owned.length === 1 ? "port" : "ports"} in the library`,
          ],
        }),
      ],
    }),
    el("ul", {
      class: "porter-ports",
      children: owned.map(renderPortListItem),
    }),
  );
}
