# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
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

## Architecture

This is a React + Express web app that serves as a visual designer for [MTMR](https://github.com/Toxblh/MTMR) Touch Bar presets.

### Server (`server/server.js`)
Express app integrated with Vite via `vite-express`. It serves the React SPA and exposes API routes that perform filesystem operations the browser cannot:
- `GET /api/load-mtmr` — reads `~/Library/Application Support/MTMR/items.json`
- `POST /api/save-mtmr` — writes that file
- `GET /api/config-path`, `GET /api/health`

**Critical**: API routes must be registered **before** `ViteExpress.listen()` or they will be shadowed by the SPA fallback. The server uses `comment-json` to parse MTMR configs that may contain comments.

The server has its own `package.json` and `node_modules` in `server/`. Run `npm install` inside `server/` if adding server-side dependencies.

### React Frontend (`src/`)

**State** is managed in `src/context/AppContext.jsx` via a single `useReducer`. State persists to `localStorage` automatically (key: `mtmr-designer-items`). User presets are stored under `mtmr-my-presets`.

**Data layer** in `src/data/`:
- `elementDefinitions.js` — defines every supported MTMR element type (`elementTypes` map), their `defaultProps`, editable `properties`, and factory function `createElement()`. This is the source of truth for what element types exist.
- `presets.js` — built-in preset configurations and community preset names (fetched from the MTMR-presets GitHub repo at runtime).

**Utils** in `src/utils/`:
- `jsonGenerator.js` — converts internal items array → MTMR-compatible JSON string, and parses MTMR JSON back to internal format.
- `mtmrFileSystem.js` — thin fetch wrappers around the server API endpoints.

**Components** in `src/components/`:
- `TouchBar/` — the visual Touch Bar canvas using `@dnd-kit` for drag-and-drop and reordering.
- `Palette/` — the left sidebar listing all available element types by category.
- `Properties/` — the right sidebar showing editable properties for the selected item.
- `JsonOutput/` — the JSON preview/editor panel below the Touch Bar.

`App.jsx` owns the drag-and-drop orchestration (`DndContext`), preset selection logic, and the MTMR load/save button handlers.

### Electron (`electron/`)
An optional Electron wrapper (not wired into `package.json` scripts) that embeds the React app and attempts to render items to the actual macOS Touch Bar. In development it loads from `http://localhost:5173` (Vite default port). It also has an optional native addon at `electron/native/`.

### MTMR 2026 (`mtmr-src/`)
A bundled fork of the MTMR Swift macOS app. Build it with Xcode (`MTMR.xcodeproj`). Bundle ID: `com.mtmr-designer.mtmr2026`. Not part of the Node.js build pipeline.

## Adding a New Element Type

1. Add an entry to `elementTypes` in `src/data/elementDefinitions.js` with `type`, `category`, `label`, `icon`, `defaultProps`, and optionally `properties` (list of configurable props).
2. `src/components/Palette/Palette.jsx` picks it up automatically via `getElementsByCategory()`.
3. If the type needs custom property editors, add handling in `src/components/Properties/PropertiesPanel.jsx`.
4. If the type needs special JSON serialization, update `src/utils/jsonGenerator.js`.
