const paths = {
  handheld:
    "M7 2h10a2 2 0 0 1 2 2v15a3 3 0 0 1-3 3H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z M8 5h8v7H8Z M8 17h4m-2-2v4m5-3h.01m2 2h.01",
  search: "M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm5.5 13 5 5",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  back: "M20 12H4m6-6-6 6 6 6",
  external:
    "M14 4h6v6m0-6L10 14m0-10H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5",
  bookmark: "M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1Z",
  grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
  list: "M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1",
  filters: "M3 6h6m4 0h8M3 18h12m4 0h2M3 12h1m4 0h13M9 3v6m-5 0v6m11 0v6",
  gamepad:
    "M8 7h8a4 4 0 0 1 4 3l2 7a2 2 0 0 1-3.5 1.8L16 16H8l-2.5 2.8A2 2 0 0 1 2 17l2-7a4 4 0 0 1 4-3Zm-2 5h4m-2-2v4m7-3h.01m3 2h.01",
  apps: "M4 4h6v6H4Zm10 0h6v6h-6ZM4 14h6v6H4Zm13-1v8m-4-4h8",
  engine: "M8 3h8v5h5v8h-5v5H8v-5H3V8h5Zm1 6h6v6H9Z",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5",
  moon: "M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z",
  close: "m6 6 12 12M6 18 18 6",
  chevron: "m7 10 5 5 5-5",
  shuffle:
    "M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3.5-2 5-4M13 9c1.5-2 3-3 5-3h3m-4-4 4 4-4 4",
  check: "m5 12 4 4L19 6",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 9v6m0-10h.01",
  users:
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-7 18v-2a7 7 0 0 1 14 0v2M17 4a4 4 0 0 1 0 7m2 4a6 6 0 0 1 3 5v1",
} as const;

export type IconName = keyof typeof paths;

export function icon(name: IconName, className = "icon"): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const attributes = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.65",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    focusable: "false",
    class: className,
  };
  for (const [key, value] of Object.entries(attributes))
    svg.setAttribute(key, value);
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", paths[name]);
  svg.append(path);
  return svg;
}
