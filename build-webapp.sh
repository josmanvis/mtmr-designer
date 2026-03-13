#!/bin/bash

# Build the MTMR Designer React app and copy to the WebApp folder for bundling
# This script should be run from the mtmr-designer root directory

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBAPP_DST="${SCRIPT_DIR}/mtmr-src/MTMR/WebApp"

echo "=========================================="
echo "Building MTMR Designer Web App"
echo "=========================================="

# Prefer pnpm (project standard), fall back to npm
if command -v pnpm &> /dev/null; then
    PKG_MGR="pnpm"
else
    PKG_MGR="npm"
fi

# Check if node_modules exists
if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
    echo "Installing dependencies with ${PKG_MGR}..."
    cd "${SCRIPT_DIR}"
    $PKG_MGR install
fi

# Build the React app
echo "Building React app with Vite..."
cd "${SCRIPT_DIR}"
$PKG_MGR run build

# Copy to WebApp folder
echo "Copying built files to WebApp folder..."
rm -rf "${WEBAPP_DST}"
mkdir -p "${WEBAPP_DST}"
cp -r "${SCRIPT_DIR}/dist/"* "${WEBAPP_DST}/"

echo "=========================================="
echo "Web app built and copied to: ${WEBAPP_DST}"
echo "=========================================="

# List the contents
ls -la "${WEBAPP_DST}"