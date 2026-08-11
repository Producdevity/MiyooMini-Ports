import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parsePorts } from "../src/schema";
import type { Port } from "../src/types";

const PORTS_PATH = resolve(import.meta.dirname, "..", "ports.json");

function main(): void {
  const raw: unknown = JSON.parse(readFileSync(PORTS_PATH, "utf8"));
  let ports: Port[];
  try {
    ports = parsePorts(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`validation failed: ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`ports.json: ${ports.length} entries OK`);
}

main();
