const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer to to:
//   - load preset from file
//   - save preset to file
//   - get preset items
//   - update TouchBar
contextBridge.exposeInMainWorld('loadPreset', loadPreset);
contextBridge.exposeInMainWorld('savePreset', savePreset)
contextBridge.exposeInMainWorld('updateTouchbar', updateTouchBar)
contextBridge.exposeInMainWorld('getPresetPath', () => {
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
  updateTouchBar(preset)
  event.reply('preset-loaded', preset)
})