# MTMR Designer Auto-Launch Fix

## Problem
When launching MTMR Designer / MTMR 2026 as a native macOS app, users see a white page instead of the designer interface. The app expects either:
1. A running Express server at `localhost:3001` (development mode)
2. Bundled web files in `mtmr-src/MTMR/WebApp/` (production mode)

## Solution
The app now automatically uses bundled web files when available, with a custom URL scheme handler (`mtmr-app://`) that serves files and handles API calls natively without requiring an Express server.

## How It Works

### Development Mode (localhost:3001)
When no bundled files exist, the app loads from `http://localhost:3001`:
```bash
# Terminal 1: Start the dev server
pnpm run dev

# Terminal 2: Launch MTMR 2026 from Xcode or Applications
```

### Production Mode (Bundled)
When bundled files exist in `mtmr-src/MTMR/WebApp/`, the app uses them automatically:
1. Web files are served via custom `mtmr-app://` scheme
2. API calls (`/api/*`) are handled natively by `AppSchemeHandler.swift`
3. No Express server needed

## Building for Production

### Option 1: Manual Build (Recommended for Development)
```bash
# From project root
./build-webapp.sh
```

This builds the React app and copies it to `mtmr-src/MTMR/WebApp/`.

### Option 2: Xcode Build Phase (Automatic)
Add a "Run Script" build phase in Xcode:

1. Open `mtmr-src/MTMR.xcodeproj` in Xcode
2. Select the MTMR target
3. Go to "Build Phases"
4. Click "+" → "New Run Script Phase"
5. Name it "Build Web App"
6. Drag it to run BEFORE "Copy Bundle Resources"
7. Add this script:

```bash
# Build and bundle the web app
cd "${PROJECT_DIR}/.."
./build-webapp.sh
```

8. Check "Based on dependency analysis" to avoid rebuilding unnecessarily

### Option 3: Pre-Build Script (For CI/CD)
```bash
# From project root
./mtmr-src/build-and-copy-webapp.sh
```

This is a more robust version that checks for dependencies and installs them if needed.

## Architecture

### DesignerWindowController.swift
- Checks for bundled files at startup
- Falls back to `localhost:3001` if no bundle found
- Logs which mode it's using

### AppSchemeHandler.swift
- Implements `WKURLSchemeHandler` for `mtmr-app://` scheme
- Serves static files from `WebApp/` folder
- Handles API endpoints natively:
  - `/api/load-mtmr` - Read MTMR config
  - `/api/save-mtmr` - Write MTMR config
  - `/api/config-path` - Get config path
  - `/api/health` - Health check
  - `/api/check-mtmr-running` - Check if MTMR is running
  - `/api/launch-mtmr` - Launch MTMR (no-op in bundled mode)

### Frontend (src/utils/mtmrFileSystem.js)
- Uses relative URLs (`/api/*`)
- Works in both modes without changes
- No hardcoded `localhost` references

## Verification

### Check if bundled mode is active:
1. Launch MTMR 2026
2. Open Console.app
3. Filter for "MTMR 2026"
4. Look for: `"Using bundled web app from..."` or `"No bundled web app found, using localhost:3001"`

### Test bundled mode:
```bash
# Build the web app
./build-webapp.sh

# Verify files exist
ls -la mtmr-src/MTMR/WebApp/

# Launch MTMR 2026 (should work without server)
open mtmr-src/build/Release/MTMR.app
```

### Test development mode:
```bash
# Remove bundled files
rm -rf mtmr-src/MTMR/WebApp/*

# Start dev server
pnpm run dev

# Launch MTMR 2026 (should connect to localhost:3001)
open mtmr-src/build/Release/MTMR.app
```

## Troubleshooting

### White page on launch
1. Check Console.app for errors
2. Verify bundled files exist: `ls mtmr-src/MTMR/WebApp/index.html`
3. If no bundle, start dev server: `pnpm run dev`
4. Rebuild: `./build-webapp.sh`

### API calls failing
1. Check Console.app for `AppSchemeHandler` errors
2. Verify MTMR config path exists: `~/Library/Application Support/MTMR/`
3. Check file permissions

### Build errors
1. Install dependencies: `pnpm install && cd server && npm install`
2. Check Node.js version: `node --version` (requires >=18)
3. Try manual build: `pnpm run build`

## Files Modified/Created

- `mtmr-src/MTMR/DesignerWindowController.swift` - Auto-detects bundled vs dev mode
- `mtmr-src/MTMR/AppSchemeHandler.swift` - Native API handler
- `mtmr-src/MTMR/AppDelegate.swift` - Auto-opens Designer on launch
- `build-webapp.sh` - Simple build script
- `mtmr-src/build-and-copy-webapp.sh` - Robust build script with dependency checks
- `MTMR_DESIGNER_FIX.md` - This documentation
