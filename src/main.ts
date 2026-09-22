import "./fonts";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { SORTS, selectCatalog } from "./catalog";
import { mountKinds, renderActiveFilters } from "./catalog-controls";
import {
  rememberCatalog,
  rememberCatalogSelection,
} from "./catalog-navigation";
import { querySelector } from "./dom";
import { icon } from "./icons";
import { mountSiteNav } from "./nav";
import { renderChips, renderCount, renderList, renderOverview } from "./render";
import { parsePorters, parsePorts } from "./schema";
import {
  ASSETS_VALUES,
  CATEGORY_VALUES,
  type FilterKey,
  STATUS_VALUES,
} from "./types";
import { readFilterState, writeFilterState } from "./urlstate";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);
const catalog = querySelector<HTMLElement>("#catalog");
const chips = querySelector<HTMLElement>("#chips");
const activeFilters = querySelector<HTMLElement>("#active-filters");
const search = querySelector<HTMLInputElement>("#search");
const count = querySelector<HTMLElement>("#count");
const sort = querySelector<HTMLSelectElement>("#sort");
const filterToggle = querySelector<HTMLButtonElement>("#filter-toggle");
let state = readFilterState(search);
const filterGroups = [
  { key: "status", values: STATUS_VALUES },
  { key: "assets", values: ASSETS_VALUES },
  {
    key: "category",
    values: CATEGORY_VALUES.filter(
      (value) => value !== "app" && value !== "engine",
    ),
  },
] as const;

function rerender(history: "push" | "replace" | null = null): void {
  if (history) writeFilterState(state, history);
  rememberCatalog(state);
  const list = selectCatalog(ports, state);
  renderList(
    list,
    catalog,
    porters,
    state.kind === "all" && state.sort === "discovery",
  );
  renderCount(list.length, ports.length, count);
  renderChips(
    filterGroups.map((group) =>
      group.key === "category" &&
      (state.kind === "app" || state.kind === "engine")
        ? { ...group, values: [] }
        : group,
    ),
    state,
    chips,
    onToggle,
    onClear,
  );
  renderActiveFilters(activeFilters, state, onToggle);
  const total = Object.values(state.active).flat().length;
  const badge = querySelector<HTMLElement>("#filter-total");
  badge.textContent = String(total);
  badge.hidden = total === 0;
  filterToggle.setAttribute(
    "aria-label",
    total > 0 ? `Filters, ${total} active` : "Filters",
  );
  const groupedOption = sort.querySelector<HTMLOptionElement>(
    'option[value="discovery"]',
  );
  if (groupedOption) groupedOption.hidden = state.kind !== "all";
  sort.value =
    state.kind !== "all" && state.sort === "discovery" ? "name" : state.sort;
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-kind]",
  )) {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.kind === state.kind),
    );
  }
}

function onToggle(key: FilterKey, value: string): void {
  const values = state.active[key];
  const index = values.indexOf(value);
  if (index === -1) values.push(value);
  else values.splice(index, 1);
  rerender("push");
}

function onClear(): void {
  state.active = { status: [], assets: [], category: [] };
  state.q = "";
  state.kind = "all";
  search.value = "";
  rerender("push");
}

mountSiteNav("ports");
renderOverview(ports, porters);
mountKinds(querySelector("#kinds"), ports, (kind) => {
  state.kind = kind;
  if (kind === "app" || kind === "engine") state.active.category = [];
  rerender("push");
});
filterToggle.prepend(icon("filters"));
filterToggle.addEventListener("click", () => {
  chips.hidden = !chips.hidden;
  filterToggle.setAttribute("aria-expanded", String(!chips.hidden));
});
search.addEventListener("input", () => {
  state.q = search.value;
  rerender("replace");
});
sort.addEventListener("change", () => {
  state.sort = SORTS.find((value) => value === sort.value) ?? "discovery";
  rerender("push");
});
catalog.addEventListener("click", (event) => {
  if (event.target instanceof Element) {
    const card = event.target.closest<HTMLAnchorElement>(".card-link");
    const slug = card?.closest<HTMLElement>("[data-port]")?.dataset.port;
    if (slug) rememberCatalogSelection(slug);
  }
  if (event.target instanceof Element && event.target.closest("[data-reset]")) {
    onClear();
    search.focus();
  }
});
window.addEventListener("popstate", () => {
  state = readFilterState(search);
  rerender();
});
document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (document.querySelector("dialog[open]")) return;
  if (
    target instanceof HTMLElement &&
    (target.matches("input, textarea, select") || target.isContentEditable)
  )
    return;
  if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    search.focus();
  }
});
rerender();
window.addEventListener("pageshow", () =>
  requestAnimationFrame(() => {
    if (window.location.hash.startsWith("#port-")) {
      const card = document.getElementById(window.location.hash.slice(1));
      if (card && catalog.contains(card)) {
        card.scrollIntoView({ block: "center", behavior: "instant" });
        card
          .querySelector<HTMLAnchorElement>(".card-link")
          ?.focus({ preventScroll: true });
      }
    }
  }),
);
document.querySelector("search")?.removeAttribute("hidden");
for (const control of document.querySelectorAll("[data-enhancement]"))
  control.removeAttribute("hidden");
