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

#[wasm_bindgen]
#[cfg(any(feature = "compress", not(feature = "decompress")))]
/// Compresses the input data using LZ4 compression.
/// The input data is expected to be a byte array.
///
/// The output is a byte array containing the compressed data.
pub fn compress(input: Box<[u8]>) -> Vec<u8> {
  ::lz4_flex::block::compress_prepend_size(&input.as_ref())
}

#[wasm_bindgen]
#[cfg(any(feature = "decompress", not(feature = "compress")))]
/// Decompresses the input data using LZ4 decompression.
///
/// The input data is expected to be a byte array.
/// The output is a byte array containing the decompressed data.
pub fn decompress(input: Box<[u8]>) -> Result<Vec<u8>, JsValue> {
  ::lz4_flex::block::decompress_size_prepended(&input.as_ref())
    .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
  loop {} // no-op panic handler for WebAssembly
}
