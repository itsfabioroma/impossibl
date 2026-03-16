#!/bin/bash
# Compile cicada.c → public/cicada.wasm
set -e
CLANG=/opt/homebrew/opt/llvm@20/bin/clang
$CLANG --target=wasm32 -O2 -nostdlib \
  -Wl,--no-entry -Wl,--export-all \
  -o "$(dirname "$0")/../public/cicada.wasm" \
  "$(dirname "$0")/cicada.c"
echo "cicada.wasm built ($(wc -c < "$(dirname "$0")/../public/cicada.wasm") bytes)"
