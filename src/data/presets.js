// MTMR Preset Configurations
// Ready-to-use touch bar configurations

// Community presets stored locally in public/presets/
// These are the presets that have valid JSON files
export const communityPresets = [
  'BitYoungjae',
  'Frityet',
  'Gavinin',
  'RenaldiPranata',
  'adorow',
  'antoffeeWebDevPreset',
  'asimthecat',
  'bigBen',
  'donaldzou',
  'edoardoo',
  'egerix',
  'eighteeneightythree',
  'exdial',
  'klaus_preset',
  'lensonyuan',
  'metasean',
  'minimal',
  'mukmyash',
  'munchikin',
  'packy',
  'pinkelPreset',
  'prateek3255',
  'simplest',
  'sw0rl0k',
  'trumad',
  'utkini',
];

export const presets = {
  default: {
    name: 'Default',
    description: 'Basic setup with ESC, brightness, and volume controls',
    items: [
      { type: 'escape' },
      { type: 'brightnessDown' },
      { type: 'brightnessUp' },
      { type: 'mute' },
      { type: 'volumeDown' },
      { type: 'volumeUp' },
    ],
  },
  media: {
    name: 'Media Controls',
    description: 'Focused on music and video playback',
    items: [
      { type: 'escape' },
      { type: 'previous' },
      { type: 'play' },
      { type: 'next' },
      { type: 'mute' },
      { type: 'volumeDown' },
      { type: 'volumeUp' },
    ],
  },
  developer: {
    name: 'Developer',
    description: 'Time, battery, CPU, app launchers, and dark mode toggle',
    items: [
      { type: 'escape' },
      { type: 'timeButton', formatTemplate: 'HH:mm' },
      { type: 'battery' },
      { type: 'cpu' },
      {
        type: 'staticButton',
        title: '⌨',
        actions: [
          {
            trigger: 'tap',
            action: 'shellScript',
            executablePath: '/usr/bin/open',
            shellArguments: ['-a', 'Terminal'],
          },
        ],
      },
      {
        type: 'staticButton',
        title: '{}',
        actions: [
          {
            trigger: 'tap',
            action: 'shellScript',
            executablePath: '/usr/bin/open',
            shellArguments: ['-a', 'Visual Studio Code'],
          },
        ],
      },
      {
        type: 'staticButton',
        title: '🌐',
        actions: [
          {
            trigger: 'tap',
            action: 'shellScript',
            executablePath: '/usr/bin/open',
            shellArguments: ['-a', 'Safari'],
          },
        ],
      },
      { type: 'dock', autoResize: true },
      { type: 'darkMode' },
      { type: 'nightShift' },
    ],
  },
  minimal: {
    name: 'Minimal',
    description: 'Just the essentials',
    items: [
      { type: 'escape' },
      { type: 'brightness' },
      { type: 'volume' },
    ],
  },
  productivity: {
    name: 'Productivity',
    description: 'Time, weather, battery, and DND toggle',
    items: [
      { type: 'escape' },
      { type: 'timeButton', formatTemplate: 'EEE d MMM HH:mm' },
      { type: 'battery' },
      { type: 'dnd' },
      { type: 'brightnessDown' },
      { type: 'brightnessUp' },
      { type: 'volume' },
    ],
  },
  fullFeatured: {
    name: 'Full Featured',
    description: 'Showcase of all available elements',
    items: [
      { type: 'escape' },
      { type: 'timeButton', formatTemplate: 'HH:mm' },
      { type: 'battery' },
      { type: 'cpu' },
      { type: 'music' },
      { type: 'previous' },
      { type: 'play' },
      { type: 'next' },
      { type: 'brightness' },
      { type: 'volume' },
      { type: 'darkMode' },
    ],
  },
};

// Get preset by key
export const getPreset = (key) => {
  return presets[key] || null;
};

// Get all presets as array for dropdown
export const getPresetList = () => {
  return Object.entries(presets).map(([key, preset]) => ({
    key,
    name: preset.name,
    description: preset.description,
  }));
};

// Fetch a community preset from local files
export const fetchCommunityPreset = async (presetName) => {
  try {
    const response = await fetch(`/presets/${presetName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch preset: ${response.status}`);
    }
    const data = await response.json();
    return {
      name: presetName,
      items: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error(`Error fetching community preset "${presetName}":`, error);
    return null;
  }
};

// Get community preset URL (for viewing on GitHub)
export const getCommunityPresetUrl = (presetName) => {
  return `https://github.com/Toxblh/MTMR-presets/tree/master/${presetName}`;
};