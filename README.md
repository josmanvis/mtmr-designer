# MTMR Designer

A visual designer for creating and editing MTMR (My TouchBar My rules) presets.

## About

MTMR Designer is a web-based visual editor for creating Touch Bar presets for MTMR. It provides an intuitive drag-and-drop interface for designing your perfect Touch Bar layout.

## Features

- 🎨 Visual Touch Bar editor
- 📦 Preset management
- 📤 Export/Import JSON configurations
- 🎯 Live preview

## Bundled MTMR 2026

This project includes a customized version of MTMR called **MTMR 2026** located in the `/mtmr-src` directory.

### Building MTMR 2026

1. Open `mtmr-src/MTMR.xcodeproj` in Xcode
2. Select the "MTMR" target
3. Build (⌘B) or Archive for distribution

### MTMR 2026 Features

- Rebranded version with updated bundle ID (`com.mtmr-designer.mtmr2026`)
- Fully compatible with MTMR Designer presets
- Based on the original [MTMR](https://github.com/Toxblh/MTMR) by Anton Palgunov

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
mtmr-designer/
├── src/                # React application source
├── public/             # Static assets and presets
├── server/             # Backend server (optional)
├── mtmr-src/           # Bundled MTMR 2026 source code
│   ├── MTMR/           # Main Swift source
│   ├── MTMR.xcodeproj/ # Xcode project
│   └── ...
└── ...
```

## Using MTMR Designer

1. Open MTMR Designer in your browser
2. Design your Touch Bar layout using the visual editor
3. Export the JSON configuration
4. Place the JSON at `~/Library/Application Support/MTMR/items.json`
5. Run MTMR 2026 to see your custom Touch Bar

## License

- MTMR Designer: MIT License
- MTMR 2026: MIT License (see `mtmr-src/LICENSE`)

## Credits

- [MTMR](https://github.com/Toxblh/MTMR) by [Anton Palgunov](https://github.com/Toxblh)
- MTMR Designer Contributors