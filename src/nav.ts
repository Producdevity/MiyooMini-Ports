import { el } from "./dom";
import { initThemeToggle } from "./theme";

export type NavPage = "ports" | "porters" | null;

const GITHUB_URL = "https://github.com/Producdevity/MiyooMini-Ports";

const GITHUB_MARK =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38" +
  " 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13" +
  "-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66" +
  ".07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15" +
  "-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27" +
  ".68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12" +
  ".51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48" +
  " 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8" +
  "c0-4.42-3.58-8-8-8z";

function githubIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", GITHUB_MARK);
  path.setAttribute("fill", "currentColor");
  svg.append(path);
  return svg;
}

export function mountSiteNav(current: NavPage): void {
  const mount = document.getElementById("site-nav");
  if (!mount) throw new Error("missing element: #site-nav");

  const link = (page: "ports" | "porters", href: string, label: string) =>
    el("a", {
      attrs: page === current ? { href, "aria-current": "page" } : { href },
      children: [label],
    });

  const github = el("a", {
    class: "nav-github",
    attrs: {
      href: GITHUB_URL,
      target: "_blank",
      rel: "noopener",
      "aria-label": "GitHub (opens in a new tab)",
    },
  });
  github.append(githubIcon());

  mount.replaceChildren(
    link("ports", "index.html", "Ports"),
    link("porters", "porters.html", "Porters"),
    github,
    el("button", {
      class: "chip theme-toggle",
      attrs: {
        id: "theme-toggle",
        type: "button",
        "aria-label": "Switch color theme",
      },
      children: ["Dark"],
    }),
  );

  initThemeToggle();
}
