import { PORTER_LINK_LABELS, renderImage, renderLinkTag } from "./components";
import { el } from "./dom";
import { icon } from "./icons";
import { porterUrl, portUrl } from "./routes";
import type { Port, Porter } from "./types";

export function renderPorterCard(
  handle: string,
  porter: Porter,
  _index: number,
  ports: Port[],
): Node {
  const owned = ports
    .filter((port) => port.porter.includes(handle))
    .sort((a, b) => a.name.localeCompare(b.name));
  const name = porter.name ?? handle;
  const avatar = porter.image
    ? renderImage(porter.image, "avatar", `Avatar of ${name}`)
    : el("div", {
        class: "avatar ph",
        attrs: { "aria-hidden": "true" },
        children: [name.charAt(0).toUpperCase()],
      });
  const profileUrl = porterUrl(handle);
  const card = el("article", {
    class: "porter",
    children: [
      el("div", {
        class: "porter-card-head",
        children: [
          el("a", {
            class: "porter-avatar-link",
            attrs: { href: profileUrl, "aria-label": `View ${name} profile` },
            children: [avatar],
          }),
          el("div", {
            class: "porter-card-identity",
            children: [
              el("h2", {
                class: "porter-name",
                children: [
                  el("a", { attrs: { href: profileUrl }, children: [name] }),
                ],
              }),
              el("p", {
                class: "porter-handle",
                children: [
                  `${owned.length} ${owned.length === 1 ? "port" : "ports"} in the library`,
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  if (porter.bio)
    card.append(el("p", { class: "porter-bio", children: [porter.bio] }));
  card.append(
    el("div", {
      class: "tags porter-links",
      children: PORTER_LINK_LABELS.flatMap(([key, label]) =>
        porter[key] ? [renderLinkTag(label, porter[key])] : [],
      ),
    }),
    el("ul", {
      class: "porter-preview",
      children: owned.slice(0, 3).map((port) =>
        el("li", {
          children: [
            renderImage(port.image, "preview-image"),
            el("a", {
              attrs: { href: portUrl(port.name) },
              children: [port.name],
            }),
          ],
        }),
      ),
    }),
    el("a", {
      class: "porter-profile-link",
      attrs: { href: profileUrl },
      children: [
        owned.length > 3
          ? `View all ${owned.length} ports`
          : "Explore their work",
        icon("arrow"),
      ],
    }),
  );
  return card;
}
