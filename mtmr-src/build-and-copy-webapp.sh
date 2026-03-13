#!/bin/bash

# Build and copy the MTMR Designer React app to the WebApp folder
# This script is called by Xcode during the build process

set -e

# Get the project root (parent of mtmr-src)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEBAPP_DST="${PROJECT_ROOT}/mtmr-src/MTMR/WebApp"

echo "=========================================="
echo "Building MTMR Designer Web App for Bundle"
echo "=========================================="
echo "Project root: ${PROJECT_ROOT}"
echo "Destination: ${WEBAPP_DST}"

# Check if we're in a CI environment or if node_modules doesn't exist
if [ ! -d "${PROJECT_ROOT}/node_modules" ]; then
    echo "Installing root dependencies..."
    cd "${PROJECT_ROOT}"
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
fi

# Check server dependencies
if [ ! -d "${PROJECT_ROOT}/server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd "${PROJECT_ROOT}/server"
    npm install
fi

# Build the React app
echo "Building React app with Vite..."
cd "${PROJECT_ROOT}"
if command -v pnpm &> /dev/null; then
    pnpm run build
else
    npm run build
fi

# Copy to WebApp folder
echo "Copying built files to WebApp folder..."
rm -rf "${WEBAPP_DST}"
mkdir -p "${WEBAPP_DST}"
cp -r "${PROJECT_ROOT}/dist/"* "${WEBAPP_DST}/"

echo "=========================================="
echo "✓ Web app built and copied successfully"
echo "=========================================="
