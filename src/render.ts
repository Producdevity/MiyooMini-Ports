import { el } from "./dom";
import type { Category, FilterKey, FilterState, Port, Porters } from "./types";
import {
  ASSETS_LABELS,
  CATEGORY_LABELS,
  labelFor,
  STATUS_LABELS,
  sortByCategoryThenName,
} from "./types";

const statusTagClass = (s: string): string => `st-${s}`;

const porterNames = (handles: string[], porters: Porters): string =>
  handles.map((h) => porters[h]?.name ?? h).join(", ");

function renderThumbnail(port: Port): Node {
  if (!port.image) {
    return el("div", { class: "thumb ph", children: ["⬚"] });
  }
  const img = el("img", {
    class: "thumb",
    attrs: {
      src: port.image,
      alt: "",
      loading: "lazy",
    },
  });
  img.addEventListener("error", () => {
    const ph = el("div", { class: "thumb ph", children: ["⬚"] });
    img.replaceWith(ph);
  });
  return img;
}

export function renderRow(port: Port, index: number, porters: Porters): Node {
  const nameLink = el("a", {
    attrs: { href: port.upstream, target: "_blank", rel: "noopener" },
    children: [port.name],
  });
  nameLink.addEventListener("click", (e) => e.stopPropagation());

  const row = el("div", {
    class: "row",
    attrs: {
      role: "button",
      tabindex: "0",
      "aria-label": `Open ${port.name} releases`,
      style: `animation-delay: ${Math.min(index * 30, 420)}ms`,
    },
    children: [
      el("span", {
        class: "idx",
        children: [String(index + 1).padStart(3, "0")],
      }),
      renderThumbnail(port),
      el("div", {
        class: "info",
        children: [
          el("div", { class: "name", children: [nameLink] }),
          el("div", {
            class: "by",
            children: [`by ${porterNames(port.porter, porters)}`],
          }),
          el("div", {
            class: "tags",
            children: [
              el("span", {
                class: "tag",
                children: [CATEGORY_LABELS[port.category]],
              }),
              el("span", {
                class: ["tag", statusTagClass(port.status)].join(" "),
                children: [STATUS_LABELS[port.status]],
              }),
              el("span", {
                class: ["tag", port.assets].join(" "),
                children: [ASSETS_LABELS[port.assets]],
              }),
            ],
          }),
          el("div", { class: "notes", children: [port.notes] }),
        ],
      }),
    ],
  });

  const open = (): void => {
    window.open(port.upstream, "_blank", "noopener");
  };
  row.addEventListener("click", open);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
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
      const chip = el("span", {
        class: "chip",
        attrs: { role: "button", tabindex: "0" },
        children: [labelFor(g.key, value)],
      });
      if (state.active[g.key] === value) chip.classList.add("active");
      const toggle = () => onToggle(g.key, value);
      chip.addEventListener("click", toggle);
      chip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
      row.append(chip);
    }
    container.append(row);
  }

  const clearRow = el("div", { class: "chips-group" });
  clearRow.append(el("span", { class: "lbl" }));
  const clear = el("span", { class: "clear", children: ["clear filters"] });
  clear.addEventListener("click", onClear);
  clearRow.append(clear);
  container.append(clearRow);
}
