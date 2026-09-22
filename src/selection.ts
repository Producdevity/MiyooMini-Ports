import { slugify } from "./slug";
import type { Port } from "./types";

export function selectedPort(
  ports: Port[],
  slug: string | null,
): Port | undefined {
  return ports.find((port) => slugify(port.name) === slug) ?? ports[0];
}

export function adjacentPort(
  ports: Port[],
  current: Port,
  direction: number,
): Port {
  const index = ports.indexOf(current);
  return (
    ports[Math.max(0, Math.min(ports.length - 1, index + direction))] ?? current
  );
}
