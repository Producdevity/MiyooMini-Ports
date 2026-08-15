import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { filterPorts } from "./filter";
import { mountSiteNav } from "./nav";
import { renderChips, renderCount, renderList } from "./render";
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

const main = querySelector<HTMLElement>("#main");
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

mountSiteNav("ports");
rerender();
