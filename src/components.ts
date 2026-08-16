import { el } from "./dom";
import { portUrl } from "./slug";
import type { Port, Porter } from "./types";
import { CATEGORY_LABELS, STATUS_LABELS } from "./types";

export const PORTER_LINK_LABELS: [keyof Porter, string][] = [
  ["github", "GitHub"],
  ["website", "Website"],
  ["social", "Social"],
  ["donate", "Donate"],
];

export const statusTagClass = (s: string): string => `st-${s}`;

export function renderTag(
  text: string,
  className = "tag",
): HTMLElementTagNameMap["span"] {
  return el("span", { class: className, children: [text] });
}

export function renderLinkTag(
  label: string,
  url: string,
): HTMLElementTagNameMap["a"] {
  return el("a", {
    class: "tag link",
    attrs: { href: url, target: "_blank", rel: "noopener" },
    children: [label],
  });
}

export function renderImage(
  url: string,
  className: string,
  alt = "",
): HTMLElementTagNameMap["img"] {
  const img = el("img", {
    class: className,
    attrs: { src: url, alt, loading: "lazy" },
  });
  img.addEventListener("error", () => {
    const ph = el("div", {
      class: `${className} ph`,
      attrs: { "aria-hidden": "true" },
      children: ["⬚"],
    });
    img.replaceWith(ph);
  });
  return img;
}

export function renderNotFound(
  container: HTMLElement,
  message: string,
  backLabel: string,
  backHref: string,
): void {
  document.title = "Not found · Miyoo Mini Ports";
  container.append(
    el("h1", {
      class: "detail-title not-found-title",
      children: ["Not found"],
    }),
    el("p", { class: "empty empty-left", children: [message] }),
    el("a", {
      class: "nav-link",
      attrs: { href: backHref },
      children: [backLabel],
    }),
  );
}

export function renderPortListItem(port: Port): HTMLElementTagNameMap["li"] {
  return el("li", {
    children: [
      el("a", {
        attrs: { href: portUrl(port.name) },
        children: [port.name],
      }),
      ...port.categories.map((category) =>
        el("span", {
          class: `tag cat-${category}`,
          children: [CATEGORY_LABELS[category]],
        }),
      ),
      el("span", { class: "tag-sep" }),
      el("span", {
        class: `tag st-${port.status}`,
        children: [STATUS_LABELS[port.status]],
      }),
    ],
  });
}
