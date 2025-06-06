#!/usr/bin/env -S deno run -Aq

// Lifted from @deno/wasmbuild@0.19.1
// Copyright (c) 2018-2025 the Deno authors. MIT license.

import { UntarStream } from "jsr:/@std/tar@^0.1.4/untar-stream";
import { colors } from "jsr:@can/si@0.1.0-rc.1/colors";
import { createTempFile } from "jsr:@david/temp@^0.1.1";
import { Path } from "jsr:@david/path@^0.2.0";

const wasmOptFileName = Deno.build.os === "windows"
  ? "wasm-opt.exe"
  : "wasm-opt";
const tag = "version_121";

export async function runWasmOpt(fileBytes: Uint8Array, ...args: string[]) {
  const binPath = await getWasmOptBinaryPath();
  using outputTempFile = await createTempFile();
  using inputTempFile = await createTempFile();
  await inputTempFile.write(fileBytes);
  if (
    !args.length ||
    !args.some((arg) => arg.startsWith("-O") || arg.startsWith("--opt"))
  ) {
    args.unshift("-Os");
  }
  if (!args.includes("--enable-bulk-memory-opt")) {
    args.push("--enable-bulk-memory-opt");
  }
  if (!args.includes("--all-features")) {
    args.push("--all-features");
  }
  args.push(
    inputTempFile.toString(),
    "-o",
    outputTempFile.toString(),
  );

  const p = new Deno.Command(binPath.toString(), {
    args,
    stdin: "inherit",
    stderr: "inherit",
    stdout: "inherit",
  }).spawn();

  const status = await p.status;

  if (!status.success) throw new Error(`error executing wasm-opt`);
  return await outputTempFile.readBytes();
}

async function fetchWithRetries(url: URL | string, maxRetries = 5) {
  let sleepMs = 250;
  let iterationCount = 0;
  while (true) {
    iterationCount++;
    try {
      const res = await fetch(url);
      if (res.ok || iterationCount > maxRetries) {
        return res;
      }
    } catch (err) {
      if (iterationCount > maxRetries) {
        throw err;
      }
    }
    console.warn(`Failed fetching. Retrying in ${sleepMs}ms...`);
    await new Promise((resolve) => setTimeout(resolve, sleepMs));
    sleepMs = Math.min(sleepMs * 2, 10_000);
  }
}

async function getWasmOptBinaryPath() {
  const cacheDirPathText = cacheDir();
  if (!cacheDirPathText) {
    throw new Error("Could not find cache directory.");
  }
  const cacheDirPath = new Path(cacheDirPathText);
  const tempDirPath = cacheDirPath.join("wasmbuild", tag);
  const wasmOptExePath = tempDirPath.join(
    `binaryen-${tag}/bin`,
    wasmOptFileName,
  );

  if (!(await wasmOptExePath.exists())) {
    await downloadBinaryen(tempDirPath);
    if (!(await wasmOptExePath.exists())) {
      throw new Error(
        `For some reason the wasm-opt executable did not exist after downloading at ${wasmOptExePath}.`,
      );
    }
  }

  return wasmOptExePath;
}

async function downloadBinaryen(tempPath: Path) {
  console.error(`${colors.bold.green("Downloading")} wasm-opt binary...`);

  const response = await fetchWithRetries(binaryenUrl());
  const entries = response.body?.pipeThrough(
    new DecompressionStream("gzip"),
  )?.pipeThrough(new UntarStream());

  for await (const entry of entries ?? []) {
    if (
      entry.path.endsWith(wasmOptFileName) ||
      entry.path.endsWith(".dylib")
    ) {
      const filePath = tempPath.join(entry.path);
      await filePath.parentOrThrow().ensureDir();
      await using file = await filePath.open({
        create: true,
        write: true,
        mode: 0o755,
      });
      await entry.readable?.pipeTo(file.writable);
    } else {
      await entry.readable?.cancel();
    }
  }
}

function binaryenUrl() {
  function getOs() {
    switch (Deno.build.os) {
      case "linux":
        return "linux";
      case "darwin":
        return "macos";
      case "windows":
        return "windows";
      default:
        throw new Error("Unsupported OS");
    }
  }

  const os = getOs();
  const arch = {
    "x86_64": "x86_64",
    "aarch64": "arm64",
  }[Deno.build.arch];
  return new URL(
    `https://github.com/WebAssembly/binaryen/releases/download/${tag}/binaryen-${tag}-${arch}-${os}.tar.gz`,
  );
}

// MIT License - Copyright (c) justjavac.
// https://github.com/justjavac/deno_dirs/blob/e8c001bbef558f08fd486d444af391729b0b8068/cache_dir/mod.ts
function cacheDir(): string | undefined {
  switch (Deno.build.os) {
    case "linux": {
      const xdg = Deno.env.get("XDG_CACHE_HOME");
      if (xdg) return xdg;
      const home = Deno.env.get("HOME");
      if (home) return `${home}/.cache`;
      break;
    }
    case "darwin": {
      const home = Deno.env.get("HOME");
      if (home) return `${home}/Library/Caches`;
      break;
    }
    case "windows":
      return Deno.env.get("LOCALAPPDATA") ?? undefined;
  }

  return undefined;
}

if (import.meta.main) {
  const [path, ...args] = Deno.args;
  const file = new Path(path);
  await runWasmOpt(await file.readBytes(), ...args);
}
