// Precompress build output (gzip + brotli) so static hosts can serve .gz/.br directly: node scripts/compress.mjs [dir]
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const root = process.argv[2] ?? "dist";
const TYPES = new Set([".js", ".css", ".html", ".json", ".geojson", ".svg"]);
const MIN_BYTES = 1024;

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

let raw = 0;
let br = 0;
for (const file of walk(root)) {
  if (!TYPES.has(extname(file))) continue;
  const data = readFileSync(file);
  if (data.length < MIN_BYTES) continue;
  const b = brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
  writeFileSync(`${file}.gz`, gzipSync(data, { level: 9 }));
  writeFileSync(`${file}.br`, b);
  raw += data.length;
  br += b.length;
}
console.log(`compressed ${(raw / 1e6).toFixed(1)} MB of text assets to ${(br / 1e6).toFixed(1)} MB (brotli)`);
