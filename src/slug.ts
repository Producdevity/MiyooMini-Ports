export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['().]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function portUrl(name: string): string {
  return `port.html?p=${encodeURIComponent(slugify(name))}`;
}

export function porterUrl(handle: string): string {
  return `porter.html?p=${encodeURIComponent(handle)}`;
}
