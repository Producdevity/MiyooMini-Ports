import {
  ASSETS_VALUES,
  type Assets,
  type Port,
  STATUS_VALUES,
  type Status,
} from "./types";

const STATUS_SET: ReadonlySet<string> = new Set(STATUS_VALUES);
const ASSETS_SET: ReadonlySet<string> = new Set(ASSETS_VALUES);

const isStatus = (value: string): value is Status => STATUS_SET.has(value);
const isAssets = (value: string): value is Assets => ASSETS_SET.has(value);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string => typeof value === "string";

function parsePort(value: unknown, index: number): Port {
  if (!isObject(value)) {
    throw new Error(`ports.json[${index}]: expected an object`);
  }
  const { name, category, status, assets, upstream, notes, image } = value;

  if (!isString(name))
    throw new Error(`ports.json[${index}].name: expected string`);
  if (!isString(category))
    throw new Error(`ports.json[${index}].category: expected string`);
  if (!isString(status))
    throw new Error(`ports.json[${index}].status: expected string`);
  if (!isString(assets))
    throw new Error(`ports.json[${index}].assets: expected string`);
  if (!isString(upstream))
    throw new Error(`ports.json[${index}].upstream: expected string`);
  if (!isString(notes))
    throw new Error(`ports.json[${index}].notes: expected string`);

  if (!isStatus(status)) {
    throw new Error(
      `ports.json[${index}].status: "${status}" is not one of ${STATUS_VALUES.join(", ")}`,
    );
  }
  if (!isAssets(assets)) {
    throw new Error(
      `ports.json[${index}].assets: "${assets}" is not one of ${ASSETS_VALUES.join(", ")}`,
    );
  }
  if (image !== undefined && !isString(image)) {
    throw new Error(`ports.json[${index}].image: expected string or omitted`);
  }

  const port: Port = { name, category, status, assets, upstream, notes };
  if (image !== undefined) port.image = image;
  return port;
}

interface CatalogFile {
  $schema?: unknown;
  ports: unknown[];
}

const isCatalogFile = (value: unknown): value is CatalogFile => {
  if (!isObject(value)) return false;
  if (!Array.isArray(value.ports)) return false;
  return true;
};

export function parsePorts(value: unknown): Port[] {
  if (!isCatalogFile(value)) {
    throw new Error('ports.json: expected an object with a "ports" array');
  }
  return value.ports.map(parsePort);
}
