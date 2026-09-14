import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { el, querySelector } from "./dom";
import { mountSiteNav } from "./nav";
import { renderPorterCard } from "./porters-view";
import { parsePorters, parsePorts } from "./schema";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);

function main(): void {
  const container = querySelector<HTMLElement>("#porters");
  const search = document.getElementById("porter-search");
  const count = document.getElementById("count");

  const sorted = Object.entries(porters).sort((a, b) => {
    const countA = ports.filter((p) => p.porter.includes(a[0])).length;
    const countB = ports.filter((p) => p.porter.includes(b[0])).length;
    return countB - countA || a[0].localeCompare(b[0]);
  });

  function render(q: string): void {
    container.replaceChildren();
    const needle = q.trim().toLowerCase();
    const shown = sorted.filter(([handle, porter]) => {
      if (!needle) return true;
      const owned = ports
        .filter((p) => p.porter.includes(handle))
        .map((p) => p.name)
        .join(" ");
      const haystack = [handle, porter.name ?? "", porter.bio ?? "", owned]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
    if (shown.length === 0) {
      container.append(
        el("div", {
          class: "empty",
          attrs: { role: "status" },
          children: ["Nobody matches."],
        }),
      );
    } else {
      container.append(
        el("div", {
          class: "porters-grid",
          children: shown.map(([h, p], i) => renderPorterCard(h, p, i, ports)),
        }),
      );
    }
    if (count) {
      count.textContent = `${shown.length} / ${sorted.length}`;
    }
  }

  if (search instanceof HTMLInputElement) {
    search.addEventListener("input", (event) => {
      if (event.target instanceof HTMLInputElement) {
        render(event.target.value);
      }
    });
  }

  render("");
  document.querySelector("search")?.removeAttribute("hidden");
}

mountSiteNav("porters");
main();
