<div align="center">

<h1 align="center">
  <a href="https://jsr.io/@nick/lz4/doc" target="_blank" title="View the @nick/lz4 package on JSR" rel="noopener nofollow">
    <picture align="center" alt="@nick/lz4" width="66%">
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/banner_dark.webp" type="image/webp" />
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/banner_light.webp" type="image/webp" />
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/banner_dark.png" type="image/png" />
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/banner_light.png" type="image/png" />
        <img alt="@nick/lz4" src="https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/banner_light.webp" width="66%" />
    </picture>
  </a>
</h1>

**Featherweight [LZ4 compression] with TypeScript and WebAssembly**

<br>

[![][badge-jsr-pkg]][@nick/lz4] [![][badge-jsr-score]][@nick/lz4]

</div>

---

## Install

```sh
deno add jsr:@nick/lz4
```

```sh
bunx jsr add @nick/lz4
```

```sh
pnpm dlx jsr add @nick/lz4
```

```sh
yarn dlx jsr add @nick/lz4
```

```sh
npx jsr add @nick/lz4
```

---

## Usage

```ts
import * as lz4 from "@nick/lz4";

// let's fetch a huge webassembly binary (~4MB)
const data = await fetch(
  "https://plugins.dprint.dev/typescript-0.94.0.wasm",
).then((response) => response.bytes());

console.assert(data.length === 4083340); // OK

const compressed = lz4.compress(data);
console.assert(compressed.length === 1644878); // OK

const decompressed = lz4.decompress(compressed);
console.assert(decompressed.length === data.length); // OK
console.assert(decompressed.every((v, i) => v === data[i])); // OK
```

### CDN

You can also use the package directly from a CDN, which is super useful for
running in a browser environment without needing to install anything.

#### Using [`esm.sh`] directly

```html
<script type="module">
  import * as lz4 from "https://esm.sh/jsr/@nick/lz4";
</script>
```

#### Using an [import map]

Leveraging an [import map] can help simplify your imports, allowing the same
code to be re-used across different environments. This is especially useful
for projects that may be using different package managers or module loaders.

```html
<script type="importmap">
  {
    "imports": {
      "@nick/lz4": "https://esm.sh/jsr/@nick/lz4"
    }
  }
</script>

<script type="module">
  import * as lz4 from "@nick/lz4";
</script>
```

> [!TIP]
>
> You can also specify the `"imports"` and `"scopes"` properties in a
> `deno.json` file, allowing you to share the same import map between
> browser and Deno environments.
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

Let's try compressing the inline WebAssembly file from this package! Silly,
I know, but it's an immutable example with a known size.

```ts
import { compress } from "@nick/lz4";

const data = await fetch("https://jsr.io/@nick/lz4@0.1.0/lib/lz4.js")
  .then((res) => res.bytes());

console.assert(data.length === 12012); // OK

const compressed = compress(data);

console.assert(compressed.length === 9459); // OK
```

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
import { decompress } from "@nick/lz4";

const data = await fetch(
  "https://jsr.io/@nick/lz4@0.1.0/lib/lz4.js",
).then((response) => response.bytes());

const compressed = compress(data);
console.assert(compressed.length === 9459); // OK

const decompressed = decompress(compressed);
console.assert(decompressed.length === data.length); // OK

// now we check that every byte is the same between the two buffers.
// note that with larger files a check like this would be VERY expensive.
console.assert(decompressed.every((v, i) => v === data[i])); // OK
```

---

## Further Reading

### Acknowledgements

This package was inspired by the [`deno.land/x/lz4`] module by [Denosaurs].

### Motivation and Goals

Initially this package was created with some pretty straightforward (albeit
ambitious) goals in mind. I wanted to create a ultra-lightweight compression
utility that could be used in a variety of runtime environments without any
dependencies.

- [x] **Reduce** WASM binary size as much as possible - cut in _half_!
- [x] **Extend** compatibility to support **all** WebAssembly-friendly runtimes
- [x] **Enable** the `no_std` attribute, emancipating it from rust-std
- [x] **Switch** to [`lol_alloc`] for lightweight, jovial memory allocation
- [x] **Update** `lz4-compressor` and `wasm-bindgen` to the latest versions
- [x] **Publish** to [JSR], the spiritual successor to `deno.land/x`

### Why LZ4?

I've experimented with a few different compression algorithms,
and while LZ4 may not be the _most_ efficient, the small footprint and fast
compression and decompression times make it a great choice for many use cases.

#### LZ4 vs. Brotli

LZ4 is a great choice for scenarios where speed is more important than
compression ratio. If you need a higher compression ratio and are willing to
sacrifice some speed, you might want to consider using [Brotli] instead.

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

[Github] · [Issues] · [Contribute] · [Docs]

</small>

[![][badge-jsr]][JSR]

</div>

[MIT]: https://nick.mit-license.org "MIT © Nicholas Berlette. All rights reserved."
[JSR]: https://jsr.io/@nick/lz4 "View the @nick/lz4 package on JSR"
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
[open an issue]: https://github.com/nberlette/lz4-wasm/issues/new "Found a bug? Please open an issue on the nberlette/lz4-wasm repository!"
[Nicholas Berlette]: https://github.com/nberlette "View the author's GitHub Profile at @nberlette"
[contributing guidelines]: https://github.com/nberlette/lz4-wasm/blob/main/.github/CONTRIBUTING.md "Please read the Contributing Guidelines prior to making your first contribution."
[submitting a pull request]: https://github.com/nberlette/lz4-wasm/compare "Submit a Pull Request on GitHub"
[LZ4 compression]: https://en.wikipedia.org/wiki/LZ4_compression "Read more about LZ4"

[`esm.sh`]: https://esm.sh "View the esm.sh CDN"
[`deno.land/x/lz4`]: https://deno.land/x/lz4 "View the original lz4 module that inspired this package on deno.land/x"
[`lol_alloc`]: https://crates.io/lol_alloc "View the lol_alloc crate on crates.io"
[brotli]: https://github.com/google/brotli#readme "View Google's Brotli compression algorithm on GitHub"
[denosaurs]: https://github.com/denosaurs "View the Denosaurs GitHub Organization"
[badge-jsr]: https://jsr.io/badges/@nick?style=for-the-badge&labelColor=000&color=000&logoColor=345 "View all of @nick's packages on jsr.io"
[badge-jsr-pkg]: https://jsr.io/badges/@nick/lz4?style=for-the-badge&labelColor=000&color=000&logoColor=f7df1e "View @nick/lz4 on jsr.io"
[badge-jsr-score]: https://jsr.io/badges/@nick/lz4/score?style=for-the-badge&labelColor=000&color=000&logoColor=f7df1e "View the score for @nick/lz4 on jsr.io"
