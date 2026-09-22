import { SITE_BASE } from "./routes";

const previews: Record<string, string> = {
  "https://raw.githubusercontent.com/Producdevity/balatro-miyoo-mini-port/master/docs/images/gameplay.gif": `${SITE_BASE}images/balatro-preview.webp`,
};

export function stillImage(source: string): string {
  return previews[source] ?? source;
}

export function mountAnimation(container: HTMLElement): void {
  const image = container.querySelector<HTMLImageElement>(
    ".plate-img[data-animation]",
  );
  const button =
    container.querySelector<HTMLButtonElement>(".animation-toggle");
  if (!image || !button || !image.dataset.animation) return;
  const animation = image.dataset.animation;
  const poster = image.src;
  button.hidden = false;
  button.addEventListener("click", () => {
    const playing = button.getAttribute("aria-pressed") !== "true";
    image.src = playing ? animation : poster;
    button.setAttribute("aria-pressed", String(playing));
    button.textContent = playing ? "Pause animation" : "Play animation";
  });
  image.addEventListener("error", () => {
    button.hidden = true;
  });
}
