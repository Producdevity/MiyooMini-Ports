import { renderImage, renderTag } from "./components";
import { el } from "./dom";
import { icon } from "./icons";
import { porterUrl, portUrl } from "./routes";
import type { Port, Porters } from "./types";
import { ASSET_REQUIREMENTS, CATEGORY_LABELS, STATUS_LABELS } from "./types";

export function renderInspector(
  port: Port | undefined,
  porters: Porters,
  container: HTMLElement,
  titleId = "inspector-title",
): void {
  container.replaceChildren();
  if (!port) {
    container.append(
      el("div", {
        class: "inspector-empty",
        children: [
          icon("search"),
          el("h2", {
            attrs: { id: titleId },
            children: ["Nothing in this selection"],
          }),
          el("p", {
            children: ["Change your search or filters to inspect a port."],
          }),
        ],
      }),
    );
    return;
  }
  const byline = el("p", { class: "inspector-byline", children: ["Port by "] });
  port.porter.forEach((handle, index) => {
    if (index > 0) byline.append(", ");
    byline.append(
      el("a", {
        attrs: { href: porterUrl(handle) },
        children: [porters[handle]?.name ?? handle],
      }),
    );
  });
  container.append(
    el("div", {
      class: "inspector-heading",
      children: [
        el("p", {
          class: "eyebrow",
          children: [
            port.categories
              .map((category) => CATEGORY_LABELS[category])
              .join(" / "),
          ],
        }),
        el("h2", { attrs: { id: titleId }, children: [port.name] }),
        byline,
      ],
    }),
    el("div", {
      class: "inspector-art",
      children: [
        renderImage(
          port.image,
          "inspector-image",
          `${port.name} artwork`,
          "eager",
        ),
      ],
    }),
    el("dl", {
      class: "inspector-facts",
      children: [
        el("div", {
          children: [
            el("dt", { children: ["Availability"] }),
            el("dd", {
              children: [
                renderTag(
                  STATUS_LABELS[port.status],
                  `tag status st-${port.status}`,
                ),
              ],
            }),
          ],
        }),
        el("div", {
          children: [
            el("dt", { children: ["Game data"] }),
            el("dd", {
              children: [
                icon(port.assets === "owned" ? "data" : "check"),
                ASSET_REQUIREMENTS[port.assets],
              ],
            }),
          ],
        }),
      ],
    }),
    el("section", {
      class: "inspector-notes",
      children: [
        el("h3", { children: ["Port notes"] }),
        el("p", { children: [port.notes] }),
      ],
    }),
    el("p", {
      class: "inspector-requirement",
      children: [
        icon("info"),
        port.status === "source-only"
          ? "Source code only. No ready-to-install build is listed."
          : port.assets === "owned"
            ? "Game files are not included. Supply the required data from a copy you own."
            : "No purchased game data required. Follow the maintainer’s setup instructions.",
      ],
    }),
    el("div", {
      class: "inspector-actions",
      children: [
        el("a", {
          class: "button button-primary",
          attrs: { href: portUrl(port.name) },
          children: ["Open port page", icon("arrow")],
        }),
        el("a", {
          class: "text-button",
          attrs: { href: port.upstream, target: "_blank", rel: "noopener" },
          children: [
            port.status === "source-only" ? "Source code" : "Source / release",
            icon("external"),
          ],
        }),
      ],
    }),
  );
}
