import { portKind } from "./catalog";
import { renderImage, renderTag } from "./components";
import { el } from "./dom";
import { icon } from "./icons";
import { porterUrl, portUrl } from "./routes";
import { slugify } from "./slug";
import type { FilterKey, FilterState, Port, Porters } from "./types";
import {
  ASSET_REQUIREMENTS,
  CATEGORY_LABELS,
  labelFor,
  STATUS_LABELS,
} from "./types";

export function renderRow(port: Port, porters: Porters): HTMLElement {
  const byline = el("p", { class: "by", children: ["Port by "] });
  port.porter.forEach((handle, index) => {
    if (index > 0) byline.append(", ");
    byline.append(
      el("a", {
        attrs: { href: porterUrl(handle) },
        children: [porters[handle]?.name ?? handle],
      }),
    );
  });
  return el("article", {
    class: `row port-card kind-${portKind(port)}`,
    attrs: {
      id: `port-${slugify(port.name)}`,
      "data-port": slugify(port.name),
    },
    children: [
      el("a", {
        class: "card-link",
        attrs: {
          href: portUrl(port.name),
          "aria-labelledby": `title-${slugify(port.name)}`,
        },
        children: [
          el("div", {
            class: "card-art",
            children: [
              renderImage(port.image, "card-image"),
              el("span", {
                class: "card-arrow",
                attrs: { "aria-hidden": "true" },
                children: [icon("arrow")],
              }),
            ],
          }),
          el("div", {
            class: "card-body",
            children: [
              el("p", {
                class: "card-category",
                children: [
                  port.categories.map((c) => CATEGORY_LABELS[c]).join(" / "),
                ],
              }),
              el("h3", {
                class: "name",
                attrs: { id: `title-${slugify(port.name)}` },
                children: [port.name],
              }),
              el("div", {
                class: "tags",
                children: [
                  renderTag(
                    STATUS_LABELS[port.status],
                    `tag status st-${port.status}`,
                  ),
                  renderTag(ASSET_REQUIREMENTS[port.assets], "tag asset-tag"),
                ],
              }),
              el("p", { class: "notes", children: [port.notes] }),
            ],
          }),
        ],
      }),
      byline,
    ],
  });
}

export function renderList(
  list: Port[],
  container: HTMLElement,
  porters: Porters,
  grouped = false,
): void {
  container.replaceChildren();
  container.dataset.grouped = String(grouped && list.length > 0);
  if (list.length === 0) {
    container.append(
      el("div", {
        class: "empty",
        children: [
          icon("search", "empty-icon"),
          el("h3", { children: ["No matching ports"] }),
          el("p", {
            children: [
              "No ports match this combination. Try a different search or clear your filters.",
            ],
          }),
          el("button", {
            class: "button button-secondary",
            attrs: { type: "button", "data-reset": true },
            children: ["Clear search & filters", icon("arrow")],
          }),
        ],
      }),
    );
    return;
  }
  if (grouped) {
    for (const [kind, label] of [
      ["game", "Games"],
      ["app", "Apps & utilities"],
      ["engine", "Engines"],
    ] as const) {
      const matching = list.filter((port) => portKind(port) === kind);
      if (!matching.length) continue;
      container.append(
        el("section", {
          class: "catalog-section",
          attrs: { "aria-label": label },
          children: [
            el("h2", {
              class: "catalog-group-title",
              children: [
                label,
                el("span", { children: [String(matching.length)] }),
              ],
            }),
            el("div", {
              class: "catalog-grid",
              children: matching.map((port) => renderRow(port, porters)),
            }),
          ],
        }),
      );
    }
  } else container.append(...list.map((port) => renderRow(port, porters)));
}

export function renderOverview(ports: Port[], porters: Porters): void {
  const portCount = document.querySelector('[data-stat="ports"]');
  const porterCount = document.querySelector('[data-stat="porters"]');
  if (portCount) portCount.textContent = String(ports.length);
  if (porterCount)
    porterCount.textContent = String(Object.keys(porters).length);
}

export function renderCount(
  shown: number,
  total: number,
  node: HTMLElement,
): void {
  node.textContent =
    shown === total
      ? `${total} ports to explore`
      : `${shown} of ${total} ports`;
}

const GROUP_LABELS: Record<FilterKey, string> = {
  status: "Availability",
  assets: "Game data",
  category: "Category",
};

export function renderChips(
  groups: { key: FilterKey; values: readonly string[] }[],
  state: FilterState,
  container: HTMLElement,
  onToggle: (key: FilterKey, value: string) => void,
  onClear: () => void,
): void {
  const focused = document.activeElement;
  const focusKey =
    focused instanceof HTMLElement && container.contains(focused)
      ? focused.dataset.filter
      : undefined;
  container.replaceChildren();
  for (const group of groups) {
    if (group.values.length === 0) continue;
    const row = el("div", {
      class: "chips-group",
      attrs: { role: "group", "aria-label": GROUP_LABELS[group.key] },
      children: [
        el("span", {
          class: "filter-label",
          children: [GROUP_LABELS[group.key]],
        }),
      ],
    });
    for (const value of group.values) {
      const active = state.active[group.key].includes(value);
      const chip = el("button", {
        class: "chip",
        attrs: {
          type: "button",
          "aria-pressed": String(active),
          "data-filter": `${group.key}:${value}`,
        },
        children: [icon("check"), labelFor(group.key, value)],
      });
      chip.addEventListener("click", () => onToggle(group.key, value));
      row.append(chip);
    }
    container.append(row);
  }
  const clear = el("button", {
    class: "text-button",
    attrs: { type: "button", "data-filter": "clear" },
    children: [icon("close"), "Clear search & filters"],
  });
  clear.addEventListener("click", onClear);
  container.append(
    el("div", {
      class: "filter-footer",
      children: [
        el("p", {
          children: [
            "Combine filters to find your next port. Requirements vary by release.",
          ],
        }),
        clear,
      ],
    }),
  );
  if (focusKey) {
    for (const button of container.querySelectorAll("button")) {
      if (button.dataset.filter === focusKey) button.focus();
    }
  }
}
