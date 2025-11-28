import * as lz4 from "./lib/lz4.js";

// =============================================================================
// Standard LZ4 Block Format APIs (no size prefix)
// =============================================================================

/**
 * Compresses data using standard LZ4 block format (no size prefix).
 *
 * This produces raw LZ4 compressed data conforming to the LZ4 block format
 * specification. Use this when interoperability with other LZ4 implementations
 * is required.
 *
 * **Important:** When decompressing, you must know the original uncompressed
 * size. Use {@link decompressRaw} with the `uncompressedSize` parameter.
 *
 * @param input The data to compress, as a `Uint8Array`.
 * @returns The compressed data as a `Uint8Array` (standard LZ4 block format).
 *
 * @example
 * ```ts
 * import { compressRaw, decompressRaw } from "@nick/lz4";
 *
 * const data = new TextEncoder().encode("Hello, World!");
 * const originalSize = data.length;
 *
 * const compressed = compressRaw(data);
 * const decompressed = decompressRaw(compressed, originalSize);
 * ```
 *
 * @see {@link decompressRaw} for decompressing standard LZ4 block data
 * @see {@link compress} for the size-prefixed format (simpler but non-standard)
 */
export function compressRaw(input: Uint8Array): Uint8Array {
  return lz4.compressRaw(input);
}

/**
 * Decompresses data using standard LZ4 block format (no size prefix).
 *
 * This decompresses raw LZ4 compressed data. You must provide the exact
 * uncompressed size as a parameter.
 *
 * @param input The compressed data to decompress, as a `Uint8Array`.
 * @param uncompressedSize The exact size of the original uncompressed data.
 * @returns The decompressed data as a `Uint8Array`.
 * @throws {Error} If decompression fails or the uncompressed size is incorrect.
 *
 * @example
 * ```ts
 * import { compressRaw, decompressRaw } from "@nick/lz4";
 *
 * const data = new TextEncoder().encode("Hello, World!");
 * const originalSize = data.length;
 *
 * const compressed = compressRaw(data);
 * const decompressed = decompressRaw(compressed, originalSize);
 * ```
 *
 * @see {@link compressRaw} for compressing in standard LZ4 block format
 * @see {@link decompress} for the size-prefixed format (simpler but non-standard)
 */
export function decompressRaw(
  input: Uint8Array,
  uncompressedSize: number,
): Uint8Array {
  return lz4.decompressRaw(input, uncompressedSize);
}

// =============================================================================
// Size-Prefixed LZ4 Block Format APIs (convenience format)
// =============================================================================

/**
 * Compresses data using LZ4 block format with a 4-byte size prefix.
 *
 * The output includes a 4-byte little-endian prefix containing the original
 * uncompressed size, followed by the LZ4 compressed data. This enables
 * decompression without needing to know the original size beforehand.
 *
 * **Note:** This format is specific to this library and the underlying
 * [`lz4_flex`](https://docs.rs/lz4_flex) Rust crate. Data compressed with
 * this function is **not directly compatible** with:
 * - The `lz4` command-line tool (which uses LZ4 frame format)
 * - Other libraries expecting standard LZ4 block or frame format
 *
 * For standard LZ4 block format without the size prefix, use {@link compressRaw}.
 *
 * @param input The data to compress, as a `Uint8Array`.
 * @returns The compressed data as a `Uint8Array` (size-prefixed format).
 *
 * @example
 * ```ts
 * import { compress, decompress } from "@nick/lz4";
 *
 * const data = new TextEncoder().encode("Hello, World!");
 * const compressed = compress(data);
 * const decompressed = decompress(compressed);
 * ```
 *
 * @see {@link decompress} for decompressing size-prefixed data
 * @see {@link compressRaw} for standard LZ4 block format (interoperable)
 */
export function compress(input: Uint8Array): Uint8Array {
  return lz4.compress(input);
}

/**
 * Decompresses data that was compressed with {@link compress} (size-prefixed format).
 *
 * The input is expected to have a 4-byte little-endian size prefix followed
 * by LZ4 compressed data. This prefix is automatically read to determine the
 * output buffer size.
 *
 * **Note:** This function expects data in the size-prefixed format produced
 * by {@link compress}. For standard LZ4 block format data (no size prefix),
 * use {@link decompressRaw} with the known uncompressed size.
 *
 * @param input The compressed data to decompress, as a `Uint8Array`.
 * @returns The decompressed data as a `Uint8Array`.
 * @throws {Error} If decompression fails or the data format is invalid.
 *
 * @example
 * ```ts
 * import { compress, decompress } from "@nick/lz4";
 *
 * const data = new TextEncoder().encode("Hello, World!");
 * const compressed = compress(data);
 * const decompressed = decompress(compressed);
 * ```
 *
 * @see {@link compress} for compressing in size-prefixed format
 * @see {@link decompressRaw} for standard LZ4 block format (interoperable)
 */
export function decompress(input: Uint8Array): Uint8Array {
  return lz4.decompress(input);
}
