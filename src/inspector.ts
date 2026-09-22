import { pickPort } from "./catalog";
import {
  readCatalogSelection,
  rememberCatalogSelection,
} from "./catalog-navigation";
import { el } from "./dom";
import { icon } from "./icons";
import { renderInspector } from "./inspector-view";
import { adjacentPort, selectedPort } from "./selection";
import { slugify } from "./slug";
import type { Port, Porters } from "./types";

export function mountInspector(
  index: HTMLElement,
  panel: HTMLElement,
  porters: Porters,
): (ports: Port[]) => void {
  const content = panel.querySelector<HTMLElement>(".inspector-content");
  if (!content) throw new Error("Missing inspector content");
  const desktopContent = content;
  let ports: Port[] = [];
  let current: Port | undefined;
  let initialized = false;
  const phone = window.matchMedia("(max-width: 900px)");
  const announcement = document.getElementById("selection-status");
  const dialogContent = el("div", { class: "inspector-content" });
  const close = el("button", {
    class: "icon-button",
    attrs: { type: "button", "aria-label": "Close inspection" },
    children: [icon("close")],
  });
  const dialog = el("dialog", {
    class: "inspector-dialog",
    attrs: { "aria-labelledby": "preview-title" },
  });
  const controls: {
    previous: HTMLButtonElement;
    next: HTMLButtonElement;
    position: HTMLElement;
  }[] = [];
  const makeToolbar = (isDialog: boolean): HTMLElement => {
    const previous = el("button", {
      class: "icon-button",
      attrs: { type: "button", "aria-label": "Previous port" },
      children: [icon("back")],
    });
    const next = el("button", {
      class: "icon-button",
      attrs: { type: "button", "aria-label": "Next port" },
      children: [icon("arrow")],
    });
    const position = el("span", { class: "inspection-position" });
    previous.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    controls.push({ previous, next, position });
    return el("div", {
      class: "inspector-toolbar",
      children: [
        el("span", { class: "eyebrow", children: ["Port inspector"] }),
        position,
        previous,
        next,
        ...(isDialog ? [close] : []),
      ],
    });
  };
  const desktopToolbar = makeToolbar(false);
  panel.prepend(desktopToolbar);
  dialog.append(makeToolbar(true), dialogContent);
  document.body.append(dialog);

  function markSelection(port: Port | undefined, position: number): void {
    for (const control of controls) {
      control.previous.disabled = position <= 0;
      control.next.disabled = position < 0 || position >= ports.length - 1;
      control.position.textContent = `${String(position + 1).padStart(2, "0")} / ${String(ports.length).padStart(2, "0")}`;
    }
    for (const row of index.querySelectorAll<HTMLElement>("[data-port]")) {
      const selected = row.dataset.port === (port && slugify(port.name));
      row.dataset.selected = String(selected);
      const button = row.querySelector<HTMLButtonElement>(".preview-button");
      if (button) {
        button.hidden = false;
        button.setAttribute("aria-pressed", String(selected));
      }
    }
  }

  function select(port: Port | undefined, announce = false): void {
    const changed = port !== current;
    current = port;
    rememberCatalogSelection(port ? slugify(port.name) : "");
    const position = port ? ports.indexOf(port) : -1;
    markSelection(port, position);
    if (changed || !initialized) {
      initialized = true;
      renderInspector(port, porters, desktopContent);
      if (dialog.open)
        renderInspector(port, porters, dialogContent, "preview-title");
    }
    if (announce && announcement && port)
      announcement.textContent = `${port.name}. Port ${position + 1} of ${ports.length}.`;
    if (!port && dialog.open) dialog.close();
  }

  function step(direction: number): void {
    if (current) select(adjacentPort(ports, current, direction), true);
    if (!phone.matches)
      index
        .querySelector('[data-selected="true"]')
        ?.scrollIntoView({ block: "nearest" });
  }

  function inspect(port: Port): void {
    select(port, true);
    if (phone.matches) {
      renderInspector(port, porters, dialogContent, "preview-title");
      dialog.showModal();
    }
  }
  index.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>(".preview-button");
    const row = button?.closest<HTMLElement>("[data-port]");
    const port = ports.find(
      (candidate) => slugify(candidate.name) === row?.dataset.port,
    );
    if (port) inspect(port);
  });
  index.addEventListener("keydown", (event) => {
    if (
      !(event.target instanceof HTMLButtonElement) ||
      !event.target.matches(".preview-button")
    )
      return;
    const direction =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const buttons = [
      ...index.querySelectorAll<HTMLButtonElement>(".preview-button"),
    ];
    const buttonIndex = buttons.indexOf(event.target);
    const nextIndex = Math.max(
      0,
      Math.min(buttons.length - 1, buttonIndex + direction),
    );
    const target = buttons[nextIndex];
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest" });
    if (!phone.matches) select(ports[nextIndex], true);
  });
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
  dialog.addEventListener("close", () => {
    const trigger = index.querySelector<HTMLButtonElement>(
      '[data-selected="true"] .preview-button',
    );
    trigger?.focus({ preventScroll: true });
    trigger?.scrollIntoView({ block: "nearest" });
  });
  phone.addEventListener("change", () => {
    if (!phone.matches && dialog.open) dialog.close();
  });
  document.getElementById("surprise")?.addEventListener("click", () => {
    const port = pickPort(ports, current);
    if (port) {
      inspect(port);
      index
        .querySelector('[data-selected="true"]')
        ?.scrollIntoView({ block: "nearest" });
    }
  });
  return (visiblePorts: Port[]): void => {
    const firstRender = !initialized;
    ports = visiblePorts;
    select(
      selectedPort(
        ports,
        current ? slugify(current.name) : readCatalogSelection(),
      ),
    );
    if (firstRender && !phone.matches)
      index
        .querySelector('[data-selected="true"]')
        ?.scrollIntoView({ block: "nearest" });
  };
}
