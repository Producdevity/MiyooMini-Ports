import { renderImage, renderTag, statusTagClass } from "./components";
import { el } from "./dom";
import { porterUrl, portUrl } from "./slug";
import type { Category, FilterKey, FilterState, Port, Porters } from "./types";
import {
  ASSETS_LABELS,
  CATEGORY_LABELS,
  labelFor,
  STATUS_LABELS,
  sortByCategoryThenName,
} from "./types";

export function renderRow(port: Port, index: number, porters: Porters): Node {
  const detail = portUrl(port.name);
  const nameLink = el("a", {
    attrs: { href: detail },
    children: [port.name],
  });

  const byLine = el("div", { class: "by", children: ["by "] });
  port.porter.forEach((handle, i) => {
    if (i > 0) byLine.append(", ");
    byLine.append(
      el("a", {
        attrs: { href: porterUrl(handle) },
        children: [porters[handle]?.name ?? handle],
      }),
    );
  });

  const row = el("div", {
    class: "row",
    attrs: {
      style: `animation-delay: ${Math.min(index * 30, 420)}ms`,
    },
    children: [
      el("span", {
        class: "idx",
        children: [String(index + 1).padStart(3, "0")],
      }),
      renderImage(port.image, "thumb"),
      el("div", {
        class: "info",
        children: [
          el("div", { class: "name", children: [nameLink] }),
          byLine,
          el("div", {
            class: "tags",
            children: [
              renderTag(CATEGORY_LABELS[port.category]),
              renderTag(
                STATUS_LABELS[port.status],
                `tag ${statusTagClass(port.status)}`,
              ),
              renderTag(ASSETS_LABELS[port.assets], `tag ${port.assets}`),
            ],
          }),
          el("div", { class: "notes", children: [port.notes] }),
        ],
      }),
    ],
  });

  row.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("a")) return;
    window.location.assign(detail);
  });

  return row;
}

export function renderList(
  list: Port[],
  container: HTMLElement,
  grouped: boolean,
  porters: Porters,
): void {
  container.replaceChildren();

  if (list.length === 0) {
    container.append(
      el("div", {
        class: "empty",
        attrs: { role: "status" },
        children: ["Nothing matches."],
      }),
    );
    return;
  }

  if (!grouped) {
    const flat = [...list].sort(sortByCategoryThenName);
    container.append(...flat.map((p, i) => renderRow(p, i, porters)));
    return;
  }

  const byCategory = new Map<Category, Port[]>();
  for (const p of list) {
    const arr = byCategory.get(p.category) ?? [];
    arr.push(p);
    byCategory.set(p.category, arr);
  }
  const sorted = [...byCategory.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  let index = 0;
  for (const [category, items] of sorted) {
    items.sort((a, b) => a.name.localeCompare(b.name));
    container.append(
      el("div", {
        class: "group-label",
        children: [
          CATEGORY_LABELS[category],
          " ",
          el("span", { class: "n", children: [String(items.length)] }),
        ],
      }),
      ...items.map((p) => renderRow(p, index++, porters)),
    );
  }
}

export function renderCount(
  shown: number,
  total: number,
  node: HTMLElement,
): void {
  node.textContent = `${shown} / ${total}`;
}

export function renderChips(
  groups: { key: FilterKey; values: readonly string[] }[],
  state: FilterState,
  container: HTMLElement,
  onToggle: (key: FilterKey, value: string) => void,
  onClear: () => void,
): void {
  container.replaceChildren();

  for (const g of groups) {
    const row = el("div", { class: "chips-group" });
    row.append(el("span", { class: "lbl", children: [g.key] }));
    for (const value of g.values) {
      const active = state.active[g.key] === value;
      const chip = el("button", {
        class: "chip",
        attrs: {
          type: "button",
          "aria-pressed": active ? "true" : "false",
        },
        children: [labelFor(g.key, value)],
      });
      if (active) chip.classList.add("active");
      chip.addEventListener("click", () => onToggle(g.key, value));
      row.append(chip);
    }
    container.append(row);
  }

  const clearRow = el("div", { class: "chips-group" });
  clearRow.append(el("span", { class: "lbl" }));
  const clear = el("button", {
    class: "clear",
    attrs: { type: "button" },
    children: ["clear filters"],
  });
  clear.addEventListener("click", onClear);
  clearRow.append(clear);
  container.append(clearRow);
}
