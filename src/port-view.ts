import { portKind, relatedPorts } from "./catalog";
import { renderImage, renderTag } from "./components";
import { el } from "./dom";
import { icon } from "./icons";
import { stillImage } from "./media";
import { renderRow } from "./render";
import { porterUrl, SITE_BASE } from "./routes";
import type { Port, Porters, Status } from "./types";
import { ASSET_REQUIREMENTS, CATEGORY_LABELS, STATUS_LABELS } from "./types";

const STATUS_GUIDANCE: Record<Status, string> = {
  playable:
    "Listed as playable. Check the notes for setup details and device-specific limitations.",
  experimental:
    "An experimental port. Expect limitations and check device support in the port notes.",
  prerelease:
    "A prerelease build. Setup and behavior may change as development continues.",
  "source-only":
    "Source code only. No ready-to-install build is listed in this catalog.",
};

function specRow(key: string, value: Node | string): Node {
  return el("div", {
    class: "spec-row",
    children: [
      el("dt", { class: "spec-k", children: [key] }),
      el("dd", { class: "spec-v", children: [value] }),
    ],
  });
}

export function renderPort(
  port: Port,
  ports: Port[],
  porters: Porters,
  container: HTMLElement,
): void {
  document.title = `${port.name} · Miyoo Mini Ports`;
  const joinLinks = (): HTMLElement => {
    const links = el("span", { class: "spec-links" });
    port.porter.forEach((handle, index) => {
      if (index > 0) links.append(", ");
      links.append(
        el("a", {
          attrs: { href: porterUrl(handle) },
          children: [porters[handle]?.name ?? handle],
        }),
      );
    });
    return links;
  };
  const categories = el("span", { class: "spec-links" });
  port.categories.forEach((category, index) => {
    if (index > 0) categories.append(" / ");
    categories.append(
      el("a", {
        attrs: { href: `${SITE_BASE}?category=${category}#library` },
        children: [CATEGORY_LABELS[category]],
      }),
    );
  });
  const related = relatedPorts(port, ports);
  container.append(
    el("a", {
      class: "back-link",
      attrs: { href: `${SITE_BASE}#library` },
      children: [icon("back"), "Back to the library"],
    }),
    el("div", {
      class: "detail-head",
      children: [
        el("p", {
          class: "eyebrow",
          children: [categories],
        }),
        el("h1", { class: "detail-title", children: [port.name] }),
        el("p", {
          class: "detail-by",
          children: ["Ported by ", joinLinks()],
        }),
        el("dl", {
          class: "spec detail-facts",
          children: [
            specRow(
              "Status",
              renderTag(
                STATUS_LABELS[port.status],
                `tag status st-${port.status}`,
              ),
            ),
            specRow("Assets", ASSET_REQUIREMENTS[port.assets]),
          ],
        }),
      ],
    }),
    el("div", {
      class: `detail-grid detail-kind-${portKind(port)}`,
      children: [
        el("div", {
          class: "detail-main",
          children: [
            el("figure", {
              class: "plate",
              children: [
                renderImage(
                  port.image,
                  "plate-img",
                  `${port.name} artwork`,
                  "eager",
                ),
                ...(stillImage(port.image) === port.image
                  ? []
                  : [
                      el("button", {
                        class: "animation-toggle",
                        attrs: {
                          type: "button",
                          hidden: true,
                          "aria-pressed": "false",
                        },
                        children: ["Play animation"],
                      }),
                    ]),
              ],
            }),
          ],
        }),
        el("aside", {
          class: "install-panel",
          attrs: { "aria-labelledby": "install-title" },
          children: [
            el("p", {
              class: "eyebrow",
              children: [icon("data"), "Setup & requirements"],
            }),
            el("h2", {
              attrs: { id: "install-title" },
              children: ["About this port"],
            }),
            el("p", { class: "detail-notes", children: [port.notes] }),
            el("div", {
              class: "asset-guidance",
              children: [
                el("h3", { children: [ASSET_REQUIREMENTS[port.assets]] }),
                el("p", {
                  children: [
                    port.assets === "owned"
                      ? "You’ll need files from a copy you own. The port notes and maintainer’s instructions explain which files to supply."
                      : "No purchased game data is required. Check the maintainer’s instructions for any downloads or setup steps.",
                  ],
                }),
              ],
            }),
            el("a", {
              class: "stamp",
              attrs: { href: port.upstream, target: "_blank", rel: "noopener" },
              children: [
                port.status === "source-only"
                  ? "View source code"
                  : "Get the port",
                icon("external"),
              ],
            }),
            el("p", {
              class: "release-hint",
              children: [
                port.status === "source-only"
                  ? "Opens the maintainer’s source repository in a new tab. No ready-to-install release is listed."
                  : "Opens the maintainer’s page in a new tab. Follow their installation instructions.",
              ],
            }),
            el("div", {
              class: `status-guidance st-${port.status}`,
              children: [
                icon(port.status === "playable" ? "check" : "info"),
                el("p", {
                  children: [
                    el("strong", { children: [STATUS_LABELS[port.status]] }),
                    " ",
                    STATUS_GUIDANCE[port.status],
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );
  if (related.length > 0) {
    container.append(
      el("section", {
        class: "related-section",
        attrs: { "aria-labelledby": "related-title" },
        children: [
          el("div", {
            class: "section-heading",
            children: [
              el("div", {
                children: [
                  el("p", {
                    class: "eyebrow",
                    children: ["More in this category"],
                  }),
                  el("h2", {
                    attrs: { id: "related-title" },
                    children: ["Related ports"],
                  }),
                ],
              }),
              el("a", {
                class: "text-button",
                attrs: { href: `${SITE_BASE}#library` },
                children: ["All ports", icon("arrow")],
              }),
            ],
          }),
          el("div", {
            class: `catalog-grid${related.every((item) => portKind(item) !== "game") ? " utility-related" : ""}`,
            children: related.map((other) => renderRow(other, porters)),
          }),
        ],
      }),
    );
  }
}
