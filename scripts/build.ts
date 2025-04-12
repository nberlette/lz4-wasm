#!/usr/bin/env -S deno run -Aq --no-config

import { runWasmOpt } from "./wasm_opt.ts";
import { $ } from "jsr:@david/dax@0.42.0";
import { colors } from "jsr:@can/si@0.1.0-rc.1/colors";

function rewriteWasmExports(src: string, path: string) {
  return src.replace(
    /^\s*export\s+\*\s+from\s+(["'])(\S+?\.internal\.m?js)\1;?\s*$/gm,
    (_, q, p) => {
      const internal = Deno.readTextFileSync(
        path.replace(/(?<=\/)[^/]+$/, p).replace(/\/\.\//g, "/"),
      );
      const re =
        /export\s+(?:const|function|class)\s+((?!_)[^\s(={]+?)\s*(?:[(={])/g;
      const exports = new Set<string>();
      for (const m of internal.matchAll(re)) exports.add(m[1]);
      return $.dedent`
      export {
        ${[...exports].join(",\n  ")},
      } from ${q}${p}${q};
    `;
    },
  );
}

async function optimize(path?: string, optLevel = "-O4") {
  let src = await Deno.readTextFile(path ||= "./lib/lz4.js");

  // remove internal exports from the public API
  // (there's no reason to expose all of the `__wbg_*` stuff to the user)
  src = rewriteWasmExports(src, path);

  const startMark = 'const bytes = base64decode("', endMark = '");\n';
  let start = src.indexOf(startMark);
  const end = src.indexOf(endMark, start);
  if (start === -1 || end === -1) {
    console.error(
      colors.bold.red(" ✖️ Error") +
        ": No base64 encoded bytes found in " +
        path,
    );
    Deno.exit(1);
  }
  start += startMark.length;
  const base64 = src.slice(start, end).trim();
  const bytes = Uint8Array.from(
    atob(base64.replaceAll(/\\|\s+/g, "")),
    (c) => c.charCodeAt(0),
  );
  const optimizedBytes = await runWasmOpt(bytes, optLevel);
  const optimized = btoa(
    optimizedBytes.reduce((a, b) => a + String.fromCharCode(b), ""),
  ).replace(/.{77}/g, "$&\\\n");
  const out = src.slice(0, start) + optimized + src.slice(end);
  await Deno.writeTextFile(path, out);

  // we always write notices and debug info to stderr.
  // stdout is reserved for output intended to be piped to other programs.
  const pctSavings = (src.length - out.length) / src.length * 100;
  console.warn(
    "\n" +
      colors.bold.green(" ✔️ Optimized") +
      " inline WebAssembly from " +
      colors.red(prettyBytes(src.length)) +
      " ⇒ " +
      colors.bold.underline.green(prettyBytes(out.length)) +
      ". You saved " +
      colors.bold.yellow(pctSavings.toFixed(2) + "%") +
      "!\n",
  );
}

async function build(...args: string[]) {
  args = [
    "run",
    "-Aq",
    "--no-config",
    "jsr:@deno/wasmbuild@0.19.1",
    "--inline",
    "--skip-opt",
    ...args,
  ];

  const p = new Deno.Command(Deno.execPath(), {
    args,
    stdin: "inherit",
    stderr: "inherit",
    stdout: "inherit",
  }).spawn();

  const out = await p.output();
  if (out.code !== 0) {
    console.error(
      colors.bold.red(" ✖️ Error") +
        ": Failed to build the WASM module.",
    );
    console.error("\n" + new TextDecoder().decode(out.stderr) + "\n");
    Deno.exit(1);
  }

  let outDir = "lib";
  if (args.includes("--out")) {
    const outIndex = args.indexOf("--out");
    if (outIndex + 1 < args.length) {
      outDir = args[outIndex + 1];
    }
  }
  const path = `${outDir}/lz4.js`;

  await optimize(path, "-O4");

  console.error(
    colors.bold.green(" ✔️ Success") +
      ": Built and optimized the WASM module at " +
      colors.bold.underline.green(path),
  );
}

function prettyBytes(
  size: number | string,
  precision = 2,
  iec = false,
  unitOverride?: string,
): string {
  const units_si = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
  const units_iec = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] as const;
  size = +size;
  if (isNaN(size) || !isFinite(size)) return "NaN";
  const units = iec ? units_iec : units_si;
  const factor = iec ? 1024 : 1000;
  let i = 0;
  for (i = 0; size >= factor && i < units.length - 1; size /= factor, i++);
  size = (+size.toFixed(precision)).toLocaleString(["en-US"], {
    useGrouping: true,
    maximumFractionDigits: precision,
    style: "decimal",
  });
  return `${size} ${unitOverride ?? units[i]}`;
}

if (import.meta.main) await build(...Deno.args);
