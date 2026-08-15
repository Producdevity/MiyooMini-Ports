import { el } from "./dom";
import { initThemeToggle } from "./theme";

export type NavPage = "ports" | "porters" | null;

export function mountSiteNav(current: NavPage): void {
  const mount = document.getElementById("site-nav");
  if (!mount) throw new Error("missing element: #site-nav");

  const link = (page: "ports" | "porters", href: string, label: string) =>
    el("a", {
      attrs: page === current ? { href, "aria-current": "page" } : { href },
      children: [label],
    });

  mount.replaceChildren(
    link("ports", "index.html", "Ports"),
    link("porters", "porters.html", "Porters"),
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
