import { el } from "./dom";
import { icon } from "./icons";
import { SITE_BASE } from "./routes";
import { initThemeToggle } from "./theme";

export type NavPage = "ports" | "porters" | null;

export function renderSiteNav(current: NavPage): void {
  const mount = document.getElementById("site-nav");
  if (!mount) throw new Error("missing element: #site-nav");
  const link = (page: "ports" | "porters", href: string, label: string) =>
    el("a", {
      class: "nav-link",
      attrs: page === current ? { href, "aria-current": "page" } : { href },
      children: [label],
    });
  mount.replaceChildren(
    el("a", {
      class: "brand",
      attrs: { href: SITE_BASE, "aria-label": "Miyoo Mini Ports home" },
      children: [
        icon("mark", "brand-icon"),
        el("span", {
          children: [
            el("span", { class: "brand-model", children: ["Miyoo Mini"] }),
            el("strong", { children: ["Ports"] }),
          ],
        }),
      ],
    }),
    el("div", {
      class: "nav-pages",
      children: [
        link("ports", SITE_BASE, "Library"),
        link("porters", `${SITE_BASE}porters.html`, "Porters"),
      ],
    }),
    el("div", {
      class: "nav-tools",
      children: [
        el("a", {
          class: "nav-source",
          attrs: {
            href: "https://github.com/Producdevity/MiyooMini-Ports",
            target: "_blank",
            rel: "noopener",
            "aria-label": "GitHub (opens in a new tab)",
          },
          children: [el("span", { children: ["GitHub"] }), icon("external")],
        }),
        el("button", {
          class: "icon-button theme-toggle",
          attrs: {
            id: "theme-toggle",
            type: "button",
            hidden: true,
            "aria-label": "Switch to dark theme",
          },
          children: [icon("moon")],
        }),
      ],
    }),
  );
}

export function mountSiteNav(current: NavPage): void {
  if (!document.querySelector("#site-nav a")) renderSiteNav(current);
  document.getElementById("theme-toggle")?.removeAttribute("hidden");
  initThemeToggle();
  for (const mount of document.querySelectorAll(".search-icon")) {
    mount.replaceChildren(icon("search"));
  }
}
