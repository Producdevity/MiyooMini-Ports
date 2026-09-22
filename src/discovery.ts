import { pickPort } from "./catalog";
import { renderImage, renderTag } from "./components";
import { el } from "./dom";
import { icon } from "./icons";
import { portUrl } from "./routes";
import { ASSET_REQUIREMENTS, type Port, STATUS_LABELS } from "./types";

export function mountDiscovery(getPorts: () => Port[]): void {
  const trigger = document.getElementById("surprise");
  if (!(trigger instanceof HTMLButtonElement)) return;
  trigger.hidden = false;
  trigger.prepend(icon("shuffle"));
  const content = el("div", { class: "discovery-content" });
  const close = el("button", {
    class: "icon-button dialog-close",
    attrs: { type: "button", "aria-label": "Close discovery" },
    children: [icon("close")],
  });
  const another = el("button", {
    class: "button button-secondary",
    attrs: { type: "button" },
    children: [icon("shuffle"), "Pick another"],
  });
  const dialog = el("dialog", {
    class: "discovery-dialog",
    attrs: { "aria-labelledby": "discovery-title" },
    children: [
      close,
      el("p", { class: "eyebrow", children: ["A pocket-sized detour"] }),
      content,
      another,
    ],
  });
  let previous: Port | undefined;
  function choose(): void {
    const ports = getPorts();
    const port = pickPort(ports, previous);
    if (!port) return;
    previous = port;
    another.disabled = ports.length < 2;
    content.replaceChildren(
      renderImage(port.image, "discovery-image", `${port.name} artwork`),
      el("h2", { attrs: { id: "discovery-title" }, children: [port.name] }),
      el("div", {
        class: "tags",
        children: [
          renderTag(STATUS_LABELS[port.status], `tag status st-${port.status}`),
          renderTag(ASSET_REQUIREMENTS[port.assets], "tag asset-tag"),
        ],
      }),
      el("p", {
        class: "discovery-caption",
        children: [
          "Picked from your current selection. Check the port notes before installing.",
        ],
      }),
      el("a", {
        class: "button button-primary",
        attrs: { href: portUrl(port.name) },
        children: ["Explore this port", icon("arrow")],
      }),
    );
  }
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  another.addEventListener("click", choose);
  trigger.addEventListener("click", () => {
    if (getPorts().length === 0) return;
    choose();
    dialog.showModal();
  });
  document.body.append(dialog);
}
