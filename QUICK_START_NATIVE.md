# Quick Start: MTMR Designer Native App

## First Time Setup

1. **Build the web app** (one-time, or when you update the code):
   ```bash
   cd /path/to/mtmr-designer
   ./build-webapp.sh
   ```

2. **Build MTMR 2026 in Xcode**:
   - Open `mtmr-src/MTMR.xcodeproj`
   - Select the MTMR scheme
   - Build (⌘B) or Run (⌘R)

3. **Launch the app**:
   - The Designer window opens automatically
   - No need to start a server!

## Daily Usage

Just launch MTMR 2026 from:
- Applications folder
- Xcode (⌘R)
- Spotlight (⌘Space, type "MTMR")

The Designer opens automatically with no setup required.

## Development Workflow

### Option A: Bundled Mode (Recommended)
Best for testing the native app experience:

```bash
# Rebuild web app when you make changes
./build-webapp.sh

# Rebuild and run in Xcode
# The app uses the bundled files
```

### Option B: Live Development Mode
Best for rapid frontend development:

```bash
# Terminal 1: Start dev server with hot reload
pnpm run dev

# Terminal 2: Remove bundled files to force dev mode
rm -rf mtmr-src/MTMR/WebApp/*

# Launch MTMR 2026 from Xcode
# The app connects to localhost:3001 with hot reload
```

## Troubleshooting

### White page on launch?

**Check 1**: Are bundled files present?
```bash
ls mtmr-src/MTMR/WebApp/index.html
```

If not found:
```bash
./build-webapp.sh
```

**Check 2**: Is the dev server running?
```bash
# Start it
pnpm run dev
```

**Check 3**: Check Console.app
- Open Console.app
- Filter for "MTMR 2026"
- Look for error messages

### Can't build web app?

```bash
# Install dependencies
pnpm install
cd server && npm install && cd ..

# Try again
./build-webapp.sh
```

### Xcode build fails?

1. Clean build folder: Product → Clean Build Folder (⇧⌘K)
2. Ensure web app is built: `./build-webapp.sh`
3. Check Xcode console for specific errors

## How It Works

The app automatically detects which mode to use:

1. **Checks for bundled files** at `mtmr-src/MTMR/WebApp/index.html`
2. **If found**: Uses bundled mode with `mtmr-app://` custom scheme
3. **If not found**: Falls back to `http://localhost:3001`

You'll see a log message in Console.app indicating which mode is active.

## Tips

- **First build**: Always run `./build-webapp.sh` before building in Xcode
- **Updating code**: Rebuild web app, then rebuild in Xcode
- **Fast iteration**: Use dev mode (Option B above) for frontend changes
- **Testing releases**: Use bundled mode (Option A above) to test the final experience
