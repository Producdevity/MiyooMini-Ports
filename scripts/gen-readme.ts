import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parsePorts } from "../src/schema";
import type { Port } from "../src/types";

const ROOT = resolve(import.meta.dirname, "..");
const README_PATH = resolve(ROOT, "README.md");
const PORTS_PATH = resolve(ROOT, "ports.json");
const BEGIN = "<!-- BEGIN PORTS -->";
const END = "<!-- END PORTS -->";

const assetsLabel: Readonly<Record<Port["assets"], string>> = {
  free: "free",
  owned: "owned data",
};

function loadPorts(): Port[] {
  const raw: unknown = JSON.parse(readFileSync(PORTS_PATH, "utf8"));
  return parsePorts(raw);
}

function renderTable(ports: Port[]): string {
  const sorted = [...ports].sort(
    (a, b) =>
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );

  const rows = sorted.map((p) =>
    [
      `[${p.name}](${p.upstream})`,
      p.category,
      p.status,
      assetsLabel[p.assets],
    ].join(" | "),
  );

  return [`| Port | Category | Status | Assets |`, `| --- | --- | --- | --- |`]
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
  const table = renderTable(ports);
  const readme = readFileSync(README_PATH, "utf8");
  const next = spliceTable(readme, table);
  writeFileSync(README_PATH, next);
  console.log(`Generated README table with ${ports.length} ports.`);
}

main();
