import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { enhanceImages, renderNotFound } from "./components";
import { mountSiteNav } from "./nav";
import { renderPorter } from "./porter-view";
import { detailSlug, porterUrl, SITE_BASE } from "./routes";
import { parsePorters, parsePorts } from "./schema";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);

function main(): void {
  const container = document.getElementById("detail");
  if (!container) throw new Error("missing element: #detail");

  const wanted = detailSlug("porter");

  if (wanted === null || !Object.hasOwn(porters, wanted)) {
    renderNotFound(
      container,
      "No porter matches this address.",
      "← All porters",
      `${SITE_BASE}porters.html`,
    );
  } else {
    if (window.location.pathname.endsWith("/porter.html")) {
      window.location.replace(porterUrl(wanted) + window.location.hash);
      return;
    }
    const porter = porters[wanted];
    const owned = ports
      .filter((p) => p.porter.includes(wanted))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!container.querySelector("h1")) {
      container.replaceChildren();
      renderPorter(wanted, porter, owned, container);
    }
    enhanceImages(container);
  }
}

mountSiteNav(null);
main();
