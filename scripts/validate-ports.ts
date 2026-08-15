import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../ports.schema.json";

const ROOT = resolve(import.meta.dirname, "..");
const PORTS_PATH = resolve(ROOT, "ports.json");

interface SchemaError {
  instancePath: string;
  schemaPath: string;
  message?: string;
}

function formatErrors(errors: SchemaError[]): string {
  return errors
    .map(
      (e) =>
        `ports.json${e.instancePath}: ${e.message ?? "invalid"} (${e.schemaPath})`,
    )
    .join("\n");
}

function main(): void {
  const raw: unknown = JSON.parse(readFileSync(PORTS_PATH, "utf8"));

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  if (!validate(raw)) {
    const errors = (validate.errors ?? []) as SchemaError[];
    console.error(`validation failed:\n${formatErrors(errors)}`);
    process.exitCode = 1;
    return;
  }

  const count = Array.isArray((raw as { ports?: unknown }).ports)
    ? (raw as { ports: unknown[] }).ports.length
    : 0;
  console.log(`ports.json: ${count} entries OK`);
}

main();
