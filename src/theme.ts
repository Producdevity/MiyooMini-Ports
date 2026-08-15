const STORAGE_KEY = "theme";

export function initThemeToggle(): void {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  if (!(button instanceof HTMLButtonElement)) return;

  const label = (): string =>
    root.dataset.theme === "dark" ? "Light" : "Dark";

  button.textContent = label();
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
    button.textContent = label();
  });
}
