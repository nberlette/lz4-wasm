<div align="center">

# @nick/lz4

Lightweight LZ4 compression utility powered by WebAssembly.

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

## Usage

```ts
import * as lz4 from "@nick/lz4";

// let's fetch a huge webassembly binary (~4MB)
const data = await fetch("https://plugins.dprint.dev/typescript-0.94.0.wasm")
  .then((res) => res.bytes());
console.assert(data.length === 4083340); // OK

const compressed = lz4.compress(data);
console.assert(compressed.length === 1644878); // OK

const decompressed = lz4.decompress(compressed);
console.assert(decompressed.length === data.length); // OK
console.assert(decompressed.every((v, i) => v === data[i])); // OK
```

---

<div align="center">

[MIT] © [Nicholas Berlette]. All rights reserved.

[Github] · [Issues] · [Docs]

</div>

[MIT]: https://nick.mit-license.org
[Nicholas Berlette]: https://github.com/nberlette
[Github]: https://github.com/nberlette/lz4-wasm
[Issues]: https://github.com/nberlette/lz4-wasm/issues
[Docs]: https://jsr.io/@nick/lz4/doc
