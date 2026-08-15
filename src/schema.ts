import {
  ASSETS_VALUES,
  type Assets,
  CATEGORY_VALUES,
  type Category,
  type Port,
  type Porter,
  type Porters,
  STATUS_VALUES,
  type Status,
} from "./types";

const STATUS_SET: ReadonlySet<string> = new Set(STATUS_VALUES);
const ASSETS_SET: ReadonlySet<string> = new Set(ASSETS_VALUES);
const CATEGORY_SET: ReadonlySet<string> = new Set(CATEGORY_VALUES);

const isStatus = (value: string): value is Status => STATUS_SET.has(value);
const isAssets = (value: string): value is Assets => ASSETS_SET.has(value);
const isCategory = (value: string): value is Category =>
  CATEGORY_SET.has(value);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string => typeof value === "string";

const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.length > 0;

const isHttpsUrl = (value: string): boolean => value.startsWith("https://");

const isPorterArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isNonEmptyString) &&
  new Set(value).size === value.length;

function parsePort(value: unknown, index: number): Port {
  if (!isObject(value)) {
    throw new Error(`ports.json[${index}]: expected an object`);
  }
  const { name, category, status, assets, porter, upstream, notes, image } =
    value;

  if (!isNonEmptyString(name))
    throw new Error(`ports.json[${index}].name: expected non-empty string`);
  if (!isString(category))
    throw new Error(`ports.json[${index}].category: expected string`);
  if (!isString(status))
    throw new Error(`ports.json[${index}].status: expected string`);
  if (!isString(assets))
    throw new Error(`ports.json[${index}].assets: expected string`);
  if (!isPorterArray(porter))
    throw new Error(
      `ports.json[${index}].porter: expected a non-empty array of unique handles`,
    );
  if (!isNonEmptyString(upstream) || !isHttpsUrl(upstream))
    throw new Error(`ports.json[${index}].upstream: expected an https:// URL`);
  if (!isNonEmptyString(notes))
    throw new Error(`ports.json[${index}].notes: expected non-empty string`);

  if (!isCategory(category)) {
    throw new Error(
      `ports.json[${index}].category: "${category}" is not one of ${CATEGORY_VALUES.join(", ")}`,
    );
  }
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
  if (image !== undefined && (!isString(image) || !isHttpsUrl(image))) {
    throw new Error(`ports.json[${index}].image: expected an https:// URL`);
  }

  const port: Port = {
    name,
    category,
    status,
    assets,
    porter,
    upstream,
    notes,
  };
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

function parsePorterEntry(handle: string, value: unknown): Porter {
  if (!isObject(value)) {
    throw new Error(`porters.json["${handle}"]: expected an object`);
  }
  const { github, social, website, donate, bio } = value;

  if (!isNonEmptyString(github) || !isHttpsUrl(github)) {
    throw new Error(
      `porters.json["${handle}"].github: expected an https:// URL`,
    );
  }

  const porter: Porter = { github };
  const links: [string, unknown, keyof Porter][] = [
    ["social", social, "social"],
    ["website", website, "website"],
    ["donate", donate, "donate"],
  ];
  for (const [field, raw, key] of links) {
    if (raw === undefined) continue;
    if (!isNonEmptyString(raw) || !isHttpsUrl(raw)) {
      throw new Error(
        `porters.json["${handle}"].${field}: expected an https:// URL`,
      );
    }
    porter[key] = raw;
  }
  if (bio !== undefined) {
    if (!isNonEmptyString(bio)) {
      throw new Error(
        `porters.json["${handle}"].bio: expected non-empty string`,
      );
    }
    porter.bio = bio;
  }
  return porter;
}

interface PortersFile {
  $schema?: unknown;
  porters: Record<string, unknown>;
}

const isPortersFile = (value: unknown): value is PortersFile => {
  if (!isObject(value)) return false;
  if (!isObject(value.porters)) return false;
  return true;
};

export function parsePorters(value: unknown): Porters {
  if (!isPortersFile(value)) {
    throw new Error('porters.json: expected an object with a "porters" map');
  }
  const result: Porters = {};
  for (const [handle, entry] of Object.entries(value.porters)) {
    result[handle] = parsePorterEntry(handle, entry);
  }
  return result;
}
