import * as lz4 from "./lib/lz4.js";

/**
 * Compresses the input data using LZ4 compression.
 * The input data is expected to be a byte array.
 *
 * The output is a byte array containing the compressed data.
 */
export function compress(input: Uint8Array): Uint8Array {
  return lz4.compress(input);
}

/**
 * Decompresses the input data using LZ4 decompression.
 *
 * The input data is expected to be a byte array.
 * The output is a byte array containing the decompressed data.
 */
export function decompress(input: Uint8Array): Uint8Array {
  return lz4.decompress(input);
}
