import { el } from "./dom";
import { icon } from "./icons";
import { portUrl } from "./routes";
import type { Port, Porter } from "./types";
import { ASSET_REQUIREMENTS, CATEGORY_LABELS, STATUS_LABELS } from "./types";

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
  loading: "lazy" | "eager" = "lazy",
): HTMLElementTagNameMap["img"] {
  const img = el("img", {
    class: className,
    attrs: { src: url, alt, loading, decoding: "async" },
  });
  attachImageFallback(img);
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
    class: "credited-port",
    children: [
      renderImage(port.image, "credited-image"),
      el("div", {
        class: "credited-info",
        children: [
          el("p", {
            class: "card-category",
            children: [
              port.categories
                .map((category) => CATEGORY_LABELS[category])
                .join(" / "),
            ],
          }),
          el("a", {
            class: "credited-name",
            attrs: { href: portUrl(port.name) },
            children: [port.name],
          }),
          el("div", {
            class: "tags",
            children: [
              renderTag(
                STATUS_LABELS[port.status],
                `tag status st-${port.status}`,
              ),
              renderTag(ASSET_REQUIREMENTS[port.assets], "tag asset-tag"),
            ],
          }),
          el("p", { class: "notes", children: [port.notes] }),
        ],
      }),
      icon("arrow"),
    ],
  });
}

function attachImageFallback(img: HTMLImageElement): void {
  img.addEventListener("error", () => {
    const ph = el("div", {
      class: `${img.className} ph image-fallback`,
      attrs: img.alt
        ? { role: "img", "aria-label": img.alt }
        : { "aria-hidden": "true" },
      children: [
        icon("handheld"),
        el("span", { children: ["Artwork unavailable"] }),
      ],
    });
    img.replaceWith(ph);
  });
}

export function enhanceImages(container: HTMLElement): void {
  for (const img of container.querySelectorAll("img")) {
    attachImageFallback(img);
    if (img.complete && img.naturalWidth === 0)
      img.dispatchEvent(new Event("error"));
  }
}
