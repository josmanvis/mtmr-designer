# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (two-step: root + server)
pnpm install && cd server && npm install && cd ..

# Start development server (runs Express + Vite via nodemon)
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start

# Lint
pnpm run lint
```

The dev server runs on **port 3001**. There is no test suite.

The root uses **pnpm**; the server uses **npm** (separate `package.json` and `node_modules` in `server/`). Run `npm install` inside `server/` when adding server-side dependencies.

### MTMR 2026 Swift App

Build via Xcode: open `mtmr-src/MTMR.xcodeproj`, select the `MTMR` scheme, and build. Release builds use `mtmr-src/build.sh` (requires `xcpretty` and `create-dmg`). Bundle ID: `com.mtmr.designer.MTMR`. Not part of the Node.js build pipeline.

**Important**: The app automatically opens the Designer window on launch. It works in two modes:
- **Bundled mode**: Serves files from `mtmr-src/MTMR/WebApp/` using a custom `mtmr-app://` URL scheme. No Express server needed.
- **Development mode**: Falls back to `http://localhost:3001` if no bundled files exist.

Before building in Xcode, run `./build-webapp.sh` to bundle the web app. The app uses `AppSchemeHandler.swift` to serve files and handle API calls natively in bundled mode.

## Architecture

This is a React + Express web app that serves as a visual designer for [MTMR](https://github.com/Toxblh/MTMR) Touch Bar presets.

### Server (`server/server.js`)

Express app integrated with Vite via `vite-express`. It serves the React SPA and exposes API routes that perform filesystem operations the browser cannot:

| Endpoint | Method | Description |
|---|---|---|
| `/api/load-mtmr` | GET | Read `~/Library/Application Support/MTMR/items.json` |
| `/api/save-mtmr` | POST | Write that file |
| `/api/check-mtmr-running` | GET | Check if MTMR process is running (`pgrep`) |
| `/api/launch-mtmr` | POST | Launch MTMR app (skips if already running) |
| `/api/config-path` | GET | Get config file path |
| `/api/health` | GET | Server health check |

**Critical**: API routes must be registered **before** `ViteExpress.listen()` or they will be shadowed by the SPA fallback. The server uses `comment-json` to parse MTMR configs that may contain comments.

### React Frontend (`src/`)

**State** is managed in `src/context/AppContext.jsx` via a single `useReducer` with 15+ action types. State persists to `localStorage` automatically (key: `mtmr-designer-items`). User presets are stored under `mtmr-my-presets`. Includes undo/redo history and an `isDirty` flag that tracks unsaved changes.

**Data layer** in `src/data/`:
- `elementDefinitions.js` — defines every supported MTMR element type (`elementTypes` map, 39 types across 6 categories), their `defaultProps`, editable `properties`, and factory function `createElement()`. This is the source of truth for what element types exist. Also exports `commonProperties`, `actionTypes`, and `actionTriggers`.
- `presets.js` — built-in preset configurations and community preset names (fetched from the MTMR-presets GitHub repo at runtime).

**Utils** in `src/utils/`:
- `jsonGenerator.js` — converts internal items array → MTMR-compatible JSON string (`generateJSON()`), and parses MTMR JSON back to internal format (`parseJSON()`). Type-specific properties handled in `addTypeSpecificProperties()`. Always includes the `align` property.
- `mtmrFileSystem.js` — thin fetch wrappers around the server API endpoints.

**Components** in `src/components/`:
- `TouchBar/` — the visual Touch Bar canvas using `@dnd-kit` for drag-and-drop and reordering.
- `Palette/` — the left sidebar listing all available element types by category.
- `Properties/` — the right sidebar showing editable properties for the selected item.
- `JsonOutput/` — the JSON preview/editor panel below the Touch Bar.

`App.jsx` owns the drag-and-drop orchestration (`DndContext` with `PointerSensor` + `KeyboardSensor`), preset selection logic, and the MTMR load/save button handlers.

### Touch Bar Layout System

Items are positioned in three sections: left, center, right — controlled by each item's `align` property. The Touch Bar preview uses three flex containers matching MTMR's native layout:
- Left section: `flex: 0 0 auto`
- Center section: `flex: 1` (fills available space, rendered as a scroll area)
- Right section: `flex: 0 0 auto`, pushed to the right edge

The `align` property is **critical** — without it, MTMR defaults items to center. `jsonGenerator.js` always includes it in output.

### Electron (`electron/`)

An optional Electron wrapper (not wired into `package.json` scripts) that embeds the React app and attempts to render items to the actual macOS Touch Bar. In development it loads from `http://localhost:5173` (Vite default port). It also has an optional native addon at `electron/native/`.

### MTMR 2026 (`mtmr-src/`)

A bundled fork of the MTMR Swift macOS app. Key files:
- `AppDelegate.swift` — status bar setup, file monitoring, accessibility check, Sparkle updates
- `TouchBarController.swift` — Touch Bar item creation, control strip registration, three-section layout
- `ItemsParsing.swift` — JSON → `BarItemDefinition` parsing

The app uses `LSUIElement = true` (menu-bar-only agent, no Dock icon). Touch Bar integration requires `setupControlStripPresence()` to register with the system via `NSTouchBarItem.addSystemTrayItem()`.

## Adding a New Element Type

1. Add an entry to `elementTypes` in `src/data/elementDefinitions.js` with `type`, `category`, `label`, `icon`, `defaultProps`, and optionally `properties` (list of configurable props).
2. `src/components/Palette/Palette.jsx` picks it up automatically via `getElementsByCategory()`.
3. If the type needs custom property editors, add handling in `src/components/Properties/PropertiesPanel.jsx`.
4. If the type needs special JSON serialization, update `src/utils/jsonGenerator.js` (specifically `addTypeSpecificProperties()`).
