const paths = {
  mark: "M2 3h5v3h3v3h4V6h3V3h5v18h-6v-7h-2v3h-4v-3H8v7H2Z",
  memory: "M5 2h11l4 4v16H4V3h1Zm3 1v5m4-5v5m4-5v5M8 13h8v5H8Z",
  handheld:
    "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm1 3h8v7H8Zm0 12h4m-2-2v4m5-4h.01m1 3h.01",
  search: "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5.5-2 6 6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  back: "M20 12H4m6-6-6 6 6 6",
  external: "M13 3h8v8M21 3 10 14M9 4H3v17h17v-6",
  grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
  list: "M3 5h3m3 0h12M3 12h3m3 0h12M3 19h3m3 0h12",
  filters: "M3 5h5m4 0h9M3 12h12m4 0h2M3 19h5m4 0h9M8 2v6m7 1v6m-7 1v6",
  gamepad: "M6 6h12v2h3v10h-4v-3H7v3H3V8h3Zm1 3v5m-3-2h6m5-3h2m0 3h2",
  apps: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm14 0v7m-3-3h7",
  engine:
    "M7 7h10v10H7Zm3 3h4v4h-4ZM8 2v5m4-5v5m4-5v5M8 17v5m4-5v5m4-5v5M2 8h5m-5 4h5m-5 4h5m10-8h5m-5 4h5m-5 4h5",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-14v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5",
  moon: "M20.5 14A8.6 8.6 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z",
  close: "m6 6 12 12M6 18 18 6",
  shuffle: "M3 6h5l8 12h5m-4-4h4v7M3 18h5l3-4m2-4 3-4h5m-4-3h4v7",
  check: "m4 12 5 5L20 6",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-12v7m0-11v1",
  users: "M5 3h6v7H5Zm11 2h5v6h-5ZM2 21v-6l3-3h6l3 3v6m3-8h3l2 2v6",
  inspect: "M3 8h3V5h12v3h3v8h-3v3H6v-3H3Zm6 1h6v6H9Z",
  data: "M5 2h10l5 5v15H4V2Zm9 1v6h6M8 13h8m-8 4h8",
} as const;

export type IconName = keyof typeof paths;

export function icon(name: IconName, className = "icon"): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const attributes = {
    viewBox: "0 0 24 24",
    fill: name === "mark" ? "currentColor" : "none",
    stroke: name === "mark" ? "none" : "currentColor",
    "stroke-width": "1.6",
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
