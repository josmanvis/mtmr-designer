# MTMR Designer Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     MTMR Designer System                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   Web App (React)    │         │  Native App (Swift)  │
│                      │         │                      │
│  • Visual Editor     │         │  • Status Bar Icon   │
│  • Palette           │         │  • Menu              │
│  • Properties Panel  │         │  • Touch Bar Control │
│  • JSON Editor       │         │  • Designer Window   │
│  • Preset System     │         │                      │
└──────────────────────┘         └──────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Two Deployment Modes                    │
└─────────────────────────────────────────────────────────────┘
```

## Mode 1: Development (localhost:3001)

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Workflow                      │
└─────────────────────────────────────────────────────────────┘

Terminal 1:                    Terminal 2:
┌──────────────┐              ┌──────────────┐
│ pnpm run dev │              │ Xcode (⌘R)   │
└──────────────┘              └──────────────┘
       │                             │
       ▼                             ▼
┌──────────────┐              ┌──────────────┐
│ Express      │◄─────────────│ WKWebView    │
│ + Vite       │  HTTP        │              │
│              │  localhost   │ Loads:       │
│ Port 3001    │  :3001       │ localhost    │
└──────────────┘              │ :3001        │
       │                      └──────────────┘
       │
       ▼
┌──────────────┐
│ Hot Reload   │
│ Fast Refresh │
└──────────────┘
```

### Features
- ✅ Hot module replacement
- ✅ Fast refresh
- ✅ Source maps
- ✅ Dev tools
- ❌ Requires server running

## Mode 2: Production (Bundled)

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Workflow                       │
└─────────────────────────────────────────────────────────────┘

Build Time:                    Runtime:
┌──────────────┐              ┌──────────────────────┐
│ ./build-     │              │ MTMR 2026.app        │
│ webapp.sh    │              │                      │
└──────────────┘              │ ┌──────────────────┐ │
       │                      │ │ WKWebView        │ │
       ▼                      │ │                  │ │
┌──────────────┐              │ │ Loads:           │ │
│ vite build   │              │ │ mtmr-app://app/  │ │
└──────────────┘              │ └──────────────────┘ │
       │                      │          │           │
       ▼                      │          ▼           │
┌──────────────┐              │ ┌──────────────────┐ │
│ dist/        │──Copy───────▶│ │ AppSchemeHandler │ │
│ • index.html │              │ │                  │ │
│ • assets/    │              │ │ Serves:          │ │
│ • presets/   │              │ │ • Static files   │ │
└──────────────┘              │ │ • API endpoints  │ │
                              │ └──────────────────┘ │
                              │          │           │
                              │          ▼           │
                              │ ┌──────────────────┐ │
                              │ │ WebApp/          │ │
                              │ │ (Bundled)        │ │
                              │ └──────────────────┘ │
                              └──────────────────────┘
```

### Features
- ✅ No server required
- ✅ Standalone app
- ✅ Fast startup
- ✅ Native API handling
- ❌ No hot reload

## Auto-Detection Logic

```
┌─────────────────────────────────────────────────────────────┐
│              DesignerWindowController.swift                  │
└─────────────────────────────────────────────────────────────┘

func showWindow() {
    
    ┌─────────────────────────────────────┐
    │ Check: WebApp/index.html exists?    │
    └─────────────────────────────────────┘
              │
              ├─── YES ──────────────────────┐
              │                              │
              │                              ▼
              │                    ┌──────────────────┐
              │                    │ BUNDLED MODE     │
              │                    │                  │
              │                    │ Load:            │
              │                    │ mtmr-app://app/  │
              │                    │                  │
              │                    │ Handler:         │
              │                    │ AppSchemeHandler │
              │                    └──────────────────┘
              │
              └─── NO ───────────────────────┐
                                             │
                                             ▼
                                   ┌──────────────────┐
                                   │ DEV MODE         │
                                   │                  │
                                   │ Load:            │
                                   │ localhost:3001   │
                                   │                  │
                                   │ Requires:        │
                                   │ Express server   │
                                   └──────────────────┘
}
```

## API Flow (Bundled Mode)

```
┌─────────────────────────────────────────────────────────────┐
│                    API Request Flow                          │
└─────────────────────────────────────────────────────────────┘

React Component
      │
      │ fetch('/api/load-mtmr')
      ▼
┌──────────────────┐
│ WKWebView        │
│                  │
│ URL:             │
│ mtmr-app://app/  │
│ api/load-mtmr    │
└──────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│ AppSchemeHandler.swift                   │
│                                          │
│ func webView(start urlSchemeTask:)      │
│                                          │
│   if path.hasPrefix("/api/") {           │
│     handleAPIRequest()                   │
│   }                                      │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│ handleLoadMTMR()                         │
│                                          │
│ 1. Get config path                       │
│    ~/Library/Application Support/MTMR/   │
│    items.json                            │
│                                          │
│ 2. Read file                             │
│                                          │
│ 3. Parse JSON                            │
│                                          │
│ 4. Return response                       │
│    { success: true, data: [...] }       │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────┐
│ React Component  │
│                  │
│ Updates state    │
│ Renders UI       │
└──────────────────┘
```

## File Structure

```
mtmr-designer/
│
├── src/                          # React frontend
│   ├── components/
│   │   ├── TouchBar/             # Visual canvas
│   │   ├── Palette/              # Element catalog
│   │   ├── Properties/           # Property editors
│   │   └── JsonOutput/           # JSON preview
│   ├── context/
│   │   └── AppContext.jsx        # Global state
│   ├── data/
│   │   ├── elementDefinitions.js # 39 element types
│   │   └── presets.js            # Preset configs
│   └── utils/
│       ├── jsonGenerator.js      # JSON serialization
│       └── mtmrFileSystem.js     # API wrappers
│
├── server/
│   ├── server.js                 # Express + Vite
│   └── package.json              # Server dependencies
│
├── mtmr-src/
│   ├── MTMR/
│   │   ├── AppDelegate.swift     # App lifecycle
│   │   ├── DesignerWindowController.swift  # Window management
│   │   ├── AppSchemeHandler.swift          # Custom URL scheme
│   │   ├── TouchBarController.swift        # Touch Bar control
│   │   └── WebApp/               # Bundled web files
│   │       ├── index.html
│   │       ├── assets/
│   │       └── presets/
│   └── MTMR.xcodeproj/
│
├── build-webapp.sh               # Build script
└── dist/                         # Vite build output
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Flow                        │
└─────────────────────────────────────────────────────────────┘

User Action
    │
    ▼
┌──────────────────┐
│ React UI         │
│ (Visual Editor)  │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│ AppContext       │
│ (useReducer)     │
└──────────────────┘
    │
    ├─────────────────────┐
    │                     │
    ▼                     ▼
┌──────────────┐    ┌──────────────┐
│ localStorage │    │ JSON Output  │
│ (Auto-save)  │    │ (Preview)    │
└──────────────┘    └──────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │ Save to MTMR │
                    └──────────────┘
                          │
                          ▼
                    ┌──────────────────────────┐
                    │ /api/save-mtmr           │
                    │                          │
                    │ Writes to:               │
                    │ ~/Library/Application    │
                    │ Support/MTMR/items.json  │
                    └──────────────────────────┘
                          │
                          ▼
                    ┌──────────────────────────┐
                    │ MTMR App                 │
                    │ (File watcher)           │
                    │                          │
                    │ Detects change           │
                    │ Reloads Touch Bar        │
                    └──────────────────────────┘
```

## Build Process

```
┌─────────────────────────────────────────────────────────────┐
│                    Build Pipeline                            │
└─────────────────────────────────────────────────────────────┘

./build-webapp.sh
    │
    ▼
┌──────────────────┐
│ Check deps       │
│ node_modules/    │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│ vite build       │
│                  │
│ • Bundle React   │
│ • Minify JS/CSS  │
│ • Optimize       │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│ dist/            │
│ • index.html     │
│ • assets/*.js    │
│ • assets/*.css   │
│ • presets/*.json │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│ Copy to:         │
│ mtmr-src/MTMR/   │
│ WebApp/          │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│ Xcode Build      │
│                  │
│ • Compile Swift  │
│ • Bundle WebApp  │
│ • Sign app       │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│ MTMR 2026.app    │
│ (Ready to run)   │
└──────────────────┘
```

## Key Components

### Frontend (React)
- **AppContext**: Global state with useReducer
- **elementDefinitions**: 39 Touch Bar element types
- **jsonGenerator**: Converts UI state ↔ MTMR JSON
- **mtmrFileSystem**: API wrappers for file operations

### Backend (Express)
- **server.js**: Express + Vite integration
- **API routes**: File system operations
- **comment-json**: Parse MTMR configs with comments

### Native (Swift)
- **AppDelegate**: App lifecycle, status bar, menu
- **DesignerWindowController**: Window management, mode detection
- **AppSchemeHandler**: Custom URL scheme, native API
- **TouchBarController**: Touch Bar integration

## Security

### Bundled Mode
- ✅ No network access required
- ✅ Files served from app bundle
- ✅ API calls handled in-process
- ✅ Sandboxed file access

### Development Mode
- ⚠️ Requires localhost server
- ⚠️ CORS enabled
- ⚠️ Dev tools enabled
- ⚠️ Not for production
