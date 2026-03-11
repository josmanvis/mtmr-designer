const { app, BrowserWindow, ipcMain, TouchBar, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// TouchBar components
const {
  TouchBarButton,
  TouchBarLabel,
  TouchBarSlider,
  TouchBarScrubber,
  TouchBarGroup,
  TouchBarPopover,
  TouchBarSpacer,
  TouchBarSegmentedControl
} = TouchBar;

let mainWindow;
let touchBarItems = [];

// Load native addon for system-wide Touch Bar
let systemTouchBar = null;
try {
  systemTouchBar = require('./native');
} catch (e) {
  console.log('Native TouchBar addon not available, using Electron TouchBar only');
  console.log('Build the native addon with: npm run build:native');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 }
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Convert MTMR preset item to Electron TouchBar item
function createTouchBarItem(item) {
  switch (item.type) {
    case 'staticButton':
    case 'button':
      return new TouchBarButton({
        label: item.title || '',
        backgroundColor: item.backgroundColor || '#333333',
        click: () => {
          if (item.action) {
            mainWindow.webContents.send('touchbar-action', item.action);
          }
        }
      });

    case 'timeButton':
      return new TouchBarLabel({
        label: new Date().toLocaleTimeString(),
        textColor: item.textColor || '#ffffff'
      });

    case 'brightnessSlider':
    case 'volumeSlider':
      return new TouchBarSlider({
        label: item.type === 'brightnessSlider' ? '☀️' : '🔊',
        value: 50,
        minValue: 0,
        maxValue: 100,
        change: (value) => {
          mainWindow.webContents.send('touchbar-slider', { type: item.type, value });
        }
      });

    case 'groupBarItems':
      if (item.items && Array.isArray(item.items)) {
        return new TouchBarGroup({
          items: new TouchBar({ items: item.items.map(createTouchBarItem).filter(Boolean) })
        });
      }
      return null;

    case 'spacer':
    case 'flexibleSpace':
      return new TouchBarSpacer({ size: 'flexible' });

    case 'label':
      return new TouchBarLabel({
        label: item.title || '',
        textColor: item.textColor || '#ffffff'
      });

    default:
      console.log(`Unknown TouchBar item type: ${item.type}`);
      return null;
  }
}

// Update TouchBar from preset
function updateTouchBar(preset) {
  if (!preset || !Array.isArray(preset)) return;

  touchBarItems = preset.map(createTouchBarItem).filter(Boolean);
  
  const touchBar = new TouchBar({
    items: touchBarItems
  });

  // Set app-specific TouchBar (Electron)
  if (mainWindow) {
    mainWindow.setTouchBar(touchBar);
  }

  // Set system-wide TouchBar (native addon)
  if (systemTouchBar) {
    systemTouchBar.setTouchBarItems(preset);
  }
}

// IPC handlers
ipcMain.on('update-touchbar', (event, preset) => {
  updateTouchBar(preset);
});

ipcMain.on('load-preset', (event, presetPath) => {
  try {
    const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
    updateTouchBar(preset);
    event.reply('preset-loaded', preset);
  } catch (error) {
    event.reply('preset-error', error.message);
  }
});

ipcMain.on('save-preset', (event, { path: presetPath, preset }) => {
  try {
    fs.writeFileSync(presetPath, JSON.stringify(preset, null, 2));
    event.reply('preset-saved', true);
  } catch (error) {
    event.reply('preset-error', error.message);
  }
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  // Load default preset if exists
  const defaultPresetPath = path.join(app.getPath('userData'), 'items.json');
  if (fs.existsSync(defaultPresetPath)) {
    try {
      const preset = JSON.parse(fs.readFileSync(defaultPresetPath, 'utf8'));
      updateTouchBar(preset);
    } catch (e) {
      console.log('Could not load default preset:', e.message);
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up system TouchBar on quit
app.on('will-quit', () => {
  if (systemTouchBar) {
    systemTouchBar.clearTouchBar();
  }
});