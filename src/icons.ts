const paths = {
  memory: "M5 2h11l4 4v16H4V3h1Zm3 1v5m4-5v5m4-5v5M8 13h8v5H8Z",
  handheld: "M5 2h14v20H5Zm3 3h8v7H8Zm-1 12h6m-3-3v6m5-5h2m0 3h2",
  search: "M4 3h9v2h2v9h-2v2H4v-2H2V5h2Zm11 12 7 7",
  arrow: "M3 12h18m-7-7h2v2h2v2h2v6h-2v2h-2v2h-2",
  back: "M21 12H3m7-7H8v2H6v2H4v6h2v2h2v2h2",
  external: "M13 3h8v8M21 3 10 14M9 4H3v17h17v-6",
  grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
  list: "M3 5h3m3 0h12M3 12h3m3 0h12M3 19h3m3 0h12",
  filters: "M3 5h5m4 0h9M3 12h12m4 0h2M3 19h5m4 0h9M8 2v6m7 1v6m-7 1v6",
  gamepad: "M6 6h12v2h3v10h-4v-3H7v3H3V8h3Zm1 3v5m-3-2h6m5-3h2m0 3h2",
  apps: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm14 0v7m-3-3h7",
  engine:
    "M7 7h10v10H7Zm3 3h4v4h-4ZM8 2v5m4-5v5m4-5v5M8 17v5m4-5v5m4-5v5M2 8h5m-5 4h5m-5 4h5m10-8h5m-5 4h5m-5 4h5",
  sun: "M8 8h8v8H8Zm4-7v4m0 14v4M1 12h4m14 0h4M4 4l3 3m10 10 3 3M4 20l3-3M17 7l3-3",
  moon: "M9 3H6v3H3v12h3v3h12v-3h3v-3h-9v-3H9Z",
  close: "M5 5h2v2h2v2h2v2h2v2h2v2h2v2h2M5 19v-2h2v-2h2v-2h2v-2h2V9h2V7h2V5h2",
  shuffle: "M3 6h5l8 12h5m-4-4h4v7M3 18h5l3-4m2-4 3-4h5m-4-3h4v7",
  check: "M3 12h3v3h3v3h3v-3h3v-3h3V9h3V6",
  info: "M5 2h14v3h3v14h-3v3H5v-3H2V5h3Zm7 8v8m0-12v2",
  users: "M5 3h6v7H5Zm11 2h5v6h-5ZM2 21v-6l3-3h6l3 3v6m3-8h3l2 2v6",
  inspect: "M3 8h3V5h12v3h3v8h-3v3H6v-3H3Zm6 1h6v6H9Z",
  data: "M5 2h10l5 5v15H4V2Zm9 1v6h6M8 13h8m-8 4h8",
} as const;

export type IconName = keyof typeof paths;

export function icon(name: IconName, className = "icon"): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const attributes = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.6",
    "stroke-linecap": "square",
    "stroke-linejoin": "miter",
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
