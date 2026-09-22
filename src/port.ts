import "./fonts";
import portersData from "../porters.json";
import portsData from "../ports.json";
import { libraryReturnUrl } from "./catalog-navigation";
import { enhanceImages, renderNotFound } from "./components";
import { mountAnimation } from "./media";
import { mountSiteNav } from "./nav";
import { renderPort } from "./port-view";
import { detailSlug, portUrl, SITE_BASE } from "./routes";
import { parsePorters, parsePorts } from "./schema";
import { slugify } from "./slug";

const ports = parsePorts(portsData);
const porters = parsePorters(portersData);

function main(): void {
  const container = document.getElementById("detail");
  if (!container) throw new Error("missing element: #detail");

  const wanted = detailSlug("port");
  const port = ports.find((p) => slugify(p.name) === wanted);

  if (port === undefined) {
    renderNotFound(
      container,
      "No port matches this address.",
      "← All ports",
      SITE_BASE,
    );
  } else {
    if (window.location.pathname.endsWith("/port.html")) {
      window.location.replace(portUrl(port.name) + window.location.hash);
      return;
    }
    if (!container.querySelector("h1")) {
      container.replaceChildren();
      renderPort(port, ports, porters, container);
    }
    enhanceImages(container);
    mountAnimation(container);
    const back = container.querySelector<HTMLAnchorElement>(".back-link");
    if (back) back.href = libraryReturnUrl();
  }
}

mountSiteNav("ports");
main();
