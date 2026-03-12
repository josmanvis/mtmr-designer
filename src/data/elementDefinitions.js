// Complete MTMR Element Definitions
// Based on https://github.com/Toxblh/MTMR

export const elementCategories = {
  buttons: {
    label: 'Buttons',
    description: 'Basic system buttons',
  },
  plugins: {
    label: 'Native Plugins',
    description: 'Built-in functionality plugins',
  },
  media: {
    label: 'Media Keys',
    description: 'Media playback controls',
  },
  custom: {
    label: 'Custom Elements',
    description: 'Scriptable and static buttons',
  },
  sliders: {
    label: 'Sliders',
    description: 'Interactive slider controls',
  },
  special: {
    label: 'Special',
    description: 'Groups, gestures, and special items',
  },
};

export const elementTypes = {
  // Basic Buttons
  escape: {
    type: 'escape',
    category: 'buttons',
    label: 'Escape',
    icon: 'esc',
    defaultTitle: 'esc',
    defaultProps: {
      width: 64,
      align: 'left',
    },
  },
  exitTouchbar: {
    type: 'exitTouchbar',
    category: 'buttons',
    label: 'Exit TouchBar',
    icon: '←',
    defaultTitle: '←',
    defaultProps: {
      align: 'left',
      bordered: false,
    },
  },
  brightnessUp: {
    type: 'brightnessUp',
    category: 'buttons',
    label: 'Brightness Up',
    icon: '☀️',
    defaultTitle: '',
    defaultProps: {
      width: 36,
    },
  },
  brightnessDown: {
    type: 'brightnessDown',
    category: 'buttons',
    label: 'Brightness Down',
    icon: '🔅',
    defaultTitle: '',
    defaultProps: {
      width: 36,
    },
  },
  illuminationUp: {
    type: 'illuminationUp',
    category: 'buttons',
    label: 'Keyboard Illumination Up',
    icon: '💡',
    defaultTitle: '',
    defaultProps: {
      width: 36,
    },
  },
  illuminationDown: {
    type: 'illuminationDown',
    category: 'buttons',
    label: 'Keyboard Illumination Down',
    icon: '🔅',
    defaultTitle: '',
    defaultProps: {
      width: 36,
    },
  },
  volumeUp: {
    type: 'volumeUp',
    category: 'buttons',
    label: 'Volume Up',
    icon: '🔊',
    defaultTitle: '',
    defaultProps: {
      width: 36,
    },
  },
  volumeDown: {
    type: 'volumeDown',
    category: 'buttons',
    label: 'Volume Down',
    icon: '🔉',
    defaultTitle: '',
    defaultProps: {
      width: 36,
    },
  },
  mute: {
    type: 'mute',
    category: 'buttons',
    label: 'Mute',
    icon: '🔇',
    defaultTitle: '',
    defaultProps: {
      width: 36,
    },
  },

  // Native Plugins
  timeButton: {
    key: 'timeButton',
    type: 'timeButton',
    category: 'plugins',
    label: 'Time Button',
    icon: '🕐',
    defaultTitle: '',
    defaultProps: {
      formatTemplate: 'HH:mm',
      locale: 'en_US',
      timeZone: '',
    },
    properties: ['formatTemplate', 'locale', 'timeZone'],
  },
  dateButton: {
    key: 'dateButton',
    type: 'timeButton',
    category: 'plugins',
    label: 'Date Button',
    icon: '📅',
    defaultTitle: '',
    defaultProps: {
      formatTemplate: 'MMM d',
      locale: 'en_US',
      timeZone: '',
    },
    properties: ['formatTemplate', 'locale', 'timeZone'],
  },
  battery: {
    type: 'battery',
    category: 'plugins',
    label: 'Battery',
    icon: '🔋',
    defaultTitle: '',
    defaultProps: {},
  },
  cpu: {
    type: 'cpu',
    category: 'plugins',
    label: 'CPU',
    icon: '💻',
    defaultTitle: '',
    defaultProps: {},
  },
  currency: {
    type: 'currency',
    category: 'plugins',
    label: 'Currency',
    icon: '💱',
    defaultTitle: '',
    defaultProps: {
      refreshInterval: 600,
      from: 'BTC',
      to: 'USD',
      full: false,
    },
    properties: ['refreshInterval', 'from', 'to', 'full'],
  },
  weather: {
    type: 'weather',
    category: 'plugins',
    label: 'Weather',
    icon: '🌤',
    defaultTitle: '',
    defaultProps: {
      refreshInterval: 600,
      units: 'imperial',
      icon_type: 'text',
      api_key: '',
    },
    properties: ['refreshInterval', 'units', 'icon_type', 'api_key'],
  },
  yandexWeather: {
    type: 'yandexWeather',
    category: 'plugins',
    label: 'Yandex Weather',
    icon: '🌡',
    defaultTitle: '',
    defaultProps: {
      refreshInterval: 600,
    },
    properties: ['refreshInterval'],
  },
  inputsource: {
    type: 'inputsource',
    category: 'plugins',
    label: 'Input Source',
    icon: '⌨',
    defaultTitle: '',
    defaultProps: {},
  },
  music: {
    type: 'music',
    category: 'plugins',
    label: 'Music',
    icon: '🎵',
    defaultTitle: '',
    defaultProps: {
      refreshInterval: 5,
      disableMarquee: false,
    },
    properties: ['refreshInterval', 'disableMarquee'],
  },
  dock: {
    type: 'dock',
    category: 'plugins',
    label: 'Dock',
    icon: '📱',
    defaultTitle: '',
    defaultProps: {
      filter: '',
      autoResize: false,
    },
    properties: ['filter', 'autoResize'],
  },
  nightShift: {
    type: 'nightShift',
    category: 'plugins',
    label: 'Night Shift',
    icon: '🌙',
    defaultTitle: '',
    defaultProps: {
      width: 38,
    },
  },
  dnd: {
    type: 'dnd',
    category: 'plugins',
    label: 'Do Not Disturb',
    icon: '🔕',
    defaultTitle: '',
    defaultProps: {
      width: 38,
    },
  },
  darkMode: {
    type: 'darkMode',
    category: 'plugins',
    label: 'Dark Mode',
    icon: '🌓',
    defaultTitle: '',
    defaultProps: {},
  },
  pomodoro: {
    type: 'pomodoro',
    category: 'plugins',
    label: 'Pomodoro',
    icon: '🍅',
    defaultTitle: '',
    defaultProps: {
      workTime: 1500,
      restTime: 300,
    },
    properties: ['workTime', 'restTime'],
  },
  network: {
    type: 'network',
    category: 'plugins',
    label: 'Network',
    icon: '📶',
    defaultTitle: '',
    defaultProps: {
      flip: false,
      units: 'dynamic',
    },
    properties: ['flip', 'units'],
  },
  upnext: {
    type: 'upnext',
    category: 'plugins',
    label: 'Up Next (Calendar)',
    icon: '📅',
    defaultTitle: '',
    defaultProps: {
      from: 0,
      to: 12,
      maxToShow: 3,
      autoResize: false,
    },
    properties: ['from', 'to', 'maxToShow', 'autoResize'],
  },

  // Media Keys
  previous: {
    type: 'previous',
    category: 'media',
    label: 'Previous Track',
    icon: '⏮',
    defaultTitle: '⏮',
    defaultProps: {},
  },
  play: {
    type: 'play',
    category: 'media',
    label: 'Play/Pause',
    icon: '▶️',
    defaultTitle: '▶',
    defaultProps: {},
  },
  next: {
    type: 'next',
    category: 'media',
    label: 'Next Track',
    icon: '⏭',
    defaultTitle: '⏭',
    defaultProps: {},
  },

  // Custom Elements
  staticButton: {
    type: 'staticButton',
    category: 'custom',
    label: 'Static Button',
    icon: '🔘',
    defaultTitle: 'Button',
    defaultProps: {
      title: 'Button',
    },
    properties: ['title'],
    supportsActions: true,
  },
  appleScriptTitledButton: {
    type: 'appleScriptTitledButton',
    category: 'custom',
    label: 'AppleScript Button',
    icon: '📜',
    defaultTitle: 'Script',
    defaultProps: {
      source: {
        inline: '',
      },
      refreshInterval: 60,
      alternativeImages: {},
    },
    properties: ['source', 'refreshInterval', 'alternativeImages'],
    supportsActions: true,
  },
  shellScriptTitledButton: {
    type: 'shellScriptTitledButton',
    category: 'custom',
    label: 'Shell Script Button',
    icon: '💻',
    defaultTitle: 'Shell',
    defaultProps: {
      source: {
        inline: '',
      },
      refreshInterval: 60,
    },
    properties: ['source', 'refreshInterval'],
    supportsActions: true,
  },

  // Sliders
  brightness: {
    type: 'brightness',
    category: 'sliders',
    label: 'Brightness Slider',
    icon: '☀️',
    defaultTitle: '☀',
    defaultProps: {},
  },
  volume: {
    type: 'volume',
    category: 'sliders',
    label: 'Volume Slider',
    icon: '🔊',
    defaultTitle: '🔊',
    defaultProps: {},
  },

  // Special Elements
  group: {
    type: 'group',
    category: 'special',
    label: 'Group',
    icon: '📦',
    defaultTitle: 'Group',
    defaultProps: {
      title: 'Group',
      items: [],
    },
    properties: ['title'],
    isContainer: true,
  },
  close: {
    type: 'close',
    category: 'special',
    label: 'Close Button',
    icon: '✕',
    defaultTitle: '✕',
    defaultProps: {},
  },
  swipe: {
    type: 'swipe',
    category: 'special',
    label: 'Swipe Gesture',
    icon: '👆',
    defaultTitle: 'Swipe',
    defaultProps: {
      fingers: 2,
      direction: 'right',
      minOffset: 10,
      sourceApple: null,
      sourceBash: null,
    },
    properties: ['fingers', 'direction', 'minOffset', 'sourceApple', 'sourceBash'],
  },
};

// Common properties that all elements can have
export const commonProperties = {
  width: {
    type: 'number',
    label: 'Width',
    description: 'Button width in pixels',
    min: 20,
    max: 500,
    default: null,
  },
  align: {
    type: 'select',
    label: 'Alignment',
    description: 'Horizontal alignment',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
    default: 'center',
  },
  bordered: {
    type: 'boolean',
    label: 'Bordered',
    description: 'Show border around button',
    default: true,
  },
  background: {
    type: 'color',
    label: 'Background Color',
    description: 'Button background color (hex)',
    default: null,
  },
  title: {
    type: 'string',
    label: 'Title',
    description: 'Button text',
    default: '',
  },
  image: {
    type: 'image',
    label: 'Image',
    description: 'Button icon (base64 or file path)',
    default: null,
  },
  matchAppId: {
    type: 'string',
    label: 'Match App ID',
    description: 'Show only when this app is active (regex)',
    default: null,
  },
};

// Action triggers
export const actionTriggers = [
  { value: 'singleTap', label: 'Single Tap' },
  { value: 'doubleTap', label: 'Double Tap' },
  { value: 'tripleTap', label: 'Triple Tap' },
  { value: 'longTap', label: 'Long Tap' },
];

// Action types
export const actionTypes = {
  hidKey: {
    type: 'hidKey',
    label: 'HID Key',
    properties: ['keycode'],
  },
  keyPress: {
    type: 'keyPress',
    label: 'Key Press',
    properties: ['keycode'],
  },
  appleScript: {
    type: 'appleScript',
    label: 'AppleScript',
    properties: ['actionAppleScript'],
  },
  shellScript: {
    type: 'shellScript',
    label: 'Shell Script',
    properties: ['executablePath', 'shellArguments'],
  },
  openUrl: {
    type: 'openUrl',
    label: 'Open URL',
    properties: ['url'],
  },
};

// Get elements by category
export const getElementsByCategory = (category) => {
  return Object.values(elementTypes).filter((el) => el.category === category);
};

// Get element definition by type
export const getElementDefinition = (type) => {
  return elementTypes[type] || null;
};

// Get element definition by key (for palette items with unique keys like dateButton)
export const getElementDefinitionByKey = (key) => {
  return Object.values(elementTypes).find((el) => el.key === key) || null;
};

// Create a new element with default properties
export const createElement = (typeOrKey, overrides = {}) => {
  // First try to find by key (for palette items like dateButton)
  let definition = getElementDefinitionByKey(typeOrKey);
  
  // If not found by key, try by type
  if (!definition) {
    definition = elementTypes[typeOrKey];
  }
  
  // For unknown types (e.g., from community presets), create a generic element
  // that preserves all original properties
  if (!definition) {
    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: typeOrKey,
      ...overrides,
    };
  }

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: definition.type,
    ...definition.defaultProps,
    ...overrides,
  };
};
