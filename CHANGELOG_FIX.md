# Fix: MTMR Designer Auto-Launch White Page Issue

## Date
March 12, 2026

## Issue
When launching MTMR Designer / MTMR 2026 as a native macOS app, users were greeted with a white page instead of the designer interface.

## Root Cause
The app was trying to load the web interface but:
1. No Express server was running at `localhost:3001`
2. The bundled web files existed but weren't being used properly
3. Users didn't know they needed to build the web app first

## Solution Implemented

### 1. Automatic Mode Detection
The app now intelligently detects which mode to use:
- **Bundled mode**: If `mtmr-src/MTMR/WebApp/index.html` exists, use it
- **Development mode**: Otherwise, fall back to `localhost:3001`

### 2. Native API Handler
`AppSchemeHandler.swift` now handles all API calls natively in bundled mode:
- `/api/load-mtmr` - Read MTMR config
- `/api/save-mtmr` - Write MTMR config  
- `/api/config-path` - Get config path
- `/api/health` - Health check
- `/api/check-mtmr-running` - Check MTMR status
- `/api/launch-mtmr` - Launch MTMR (no-op in bundled mode)

### 3. Build Scripts
Created two build scripts:
- `build-webapp.sh` - Simple build and copy
- `mtmr-src/build-and-copy-webapp.sh` - Robust version with dependency checks

### 4. Documentation
Added comprehensive documentation:
- `MTMR_DESIGNER_FIX.md` - Technical details and architecture
- `QUICK_START_NATIVE.md` - User-friendly quick start guide
- Updated `README.md` with native app instructions
- Updated `CLAUDE.md` with build process details

## Files Modified

### Swift Files (Already Existed, Working Correctly)
- `mtmr-src/MTMR/DesignerWindowController.swift` - Auto-detects bundled vs dev mode
- `mtmr-src/MTMR/AppSchemeHandler.swift` - Native API handler for bundled mode
- `mtmr-src/MTMR/AppDelegate.swift` - Auto-opens Designer on launch

### Build Scripts (Created)
- `build-webapp.sh` - Made executable
- `mtmr-src/build-and-copy-webapp.sh` - New robust build script

### Documentation (Created/Updated)
- `MTMR_DESIGNER_FIX.md` - Technical documentation
- `QUICK_START_NATIVE.md` - User guide
- `CHANGELOG_FIX.md` - This file
- `README.md` - Updated Quick Start section
- `CLAUDE.md` - Updated MTMR 2026 section

## Testing

### Verified
✅ Web app builds successfully with `./build-webapp.sh`
✅ Built files copied to `mtmr-src/MTMR/WebApp/`
✅ Files include:
  - `index.html` (with correct asset references)
  - `assets/index-*.js` (bundled JavaScript)
  - `assets/index-*.css` (bundled CSS)
  - `presets/` folder (community presets)

### Next Steps for User
1. Build the web app: `./build-webapp.sh`
2. Open Xcode: `open mtmr-src/MTMR.xcodeproj`
3. Build and run (⌘R)
4. Designer window should open automatically with full functionality

## Expected Behavior

### On Launch
1. MTMR 2026 starts
2. Status bar icon appears (circle with "MD")
3. Designer window opens automatically
4. Web interface loads from bundled files
5. All features work without Express server

### Console Output
```
MTMR 2026: App Starting Up...
MTMR 2026: Creating Status Bar Item...
MTMR 2026: Using bundled web app from /path/to/WebApp
MTMR 2026: Opening Designer window...
```

## Fallback Behavior

If bundled files don't exist:
```
MTMR 2026: No bundled web app found, using localhost:3001
```

In this case, user needs to:
1. Start dev server: `pnpm run dev`
2. App will connect to `localhost:3001`

## Benefits

1. **No server required** - App works standalone in bundled mode
2. **Automatic detection** - Seamlessly switches between modes
3. **Better UX** - Designer opens immediately on launch
4. **Development friendly** - Can still use hot reload with dev server
5. **Clear documentation** - Users know exactly what to do

## Technical Details

### Custom URL Scheme
- Scheme: `mtmr-app://`
- Base URL: `mtmr-app://app/`
- Example: `mtmr-app://app/index.html`

### API Endpoints
All API calls use relative URLs (`/api/*`) which work in both modes:
- Bundled: `mtmr-app://app/api/load-mtmr`
- Dev: `http://localhost:3001/api/load-mtmr`

### File Serving
`AppSchemeHandler` serves files with proper MIME types:
- HTML, CSS, JS, JSON
- Images (PNG, JPG, SVG, ICO)
- Fonts (WOFF, WOFF2, TTF)
- Source maps

### SPA Routing
For non-file paths, serves `index.html` to support client-side routing.

## Known Limitations

1. **Build required** - Users must run `./build-webapp.sh` before first Xcode build
2. **No hot reload in bundled mode** - Must rebuild web app to see changes
3. **Vite warnings** - Large bundle size (957KB) could be optimized with code splitting

## Future Improvements

1. **Xcode Build Phase** - Add automatic web app build to Xcode project
2. **Bundle optimization** - Implement code splitting to reduce bundle size
3. **Auto-update detection** - Detect when web app needs rebuilding
4. **Better error messages** - Show user-friendly errors if files missing
