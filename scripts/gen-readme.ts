import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parsePorters, parsePorts } from "../src/schema";
import type { Port, Porters } from "../src/types";
import {
  ASSETS_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  sortByCategoryThenName,
} from "../src/types";

const ROOT = resolve(import.meta.dirname, "..");
const README_PATH = resolve(ROOT, "README.md");
const PORTS_PATH = resolve(ROOT, "ports.json");
const PORTERS_PATH = resolve(ROOT, "porters.json");
const BEGIN = "<!-- BEGIN PORTS -->";
const END = "<!-- END PORTS -->";

function loadPorts(): Port[] {
  const raw: unknown = JSON.parse(readFileSync(PORTS_PATH, "utf8"));
  return parsePorts(raw);
}

function loadPorters(): Porters {
  const raw: unknown = JSON.parse(readFileSync(PORTERS_PATH, "utf8"));
  return parsePorters(raw);
}

function renderTable(ports: Port[], porters: Porters): string {
  const sorted = [...ports].sort(sortByCategoryThenName);

  const porterNames = (handles: string[]): string =>
    handles.map((h) => porters[h]?.name ?? h).join(", ");

  const rows = sorted.map(
    (p) =>
      `| [${p.name}](${p.upstream}) | ${p.categories.map((c) => CATEGORY_LABELS[c]).join(", ")} | ${STATUS_LABELS[p.status]} | ${ASSETS_LABELS[p.assets]} | ${porterNames(p.porter)} |`,
  );

  return [
    `| Port | Category | Status | Assets | Porter |`,
    `| --- | --- | --- | --- | --- |`,
  ]
    .concat(rows)
    .join("\n");
}

function spliceTable(readme: string, table: string): string {
  const beginIdx = readme.indexOf(BEGIN);
  const endIdx = readme.indexOf(END);
  if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
    throw new Error(
      `README.md is missing sentinel markers:\n  ${BEGIN}\n  ${END}`,
    );
  }
  const before = readme.slice(0, beginIdx + BEGIN.length);
  const after = readme.slice(endIdx);
  return `${before}\n\n${table}\n\n${after}`;
}

function main(): void {
  const ports = loadPorts();
  const porters = loadPorters();
  const table = renderTable(ports, porters);
  const readme = readFileSync(README_PATH, "utf8");
  const next = spliceTable(readme, table);
  writeFileSync(README_PATH, next);
  console.log(`Generated README table with ${ports.length} ports.`);
}

main();
