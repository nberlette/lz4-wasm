<div align="center">

<a href="https://jsr.io/@nick/lz4/doc" target="_blank" title="View the @nick/lz4 package on JSR" rel="noopener nofollow">
  <picture align="center" alt="@nick/lz4" width="150">
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/logo_dark.png" type="image/png" />
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/logo.svg" type="image/svg+xml" />
    <source srcset="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/logo.svg" type="image/svg+xml" />
    <img alt="@nick/lz4" src="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/logo.png" width="150" />
  </picture>
</a>

# [@nick/lz4]

**[Ultra-fast] [LZ4] compressor/decompressor for JavaScript, written in Rust.**

<br>

[![][jsr-svg]][JSR] [![][issues-svg]][Issues] [![][playground-svg]][Playground]

</div>

---

## Install

```sh
deno add jsr:@nick/lz4
```

```sh
pnpm add jsr:@nick/lz4
```

```sh
yarn add jsr:@nick/lz4
```

```sh
bunx jsr add @nick/lz4
```

```sh
npx jsr add @nick/lz4
```

---

## Usage

```ts
import * as lz4 from "@nick/lz4";
import assert from "node:assert";

// let's fetch a huge webassembly binary (~4MB)
const data = await fetch(
  "https://plugins.dprint.dev/typescript-0.94.0.wasm",
).then((response) => response.bytes());

assert.strictEqual(data.length, 4083340); // OK

const compressed = lz4.compress(data);
assert.strictEqual(compressed.length, 1606997); // OK

const decompressed = lz4.decompress(compressed);
assert.strictEqual(decompressed.length, data.length); // OK

// byte-for-byte equality (large file so this is super slow)
assert.ok(decompressed.every((v, i) => v === data[i])); // OK
```

### CDN

Since this package is hosted on [JSR], the [`esm.sh`] CDN can be used to import
it directly in HTML files or JavaScript modules.

```html
<script type="module">
  import * as lz4 from "https://esm.sh/jsr/@nick/lz4";
</script>
```

#### Using an [import map]

```html
<script type="importmap">
  {
    "imports": { "@nick/lz4": "https://esm.sh/jsr/@nick/lz4" }
  }
</script>

<script type="module">
  import * as lz4 from "@nick/lz4";
</script>
```

> [!TIP]
>
> You can also specify the `"imports"` and `"scopes"` properties in a
> `deno.json` file, allowing you to share the same import map between browser
> and Deno environments.
>
> **[→ Learn more about `deno.json`]**

[→ Learn more about `deno.json`]: https://docs.deno.com/runtime/fundamentals/configuration/#dependencies "Read more about import maps in the Deno documentation"

---

## API

### `compress`

Compresses the input data using the LZ4 compression algorithm.

#### Signature

```ts ignore
function compress(data: Uint8Array): Uint8Array;
```

##### Params

**`data`** - The input data to compress, represented as a `Uint8Array`.

##### Return

The compressed data, also represented as a `Uint8Array`.

#### Example

Let's try compressing the inline WebAssembly file from this package! Silly, I
know, but it's an immutable example with a known size.

```ts
import { compress } from "@nick/lz4";
import assert from "node:assert";

const data = await fetch("https://jsr.io/@nick/lz4/0.1.0/lib/lz4.js")
  .then((res) => res.bytes());
assert.strictEqual(data.length, 12012); // OK

const compressed = compress(data);
assert.strictEqual(compressed.length, 9406); // OK
```

> [!TIP]
>
> Check out the **LZ4 [Playground]** to compress text and files right in your
> browser!

---

### `decompress`

Decompresses the input data using the LZ4 decompression algorithm.

#### Signature

```ts ignore
function decompress(data: Uint8Array): Uint8Array;
```

##### Params

**`data`** - The compressed data to decompress, represented as a `Uint8Array`.

##### Return

The decompressed data, also represented as a `Uint8Array`.

#### Example

Continuing with the same example, let's ensure that the decompressed data
matches the original data passed to the compressor.

```ts
import { compress, decompress } from "@nick/lz4";
import assert from "node:assert";

const data = await fetch(
  "https://jsr.io/@nick/lz4/0.1.0/lib/lz4.js",
).then((response) => response.bytes());

const compressed = compress(data);
assert.strictEqual(compressed.length, 9406); // OK

const decompressed = decompress(compressed);
assert.strictEqual(decompressed.length, data.length); // OK

// now we check that every byte is the same between two buffers.
// with large files this check would be VERY costly.
for (const [i, v] of decompressed.entries()) {
  assert.strictEqual(v, data[i]); // OK
}
```

---

## Performance

By all measures of the word, this package is **fast**. The following benchmarks
compare the performance of this package next to some other popular LZ4
implementations. Versions 3.x and up of `@nick/lz4` consistently outperform all
the other solutions, sometimes by a factor of 10x or more.

```ocaml
    CPU | AMD EPYC 7763 64-Core Processor
Runtime | Deno 2.2.9+98b7554 (x86_64-unknown-linux-gnu)

file:///workspaces/lz4-wasm/lz4.bench.ts

  benchmark               time/iter (avg)        iter/s      (min … max)           p75      p99     p995
----------------------- ----------------------------- --------------------- --------------------------

group compress - 10k
@nick/lz4     (0.3.2)           20.4 µs        49,060 ( 16.8 µs …   1.3 ms)  21.9 µs  40.0 µs  47.1 µs
@nick/lz4     (0.1.0)           61.8 µs        16,180 ( 53.6 µs …   1.1 ms)  60.8 µs 119.7 µs 128.7 µs
deno/x/lz4    (0.1.0)          373.7 µs         2,676 (350.2 µs … 806.7 µs) 368.2 µs 462.0 µs 469.7 µs
npm:lz4-wasm  (0.9.2)           26.2 µs        38,160 ( 22.1 µs …   6.0 ms)  23.4 µs  48.9 µs  53.6 µs
npm:lz4js     (0.2.0)           95.4 µs        10,480 ( 69.9 µs …   6.7 ms) 118.5 µs 203.0 µs 271.8 µs

summary
  @nick/lz4     (0.3.2)
     1.29x faster than npm:lz4-wasm  (0.9.2)
     3.03x faster than @nick/lz4     (0.1.0)
     4.68x faster than npm:lz4js     (0.2.0)
    18.33x faster than deno/x/lz4    (0.1.0)

group decompress - 10k
@nick/lz4     (0.3.2)            8.4 µs       119,200 (  6.2 µs …   2.2 ms)   7.0 µs  22.0 µs  65.2 µs
@nick/lz4     (0.1.0)           21.5 µs        46,500 ( 18.8 µs …   1.1 ms)  19.6 µs  42.8 µs  55.4 µs
deno/x/lz4    (0.1.0)          204.8 µs         4,884 ( 94.5 µs …   5.5 ms) 156.4 µs   2.1 ms   2.3 ms
npm:lz4-wasm  (0.9.2)            9.9 µs       101,500 (  7.9 µs …   3.6 ms)   8.6 µs  22.6 µs  50.0 µs
npm:lz4js     (0.2.0)          811.1 µs         1,233 ( 42.3 µs …   8.0 ms) 636.7 µs   5.2 ms   5.8 ms

summary
  @nick/lz4     (0.3.2)
     1.18x faster than npm:lz4-wasm  (0.9.2)
     2.56x faster than @nick/lz4     (0.1.0)
    24.41x faster than deno/x/lz4    (0.1.0)
    96.69x faster than npm:lz4js     (0.2.0)

group compress - 256k
@nick/lz4     (0.3.2)          922.2 µs         1,084 (866.3 µs …   8.8 ms) 883.0 µs   1.3 ms   1.5 ms
@nick/lz4     (0.1.0)            2.2 ms         456.7 (  2.0 ms …   4.4 ms)   2.0 ms   3.9 ms   4.2 ms
deno/x/lz4    (0.1.0)           11.2 ms          89.3 ( 10.9 ms …  14.6 ms)  11.1 ms  14.6 ms  14.6 ms
npm:lz4-wasm  (0.9.2)            1.1 ms         940.3 (  1.0 ms …   1.5 ms)   1.0 ms   1.4 ms   1.4 ms
npm:lz4js     (0.2.0)            2.0 ms         508.9 (  1.8 ms …   3.3 ms)   1.9 ms   3.0 ms   3.1 ms

summary
  @nick/lz4     (0.3.2)
     1.15x faster than npm:lz4-wasm  (0.9.2)
     2.13x faster than npm:lz4js     (0.2.0)
     2.37x faster than @nick/lz4     (0.1.0)
    12.14x faster than deno/x/lz4    (0.1.0)

group decompress - 256k
@nick/lz4     (0.3.2)          221.0 µs         4,525 (183.0 µs …   1.5 ms) 205.8 µs 442.3 µs 484.5 µs
@nick/lz4     (0.1.0)            1.0 ms         957.4 (972.3 µs …   4.7 ms) 990.1 µs   1.8 ms   1.9 ms
deno/x/lz4    (0.1.0)            4.4 ms         226.7 (  2.9 ms …  17.0 ms)   4.4 ms   9.5 ms  17.0 ms
npm:lz4-wasm  (0.9.2)          264.3 µs         3,784 (214.6 µs …   1.8 ms) 260.1 µs 455.6 µs 512.0 µs
npm:lz4js     (0.2.0)            1.5 ms         645.5 (892.0 µs …   3.5 ms)   1.7 ms   3.2 ms   3.5 ms

summary
  @nick/lz4     (0.3.2)
     1.20x faster than npm:lz4-wasm  (0.9.2)
     4.73x faster than @nick/lz4     (0.1.0)
     7.01x faster than npm:lz4js     (0.2.0)
    19.96x faster than deno/x/lz4    (0.1.0)

group compress - 512k
@nick/lz4     (0.3.2)            1.6 ms         630.6 (  1.5 ms …   2.8 ms)   1.6 ms   2.2 ms   2.2 ms
@nick/lz4     (0.1.0)            3.9 ms         256.4 (  3.5 ms …   9.5 ms)   3.6 ms   9.1 ms   9.5 ms
deno/x/lz4    (0.1.0)           18.8 ms          53.3 ( 16.3 ms …  28.6 ms)  18.4 ms  28.6 ms  28.6 ms
npm:lz4-wasm  (0.9.2)            2.1 ms         467.6 (  1.8 ms …   4.5 ms)   2.5 ms   3.9 ms   4.5 ms
npm:lz4js     (0.2.0)            3.6 ms         280.3 (  3.3 ms …   7.3 ms)   3.4 ms   5.7 ms   7.3 ms

summary
  @nick/lz4     (0.3.2)
     1.35x faster than npm:lz4-wasm  (0.9.2)
     2.25x faster than npm:lz4js     (0.2.0)
     2.46x faster than @nick/lz4     (0.1.0)
    11.84x faster than deno/x/lz4    (0.1.0)

group decompress - 512k
@nick/lz4     (0.3.2)          438.0 µs         2,283 (356.2 µs …   2.6 ms) 414.0 µs   1.2 ms   1.6 ms
@nick/lz4     (0.1.0)            2.0 ms         509.6 (  1.8 ms …   5.4 ms)   1.8 ms   4.1 ms   4.1 ms
deno/x/lz4    (0.1.0)            7.9 ms         127.1 (  6.6 ms …  17.1 ms)   7.6 ms  17.1 ms  17.1 ms
npm:lz4-wasm  (0.9.2)          469.5 µs         2,130 (405.8 µs …   1.6 ms) 436.0 µs 772.8 µs   1.3 ms
npm:lz4js     (0.2.0)            2.4 ms         416.1 (  1.7 ms …   6.7 ms)   2.6 ms   4.5 ms   4.5 ms

summary
  @nick/lz4     (0.3.2)
     1.07x faster than npm:lz4-wasm  (0.9.2)
     4.48x faster than @nick/lz4     (0.1.0)
     5.49x faster than npm:lz4js     (0.2.0)
    17.97x faster than deno/x/lz4    (0.1.0)

group compress - 1mb
@nick/lz4     (0.3.2)            3.2 ms         312.6 (  2.9 ms …   8.2 ms)   3.0 ms   8.1 ms   8.2 ms
@nick/lz4     (0.1.0)            6.9 ms         144.9 (  6.7 ms …  10.4 ms)   6.8 ms  10.4 ms  10.4 ms
deno/x/lz4    (0.1.0)           33.1 ms          30.2 ( 31.6 ms …  38.3 ms)  33.0 ms  38.3 ms  38.3 ms
npm:lz4-wasm  (0.9.2)            3.6 ms         281.1 (  3.4 ms …   6.4 ms)   3.5 ms   5.6 ms   6.4 ms
npm:lz4js     (0.2.0)            6.8 ms         147.9 (  6.4 ms …  10.2 ms)   6.5 ms  10.2 ms  10.2 ms

summary
  @nick/lz4     (0.3.2)
     1.11x faster than npm:lz4-wasm  (0.9.2)
     2.11x faster than npm:lz4js     (0.2.0)
     2.16x faster than @nick/lz4     (0.1.0)
    10.34x faster than deno/x/lz4    (0.1.0)

group decompress - 1mb
@nick/lz4     (0.3.2)          818.1 µs         1,222 (710.3 µs …   2.6 ms) 751.1 µs   1.6 ms   1.9 ms
@nick/lz4     (0.1.0)            4.2 ms         236.6 (  3.5 ms …   7.4 ms)   5.4 ms   7.4 ms   7.4 ms
deno/x/lz4    (0.1.0)           13.0 ms          77.0 ( 12.7 ms …  16.2 ms)  12.9 ms  16.2 ms  16.2 ms
npm:lz4-wasm  (0.9.2)          989.6 µs         1,011 (805.2 µs …   3.8 ms)   1.2 ms   2.7 ms   3.3 ms
npm:lz4js     (0.2.0)            3.7 ms         266.9 (  3.2 ms …   8.5 ms)   4.2 ms   7.8 ms   8.5 ms

summary
  @nick/lz4     (0.3.2)
     1.21x faster than npm:lz4-wasm  (0.9.2)
     4.58x faster than npm:lz4js     (0.2.0)
     5.17x faster than @nick/lz4     (0.1.0)
    15.87x faster than deno/x/lz4    (0.1.0)

group compress - 2mb
@nick/lz4     (0.3.2)            6.3 ms         158.3 (  5.7 ms …  11.4 ms)   6.0 ms  11.4 ms  11.4 ms
@nick/lz4     (0.1.0)           14.1 ms          70.8 ( 13.0 ms …  23.0 ms)  13.4 ms  23.0 ms  23.0 ms
deno/x/lz4    (0.1.0)           62.4 ms          16.0 ( 60.0 ms …  70.6 ms)  62.2 ms  70.6 ms  70.6 ms
npm:lz4-wasm  (0.9.2)            6.8 ms         147.4 (  6.7 ms …   8.6 ms)   6.7 ms   8.6 ms   8.6 ms
npm:lz4js     (0.2.0)           13.4 ms          74.4 ( 11.8 ms …  27.8 ms)  12.5 ms  27.8 ms  27.8 ms

summary
  @nick/lz4     (0.3.2)
     1.07x faster than npm:lz4-wasm  (0.9.2)
     2.13x faster than npm:lz4js     (0.2.0)
     2.24x faster than @nick/lz4     (0.1.0)
     9.88x faster than deno/x/lz4    (0.1.0)

group decompress - 2mb
@nick/lz4     (0.3.2)            1.7 ms         591.8 (  1.4 ms …   4.4 ms)   2.0 ms   4.0 ms   4.1 ms
@nick/lz4     (0.1.0)            7.5 ms         133.3 (  7.0 ms …  12.5 ms)   7.1 ms  12.5 ms  12.5 ms
deno/x/lz4    (0.1.0)           22.9 ms          43.6 ( 21.9 ms …  27.5 ms)  22.9 ms  27.5 ms  27.5 ms
npm:lz4-wasm  (0.9.2)            1.8 ms         554.4 (  1.6 ms …   4.5 ms)   1.7 ms   3.4 ms   3.4 ms
npm:lz4js     (0.2.0)            7.2 ms         138.8 (  5.9 ms …  18.4 ms)   8.1 ms  18.4 ms  18.4 ms

summary
  @nick/lz4     (0.3.2)
     1.07x faster than npm:lz4-wasm  (0.9.2)
     4.26x faster than npm:lz4js     (0.2.0)
     4.44x faster than @nick/lz4     (0.1.0)
    13.58x faster than deno/x/lz4    (0.1.0)

group compress - 4mb
@nick/lz4     (0.3.2)           11.4 ms          87.5 ( 11.1 ms …  14.8 ms)  11.3 ms  14.8 ms  14.8 ms
@nick/lz4     (0.1.0)           25.7 ms          38.8 ( 25.5 ms …  29.3 ms)  25.7 ms  29.3 ms  29.3 ms
deno/x/lz4    (0.1.0)          124.6 ms           8.0 (119.9 ms … 140.3 ms) 127.4 ms 140.3 ms 140.3 ms
npm:lz4-wasm  (0.9.2)           13.9 ms          71.7 ( 13.1 ms …  21.2 ms)  13.7 ms  21.2 ms  21.2 ms
npm:lz4js     (0.2.0)           27.1 ms          36.9 ( 24.4 ms …  42.3 ms)  26.6 ms  42.3 ms  42.3 ms

summary
  @nick/lz4     (0.3.2)
     1.22x faster than npm:lz4-wasm  (0.9.2)
     2.25x faster than @nick/lz4     (0.1.0)
     2.37x faster than npm:lz4js     (0.2.0)
    10.91x faster than deno/x/lz4    (0.1.0)

group decompress - 4mb
@nick/lz4     (0.3.2)            3.6 ms         274.8 (  2.9 ms …   9.5 ms)   4.3 ms   9.4 ms   9.5 ms
@nick/lz4     (0.1.0)           14.9 ms          67.3 ( 13.7 ms …  21.8 ms)  14.4 ms  21.8 ms  21.8 ms
deno/x/lz4    (0.1.0)           49.8 ms          20.1 ( 46.6 ms …  60.8 ms)  49.6 ms  60.8 ms  60.8 ms
npm:lz4-wasm  (0.9.2)            4.5 ms         221.8 (  3.4 ms …  13.3 ms)   5.1 ms  12.3 ms  13.3 ms
npm:lz4js     (0.2.0)           13.7 ms          72.9 ( 10.9 ms …  27.0 ms)  15.8 ms  27.0 ms  27.0 ms

summary
  @nick/lz4     (0.3.2)
     1.24x faster than npm:lz4-wasm  (0.9.2)
     3.77x faster than npm:lz4js     (0.2.0)
     4.08x faster than @nick/lz4     (0.1.0)
    13.68x faster than deno/x/lz4    (0.1.0)
```

> [!TIP]
>
> To run the benchmarks yourself, simply clone the repository and run the
> following command in the base directory:
>
> ```sh
> deno bench -A --no-check
> ```

---

## Further Reading

### Acknowledgements

This package was inspired by the [`deno.land/x/lz4`] module by [Denosaurs].

### Motivation and Goals

Initially this package was created with some pretty straightforward (albeit
ambitious) goals in mind. I wanted to create a ultra-lightweight compression
utility that could be used in a variety of runtime environments without any
dependencies.

- [x] **Reduced** the WASM binary size to be nearly 50% smaller!
- [x] **Extends** compatibility to support **all** WebAssembly-friendly runtimes
- [x] **Enabled** `no_std` in the Rust codebase, cutting down the file size
- [x] **Switched** to [`lol_alloc`] for fast, lightweight allocation
- [x] **Upgraded** to `lz4_flex`, improving performance by nearly 500%
- [x] **Published** to [JSR], the spiritual successor to `deno.land/x`

### Why LZ4?

I've experimented with a few different compression algorithms, and while LZ4 may
not produce the smallest compressed files, it's definitely the fastest based on
benchmarks run by [myself](#performance) and [others][zstd-benchmarks].

#### LZ4 vs. Brotli

LZ4 is a great choice for scenarios where speed is more important than
compression ratio. If you need a higher compression ratio and your use case can
deal with slower speeds and a larger compressor footprint, [Brotli] might be a
better option for you. Based on the [lzbench][zstd-benchmarks] benchmarks,
however, it's clear that LZ4 provides the fastest decompression throughput.

> [!TIP]
>
> If you're in the market for a fast brotli decompressor, check out
> [@nick/brotli] ([npm:debrotli]) for a blazing fast WebAssembly solution, and
> [@nick/brocha] ([npm:brocha]) for a pure TypeScript decompressor with speeds
> _almost_ as fast as its WebAssembly counterpart. `brocha` is a direct port to
> TypeScript from the original C++ [brotli] source code.
>
> **Disclaimer**: _I'm also the author of both of the aforementioned packages.
> Please forgive my shameless self-plug._ 🙃

---

## Contributing

Contributions are always welcome! Before [submitting a pull request], I kindly
ask that you first [open an issue] and start a discussion regarding the feature
or bug you would like to address. This helps contributions align with the goals
and scope of the project, ensuring a smoother integration process.

For additional details, please refer to the [contributing guidelines]. Thanks!

---

<div align="center">

**[MIT] © [Nicholas Berlette]. All rights reserved.**

<small>

[Github] · [JSR] · [Issues] · [Contribute] · [Docs] · [Playground]

<small>

This project is not affiliated with [LZ4], a trademark of [Yann Collet].

</small>

</small>

[![][badge-jsr]][JSR] [![][badge-jsr-score]][JSR Score]
[![][playground-svg]][Playground]

</div>

[MIT]: https://nick.mit-license.org "MIT © Nicholas Berlette. All rights reserved."
[JSR]: https://jsr.io/@nick/lz4 "View the @nick/lz4 package on JSR"
[JSR Score]: https://jsr.io/@nick/lz4/score "View the score for @nick/lz4 on JSR"
[Docs]: https://jsr.io/@nick/lz4/doc "View the API documentation for @nick/lz4 on jsr.io!"
[Issues]: https://github.com/nberlette/lz4-wasm/issues "View the GitHub Issue Tracker for @nick/lz4"
[Github]: https://github.com/nberlette/lz4-wasm#readme "Give this project a star on GitHub! ⭐️"
[@nick/lz4]: https://jsr.io/@nick/lz4 "View the @nick/lz4 package on JSR"
[npm:brocha]: https://npmjs.com/package/brocha "View the brocha package on npm"
[Contribute]: https://github.com/nberlette/lz4-wasm/blob/main/.github/CONTRIBUTING.md "Please read the Contributing Guidelines prior to making your first contribution."
[import map]: https://github.com/WICG/import-maps#readme "Read more about import maps"
[npm:debrotli]: https://npmjs.com/package/debrotli "View the debrotli package on npm"
[@nick/brotli]: https://jsr.io/@nick/brotli "View the @nick/brotli package on JSR"
[@nick/brocha]: https://jsr.io/@nick/brocha "View the @nick/brocha package on JSR"
[Playground]: https://lz4-play.vercel.app "Visit the LZ4 Playground to try out the API in your browser!"
[open an issue]: https://github.com/nberlette/lz4-wasm/issues/new "Found a bug? Please open an issue on the nberlette/lz4-wasm repository!"
[Nicholas Berlette]: https://github.com/nberlette "View the author's GitHub Profile at @nberlette"
[Yann Collet]: https://github.com/Cyan4973
[LZ4]: https://github.com/lz4/lz4 "View the official LZ4 project on GitHub"
[contributing guidelines]: https://github.com/nberlette/lz4-wasm/blob/main/.github/CONTRIBUTING.md "Please read the Contributing Guidelines prior to making your first contribution."
[submitting a pull request]: https://github.com/nberlette/lz4-wasm/compare "Submit a Pull Request on GitHub"
[LZ4 compression]: https://en.wikipedia.org/wiki/LZ4_compression "Read more about LZ4"
[zstd-benchmarks]: https://github.com/facebook/zstd#benchmarks "View the Zstandard benchmarks on GitHub"
[ultra-fast]: #performance "LZ4 has a well-known reputation for being the fastest compression algorithm available, with compression and decompression speeds in excess of 1.5GB/s and 3.5GB/s, respectively. This package is no exception to that rule, consistently outperforming other, more popular LZ4 packages in side-by-side benchmarks."
[`esm.sh`]: https://esm.sh "View the esm.sh CDN"
[`deno.land/x/lz4`]: https://deno.land/x/lz4 "View the original lz4 module that inspired this package on deno.land/x"
[`lol_alloc`]: https://crates.io/lol_alloc "View the lol_alloc crate on crates.io"
[brotli]: https://github.com/google/brotli#readme "View Google's Brotli compression algorithm on GitHub"
[denosaurs]: https://github.com/denosaurs "View the Denosaurs GitHub Organization"
[badge-jsr]: https://jsr.io/badges/@nick?style=for-the-badge&labelColor=000&color=000&logoColor=f7df1e "View all of @nick's packages on jsr.io"
[jsr-svg]: https://jsr.io/badges/@nick/lz4?style=for-the-badge&labelColor=000&color=000&logoColor=456 "View @nick/lz4 on jsr.io"
[badge-jsr-score]: https://jsr.io/badges/@nick/lz4/score?style=for-the-badge&labelColor=000&color=000&logoColor=456 "View the score for @nick/lz4 on jsr.io"
[playground-svg]: https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/lz4_play_badge.svg?sanitize=true "View the LZ4 Playground"
[issues-svg]: https://img.shields.io/github/issues/nberlette/lz4-wasm?style=for-the-badge&logo=github&color=black&labelColor=black&label=
