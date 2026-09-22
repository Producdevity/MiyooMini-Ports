import { renderImage, renderTag } from "./components";
import { el } from "./dom";
import { icon } from "./icons";
import { porterUrl, portUrl } from "./routes";
import type { FilterKey, FilterState, Port, Porters } from "./types";
import {
  ASSET_REQUIREMENTS,
  CATEGORY_LABELS,
  labelFor,
  STATUS_LABELS,
} from "./types";

export function portKind(port: Port): "game" | "app" | "engine" {
  if (port.categories.includes("app")) return "app";
  if (port.categories.includes("engine")) return "engine";
  return "game";
}

export function libraryOrder(a: Port, b: Port): number {
  const order = { game: 0, app: 1, engine: 2 };
  return (
    order[portKind(a)] - order[portKind(b)] || a.name.localeCompare(b.name)
  );
}

export function renderRow(
  port: Port,
  _index: number,
  porters: Porters,
  _state: FilterState,
): HTMLElement {
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
    children: [
      el("div", {
        class: "card-art",
        children: [
          renderImage(port.image, "card-image"),
          el("span", { class: "card-arrow", children: [icon("arrow")] }),
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
            children: [
              el("a", {
                attrs: { href: portUrl(port.name) },
                children: [port.name],
              }),
            ],
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
          byline,
        ],
      }),
    ],
  });
}

export function renderList(
  list: Port[],
  container: HTMLElement,
  _grouped: boolean,
  porters: Porters,
  state: FilterState,
): void {
  container.replaceChildren();
  if (list.length === 0) {
    container.append(
      el("div", {
        class: "empty",
        children: [
          icon("search", "empty-icon"),
          el("h3", { children: ["A little off the map."] }),
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
  const sorted = [...list].sort(libraryOrder);
  container.append(...sorted.map((p, i) => renderRow(p, i, porters, state)));
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
