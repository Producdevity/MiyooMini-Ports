import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { el, querySelector } from "./dom";
import { icon } from "./icons";
import { mountSiteNav } from "./nav";
import { renderPorterCard } from "./porters-view";
import { parsePorters, parsePorts } from "./schema";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);
const container = querySelector<HTMLElement>("#porters");
const search = querySelector<HTMLInputElement>("#porter-search");
const count = querySelector<HTMLElement>("#count");
const sorted = Object.entries(porters).sort((a, b) => {
  const countA = ports.filter((port) => port.porter.includes(a[0])).length;
  const countB = ports.filter((port) => port.porter.includes(b[0])).length;
  return countB - countA || a[0].localeCompare(b[0]);
});

function render(): void {
  const needle = search.value.trim().toLowerCase();
  const shown = sorted.filter(([handle, porter]) => {
    const owned = ports
      .filter((port) => port.porter.includes(handle))
      .map((port) => port.name)
      .join(" ");
    return [handle, porter.name ?? "", porter.bio ?? "", owned]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  container.replaceChildren();
  if (shown.length === 0) {
    const reset = el("button", {
      class: "button button-secondary",
      attrs: { type: "button" },
      children: ["Clear search", icon("arrow")],
    });
    reset.addEventListener("click", () => {
      search.value = "";
      updateQuery();
      render();
      search.focus();
    });
    container.append(
      el("div", {
        class: "empty",
        children: [
          icon("users", "empty-icon"),
          el("h3", { children: ["No makers found."] }),
          el("p", {
            children: [
              "Try a different name, or search for a port they worked on.",
            ],
          }),
          reset,
        ],
      }),
    );
  } else {
    container.append(
      el("div", {
        class: "porters-grid",
        children: shown.map(([handle, porter], index) =>
          renderPorterCard(handle, porter, index, ports),
        ),
      }),
    );
  }
  count.textContent =
    shown.length === sorted.length
      ? `${sorted.length} community makers`
      : `${shown.length} of ${sorted.length} makers`;
}

function updateQuery(): void {
  const params = new URLSearchParams();
  if (search.value.trim()) params.set("q", search.value);
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${params.size ? `?${params}` : ""}`,
  );
}

search.value = new URLSearchParams(window.location.search).get("q") ?? "";
search.addEventListener("input", () => {
  updateQuery();
  render();
});
window.addEventListener("popstate", () => {
  search.value = new URLSearchParams(window.location.search).get("q") ?? "";
  render();
});
mountSiteNav("porters");
render();
document.querySelector("search")?.removeAttribute("hidden");
