import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import portersSchema from "../porters.schema.json";
import portsSchema from "../ports.schema.json";
import { parsePorters, parsePorts } from "../src/schema";

const ROOT = resolve(import.meta.dirname, "..");
const PORTS_PATH = resolve(ROOT, "ports.json");
const PORTERS_PATH = resolve(ROOT, "porters.json");

interface SchemaError {
  instancePath: string;
  schemaPath: string;
  message?: string;
}

function formatErrors(file: string, errors: SchemaError[]): string {
  return errors
    .map(
      (e) =>
        `${file}${e.instancePath}: ${e.message ?? "invalid"} (${e.schemaPath})`,
    )
    .join("\n");
}

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function main(): void {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validatePorts = ajv.compile(portsSchema);
  const validatePorters = ajv.compile(portersSchema);

  const portsRaw = loadJson(PORTS_PATH);
  const portersRaw = loadJson(PORTERS_PATH);

  if (!validatePorts(portsRaw)) {
    const errors = (validatePorts.errors ?? []) as SchemaError[];
    console.error(`validation failed:\n${formatErrors("ports.json", errors)}`);
    process.exitCode = 1;
    return;
  }
  if (!validatePorters(portersRaw)) {
    const errors = (validatePorters.errors ?? []) as SchemaError[];
    console.error(
      `validation failed:\n${formatErrors("porters.json", errors)}`,
    );
    process.exitCode = 1;
    return;
  }

  // Runtime parse (typed validation the browser also runs).
  const ports = parsePorts(portsRaw);
  const porters = parsePorters(portersRaw);

  // Referential integrity: every porter referenced exists, every entry is used.
  const known = new Set(Object.keys(porters));
  const used = new Set<string>();
  const dangling: string[] = [];
  for (const port of ports) {
    for (const handle of port.porter) {
      used.add(handle);
      if (!known.has(handle)) dangling.push(`${port.name}: ${handle}`);
    }
  }
  if (dangling.length > 0) {
    console.error(
      `validation failed: porter handles not in porters.json:\n  ${dangling.join("\n  ")}`,
    );
    process.exitCode = 1;
    return;
  }
  const unused = [...known].filter((handle) => !used.has(handle));
  if (unused.length > 0) {
    console.error(
      `validation failed: porters.json entries with no ports:\n  ${unused.join("\n  ")}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `ports.json: ${ports.length} entries OK, ${known.size} porters OK`,
  );
}

main();
