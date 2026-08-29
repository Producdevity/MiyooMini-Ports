import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const svg = readFileSync("public/favicon.svg", "utf8");

function renderPng(size: number, background?: string): Uint8Array {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    ...(background === undefined ? {} : { background }),
  });
  return resvg.render().asPng();
}

function writeIco(sizes: number[]): void {
  const entries = sizes.map((size) => ({ size, png: renderPng(size) }));
  const headerLength = 6 + entries.length * 16;
  const ico = Buffer.alloc(
    headerLength +
      entries.reduce((total, entry) => total + entry.png.length, 0),
  );
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(entries.length, 4);
  let offset = headerLength;
  for (const [index, entry] of entries.entries()) {
    const base = 6 + index * 16;
    ico.writeUInt8(entry.size, base);
    ico.writeUInt8(entry.size, base + 1);
    ico.writeUInt16LE(1, base + 4);
    ico.writeUInt16LE(32, base + 6);
    ico.writeUInt32LE(entry.png.length, base + 8);
    ico.writeUInt32LE(offset, base + 12);
    Buffer.from(entry.png).copy(ico, offset);
    offset += entry.png.length;
  }
  writeFileSync("public/favicon.ico", ico);
}

writeIco([48, 32, 16]);
writeFileSync("public/icon-512.png", Buffer.from(renderPng(512)));
writeFileSync(
  "public/apple-touch-icon.png",
  Buffer.from(renderPng(180, "#F3EFE5")),
);
console.log("icons written to public/");
