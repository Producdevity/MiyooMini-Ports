import type { FilterKey, FilterState, Port } from "./types";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: {
    class?: string;
    attrs?: Record<string, string | boolean | null | undefined>;
    children?: (Node | string)[];
  } = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  for (const [k, v] of Object.entries(opts.attrs ?? {})) {
    if (v == null || v === false) continue;
    node.setAttribute(k, v === true ? "" : v);
  }
  for (const child of opts.children ?? []) {
    node.append(child);
  }
  return node;
}

const statusTagClass = (s: string): string => `st-${s.replace(/\s+/g, "-")}`;

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

export function renderRow(port: Port): Node {
  const nameLink = el("a", {
    attrs: { href: port.upstream, target: "_blank", rel: "noopener" },
    children: [port.name],
  });
  nameLink.addEventListener("click", (e) => e.stopPropagation());

  return el("div", {
    class: "row",
    attrs: { role: "button", tabindex: "0" },
    children: [
      renderThumbnail(port),
      el("div", {
        class: "info",
        children: [
          el("div", {
            class: "top",
            children: [
              el("span", { class: "name", children: [nameLink] }),
              el("span", { class: "cat", children: [port.category] }),
            ],
          }),
          el("div", {
            class: "tags",
            children: [
              el("span", {
                class: ["tag", statusTagClass(port.status)].join(" "),
                children: [port.status],
              }),
              el("span", {
                class: ["tag", port.assets].join(" "),
                children: [port.assets === "owned" ? "owned data" : "free"],
              }),
            ],
          }),
          el("div", { class: "notes", children: [port.notes] }),
        ],
      }),
    ],
  });
}

export function renderList(
  list: Port[],
  container: HTMLElement,
  grouped: boolean,
): void {
  container.replaceChildren();

  if (list.length === 0) {
    container.append(
      el("div", {
        class: "empty",
        children: ["No ports match these filters."],
      }),
    );
    return;
  }

  if (!grouped) {
    container.append(...list.map(renderRow));
    return;
  }

  const byCategory = new Map<string, Port[]>();
  for (const p of list) {
    const arr = byCategory.get(p.category) ?? [];
    arr.push(p);
    byCategory.set(p.category, arr);
  }
  const sorted = [...byCategory.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [category, items] of sorted) {
    container.append(
      el("div", {
        class: "group-label",
        children: [
          category,
          " ",
          el("span", { class: "n", children: [String(items.length)] }),
        ],
      }),
      ...items.map(renderRow),
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
        children: [value],
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
