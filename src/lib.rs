// Copyright (c) 2025 Nicholas Berlette. All rights reserved. MIT License.
#![no_std]
#![cfg(target_arch = "wasm32")]

extern crate alloc;
use alloc::boxed::Box;
use alloc::string::ToString;
use alloc::vec::Vec;
use wasm_bindgen::prelude::*;

#[cfg(all(feature = "alloc", not(feature = "mt")))]
use lol_alloc::AssumeSingleThreaded;
#[cfg(feature = "alloc")]
use lol_alloc::FreeListAllocator;
#[cfg(all(feature = "alloc", feature = "mt"))]
use lol_alloc::LockedAllocator;

#[global_allocator]
#[cfg(all(feature = "alloc", not(feature = "mt")))]
// SAFETY: This app is single threaded, so AssumeSingleThreaded is allowed.
static ALLOCATOR: AssumeSingleThreaded<FreeListAllocator> =
  unsafe { AssumeSingleThreaded::new(FreeListAllocator::new()) };

#[global_allocator]
#[cfg(all(feature = "alloc", feature = "mt"))]
static ALLOCATOR: LockedAllocator<FreeListAllocator> =
  LockedAllocator::new(FreeListAllocator::new());

// =============================================================================
// Standard LZ4 Block Format APIs (no size prefix)
// =============================================================================

#[wasm_bindgen(js_name = compressRaw)]
#[cfg(any(feature = "compress", not(feature = "decompress")))]
/// Compresses data using standard LZ4 block format.
///
/// This produces raw LZ4 compressed data without any size prefix, conforming
/// to the LZ4 block format specification. Use this when interoperability with
/// other LZ4 implementations is required.
///
/// **Note:** When decompressing, you must know the original uncompressed size.
/// Use `decompressRaw` with the `uncompressedSize` parameter, or use the
/// size-prefixed `compress`/`decompress` functions for simpler usage.
pub fn compress_raw(input: Box<[u8]>) -> Vec<u8> {
  ::lz4_flex::block::compress(input.as_ref())
}

#[wasm_bindgen(js_name = decompressRaw)]
#[cfg(any(feature = "decompress", not(feature = "compress")))]
/// Decompresses data using standard LZ4 block format.
///
/// This decompresses raw LZ4 compressed data (without a size prefix).
/// You must provide the `uncompressedSize` parameter, which should be the
/// exact size of the original uncompressed data.
///
/// **Note:** This function is for use with standard LZ4 block format data.
/// If your data was compressed with `compress` (size-prefixed), use
/// `decompress` instead.
pub fn decompress_raw(
  input: Box<[u8]>,
  uncompressed_size: usize,
) -> Result<Vec<u8>, JsValue> {
  ::lz4_flex::block::decompress(input.as_ref(), uncompressed_size)
    .map_err(|e| JsValue::from_str(&e.to_string()))
}

// =============================================================================
// Size-Prefixed LZ4 Block Format APIs (convenience format)
// =============================================================================

#[wasm_bindgen]
#[cfg(any(feature = "compress", not(feature = "decompress")))]
/// Compresses data using LZ4 block format with a 4-byte size prefix.
///
/// The output includes a 4-byte little-endian prefix containing the original
/// uncompressed size, followed by the LZ4 compressed data. This format enables
/// decompression without needing to know the original size beforehand.
///
/// **Note:** This format is specific to this library and `lz4_flex`. Data
/// compressed with this function may not be directly compatible with other
/// LZ4 tools (like the `lz4` CLI) that expect standard LZ4 frame format.
/// Use `compressRaw` for standard LZ4 block format without the size prefix.
pub fn compress(input: Box<[u8]>) -> Vec<u8> {
  ::lz4_flex::block::compress_prepend_size(input.as_ref())
}

#[wasm_bindgen]
#[cfg(any(feature = "decompress", not(feature = "compress")))]
/// Decompresses data that was compressed with `compress` (size-prefixed
/// format).
///
/// The input is expected to have a 4-byte little-endian size prefix followed
/// by LZ4 compressed data. This prefix is automatically read to determine the
/// output buffer size.
///
/// **Note:** This function expects data in the size-prefixed format produced
/// by `compress`. For standard LZ4 block format data (no size prefix), use
/// `decompressRaw` with the known uncompressed size.
pub fn decompress(input: Box<[u8]>) -> Result<Vec<u8>, JsValue> {
  ::lz4_flex::block::decompress_size_prepended(input.as_ref())
    .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
  loop {} // no-op panic handler for WebAssembly
}
