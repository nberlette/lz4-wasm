import * as lz4 from "./mod.ts";
import * as lz4_010 from "jsr:@nick/lz4@0.1.0";
import * as lz4_wasm from "https://unpkg.com/lz4-wasm@0.9.2/lz4_wasm_bg.js";
import * as lz4_legacy from "https://deno.land/x/lz4@v0.1.0/mod.ts";
import * as lz4js from "npm:lz4js@0.2.0";

import p from "./deno.json" with { type: "json" };

const bytes_4mb = await fetch(
  "https://plugins.dprint.dev/typescript-0.94.0.wasm",
).then((res) => res.bytes());

const bytes_10k = bytes_4mb.slice(0, 10 * 1024);
const bytes_256k = bytes_4mb.slice(0, 256 * 1024);
const bytes_512k = bytes_4mb.slice(0, 512 * 1024);
const bytes_1mb = bytes_4mb.slice(0, 1 * 1024 * 1024);
const bytes_2mb = bytes_4mb.slice(0, 2 * 1024 * 1024);

const targets = [
  { name: `${p.name}     (${p.version})`, lz4 },
  { name: `${p.name}     (0.1.0)`, lz4: lz4_010 },
  { name: "deno/x/lz4    (0.1.0)", lz4: lz4_legacy },
  { name: "npm:lz4-wasm  (0.9.2)", lz4: lz4_wasm },
  { name: "npm:lz4js     (0.2.0)", lz4: lz4js },
] as const;

const fixtures = [
  { group: "10k", data: bytes_10k },
  { group: "256k", data: bytes_256k },
  { group: "512k", data: bytes_512k },
  { group: "1mb", data: bytes_1mb },
  { group: "2mb", data: bytes_2mb },
  { group: "4mb", data: bytes_4mb },
] as const;

for (const { name, lz4 } of targets) {
  for (let { group, data } of fixtures) {
    group = "compress - " + group;
    Deno.bench({
      name,
      group,
      warmup: 100,
      // n: 1_000,
      fn: () => {
        lz4.compress(data);
      },
    });

    const compressed = lz4.compress(data);

    group = "de" + group;
    Deno.bench({
      name,
      group,
      warmup: 100,
      // n: 1_000,
      fn: () => {
        lz4.decompress(compressed);
      },
    });
  }
}
