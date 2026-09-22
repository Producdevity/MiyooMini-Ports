import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { filterPorts } from "./filter";
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

function querySelector<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`missing element: ${selector}`);
  return el;
}

const main = querySelector<HTMLElement>("#catalog");
const chips = querySelector<HTMLElement>("#chips");
const search = querySelector<HTMLInputElement>("#search");
const count = querySelector<HTMLElement>("#count");

const state = readFilterState(search);

const filterGroups: { key: FilterKey; values: readonly string[] }[] = [
  { key: "status", values: STATUS_VALUES },
  { key: "assets", values: ASSETS_VALUES },
  { key: "category", values: CATEGORY_VALUES },
];

function rerender(): void {
  writeFilterState(state);
  const list = filterPorts(ports, state);
  renderList(list, main, state.active.category.length === 0, porters, state);
  renderCount(list.length, ports.length, count);
  renderChips(filterGroups, state, chips, onToggle, onClear);
  const total = Object.values(state.active).flat().length;
  const badge = querySelector<HTMLElement>("#filter-total");
  badge.textContent = String(total);
  badge.hidden = total === 0;
}

function onToggle(key: FilterKey, value: string): void {
  const values = state.active[key];
  const i = values.indexOf(value);
  if (i === -1) values.push(value);
  else values.splice(i, 1);
  rerender();
}

function onClear(): void {
  state.active = { status: [], assets: [], category: [] };
  state.q = "";
  search.value = "";
  rerender();
}

search.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement) {
    state.q = event.target.value;
    rerender();
  }
});

const filterToggle = querySelector<HTMLButtonElement>("#filter-toggle");
filterToggle.prepend(icon("filters"));
filterToggle.addEventListener("click", () => {
  chips.hidden = !chips.hidden;
  filterToggle.setAttribute("aria-expanded", String(!chips.hidden));
});
main.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("[data-reset]")) {
    onClear();
    search.focus();
  }
});
document.addEventListener("keydown", (event) => {
  const target = event.target;
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
mountSiteNav("ports");
renderOverview(ports, porters);
rerender();

document.querySelector("search")?.removeAttribute("hidden");
