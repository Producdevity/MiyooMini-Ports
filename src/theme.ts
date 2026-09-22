import { icon } from "./icons";
import { savePreference } from "./storage";

export function initThemeToggle(): void {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  if (!(button instanceof HTMLButtonElement)) return;
  const update = (): void => {
    const isDark = root.dataset.theme === "dark";
    button.replaceChildren(icon(isDark ? "sun" : "moon"));
    button.setAttribute(
      "aria-label",
      `Switch to ${isDark ? "light" : "dark"} theme`,
    );
    button.title = `Switch to ${isDark ? "light" : "dark"} theme`;
  };
  update();
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    savePreference("theme", next);
    update();
  });
}
