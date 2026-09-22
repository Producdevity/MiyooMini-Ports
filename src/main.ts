import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { SORTS, selectCatalog } from "./catalog";
import { mountKinds, renderActiveFilters } from "./catalog-controls";
import { rememberCatalog } from "./catalog-navigation";
import { mountDiscovery } from "./discovery";
import { querySelector } from "./dom";
import { icon } from "./icons";
import { mountSiteNav } from "./nav";
import { renderChips, renderCount, renderList, renderOverview } from "./render";
import { parsePorters, parsePorts } from "./schema";
import { readPreference, savePreference } from "./storage";
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
const surprise = querySelector<HTMLButtonElement>("#surprise");
let state = readFilterState(search);
let view = readPreference("catalog-view") === "list" ? "list" : "grid";
const filterGroups = [
  { key: "status", values: STATUS_VALUES },
  { key: "assets", values: ASSETS_VALUES },
  { key: "category", values: CATEGORY_VALUES },
] as const;

function rerender(history: "push" | "replace" | null = null): void {
  if (history) writeFilterState(state, history);
  rememberCatalog(state);
  const list = selectCatalog(ports, state);
  renderList(list, catalog, porters);
  renderCount(list.length, ports.length, count);
  renderChips([...filterGroups], state, chips, onToggle, onClear);
  renderActiveFilters(activeFilters, state, onToggle);
  const total = Object.values(state.active).flat().length;
  const badge = querySelector<HTMLElement>("#filter-total");
  badge.textContent = String(total);
  badge.hidden = total === 0;
  filterToggle.setAttribute(
    "aria-label",
    total > 0 ? `Filters, ${total} active` : "Filters",
  );
  sort.value = state.sort;
  surprise.disabled = list.length === 0;
  surprise.title =
    list.length === 0
      ? "No ports in this selection"
      : "Discover a port from your current selection";
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

function setView(): void {
  catalog.dataset.view = view;
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-view]",
  )) {
    if (button === catalog) continue;
    button.setAttribute("aria-pressed", String(button.dataset.view === view));
  }
}

mountSiteNav("ports");
renderOverview(ports, porters);
mountKinds(querySelector("#kinds"), ports, (kind) => {
  state.kind = kind;
  rerender("push");
});
mountDiscovery(() => selectCatalog(ports, state));
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
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "button[data-view]",
)) {
  button.prepend(icon(button.dataset.view === "list" ? "list" : "grid"));
  button.addEventListener("click", () => {
    view = button.dataset.view === "list" ? "list" : "grid";
    savePreference("catalog-view", view);
    setView();
  });
}
catalog.addEventListener("click", (event) => {
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
setView();
document.querySelector("search")?.removeAttribute("hidden");
for (const control of document.querySelectorAll("[data-enhancement]"))
  control.removeAttribute("hidden");
