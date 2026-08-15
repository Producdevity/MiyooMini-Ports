import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { filterPorts } from "./filter";
import { renderChips, renderCount, renderList } from "./render";
import { parsePorters, parsePorts } from "./schema";
import { initThemeToggle } from "./theme";
import {
  ASSETS_VALUES,
  CATEGORY_VALUES,
  type FilterKey,
  type FilterState,
  STATUS_VALUES,
} from "./types";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);

function querySelector<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`missing element: ${selector}`);
  return el;
}

const main = querySelector<HTMLElement>("#main");
const chips = querySelector<HTMLElement>("#chips");
const search = querySelector<HTMLInputElement>("#search");
const count = querySelector<HTMLElement>("#count");

const state: FilterState = { q: "", active: {} };

const filterGroups: { key: FilterKey; values: readonly string[] }[] = [
  { key: "status", values: STATUS_VALUES },
  { key: "assets", values: ASSETS_VALUES },
  { key: "category", values: CATEGORY_VALUES },
];

function rerender(): void {
  const list = filterPorts(ports, state);
  renderList(list, main, !state.active.category, porters);
  renderCount(list.length, ports.length, count);
  renderChips(filterGroups, state, chips, onToggle, onClear);
}

function onToggle(key: FilterKey, value: string): void {
  state.active[key] = state.active[key] === value ? undefined : value;
  rerender();
}

function onClear(): void {
  state.active = {};
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

initThemeToggle();
rerender();
