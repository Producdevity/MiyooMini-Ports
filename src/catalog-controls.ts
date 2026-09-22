import type { CatalogState, Kind } from "./catalog";
import { portKind } from "./catalog";
import { el } from "./dom";
import { type IconName, icon } from "./icons";
import { type FilterKey, labelFor, type Port } from "./types";

const KIND_LABELS: [Kind, string, IconName][] = [
  ["all", "All ports", "grid"],
  ["game", "Games", "gamepad"],
  ["app", "Apps", "apps"],
  ["engine", "Engines", "engine"],
];

export function mountKinds(
  container: HTMLElement,
  ports: Port[],
  onChange: (kind: Kind) => void,
): void {
  for (const [kind, label, name] of KIND_LABELS) {
    const count = ports.filter(
      (port) => kind === "all" || portKind(port) === kind,
    ).length;
    const button = el("button", {
      class: "kind-button",
      attrs: {
        type: "button",
        "data-kind": kind,
        "aria-pressed": "false",
        "aria-label": `${label}, ${count} in library`,
      },
      children: [
        icon(name),
        label,
        el("span", { class: "kind-count", children: [String(count)] }),
      ],
    });
    button.addEventListener("click", () => onChange(kind));
    container.append(button);
  }
}

export function renderActiveFilters(
  container: HTMLElement,
  state: CatalogState,
  onRemove: (key: FilterKey, value: string) => void,
): void {
  const hadFocus = container.contains(document.activeElement);
  container.replaceChildren();
  for (const key of ["status", "assets", "category"] as const) {
    for (const value of state.active[key]) {
      const label = labelFor(key, value);
      const button = el("button", {
        class: "active-filter",
        attrs: { type: "button", "aria-label": `Remove ${label} filter` },
        children: [label, icon("close")],
      });
      button.addEventListener("click", () => onRemove(key, value));
      container.append(button);
    }
  }
  container.hidden = container.childElementCount === 0;
  if (hadFocus)
    (
      container.querySelector("button") ??
      document.getElementById("filter-toggle")
    )?.focus();
}
