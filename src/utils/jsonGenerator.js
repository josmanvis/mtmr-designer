// JSON Generator for MTMR Configuration
// Converts internal state to MTMR-compatible JSON format

/**
 * Generate MTMR-compatible JSON from items array
 * @param {Array} items - Array of item objects from state
 * @returns {string} - Formatted JSON string
 */
export const generateJSON = (items) => {
  const output = items.map((item) => generateItemJSON(item)).filter(Boolean);
  return JSON.stringify(output, null, 2);
};

/**
 * Generate JSON for a single item
 * @param {Object} item - Item object
 * @returns {Object} - MTMR-compatible item object
 */
const generateItemJSON = (item) => {
  if (!item || !item.type) return null;

  const result = { type: item.type };

  // Add common properties if they have values
  if (item.width !== undefined && item.width !== null) {
    result.width = item.width;
  }

  // Always include align property - MTMR needs this for positioning
  // Default to 'center' if not specified
  result.align = item.align || 'center';

  if (item.bordered !== undefined && item.bordered !== true) {
    result.bordered = item.bordered;
  }

  if (item.background) {
    result.background = item.background;
  }

  if (item.title) {
    result.title = item.title;
  }

  if (item.image) {
    result.image = item.image;
  }

  if (item.matchAppId) {
    result.matchAppId = item.matchAppId;
  }

  // Add type-specific properties
  addTypeSpecificProperties(result, item);

  // Add actions if present
  if (item.actions && item.actions.length > 0) {
    result.actions = item.actions.map((action) => generateActionJSON(action));
  }

  // Handle group items recursively
  if (item.type === 'group' && item.items && item.items.length > 0) {
    result.items = item.items.map((subItem) => generateItemJSON(subItem)).filter(Boolean);
  }

  return result;
};

/**
 * Add type-specific properties to the result
 */
const addTypeSpecificProperties = (result, item) => {
  switch (item.type) {
    case 'timeButton':
      if (item.formatTemplate) result.formatTemplate = item.formatTemplate;
      if (item.locale) result.locale = item.locale;
      if (item.timeZone) result.timeZone = item.timeZone;
      break;

    case 'currency':
      if (item.refreshInterval) result.refreshInterval = item.refreshInterval;
      if (item.from) result.from = item.from;
      if (item.to) result.to = item.to;
      if (item.full !== undefined) result.full = item.full;
      break;

    case 'weather':
      if (item.refreshInterval) result.refreshInterval = item.refreshInterval;
      if (item.units) result.units = item.units;
      if (item.icon_type) result.icon_type = item.icon_type;
      if (item.api_key) result.api_key = item.api_key;
      break;

    case 'yandexWeather':
      if (item.refreshInterval) result.refreshInterval = item.refreshInterval;
      break;

    case 'music':
      if (item.refreshInterval !== undefined) result.refreshInterval = item.refreshInterval;
      if (item.disableMarquee) result.disableMarquee = item.disableMarquee;
      break;

    case 'dock':
      if (item.filter) result.filter = item.filter;
      if (item.autoResize !== undefined) result.autoResize = item.autoResize;
      break;

    case 'pomodoro':
      if (item.workTime) result.workTime = item.workTime;
      if (item.restTime) result.restTime = item.restTime;
      break;

    case 'network':
      if (item.flip !== undefined) result.flip = item.flip;
      if (item.units) result.units = item.units;
      break;

    case 'upnext':
      if (item.from !== undefined) result.from = item.from;
      if (item.to !== undefined) result.to = item.to;
      if (item.maxToShow !== undefined) result.maxToShow = item.maxToShow;
      if (item.autoResize !== undefined) result.autoResize = item.autoResize;
      break;

    case 'staticButton':
      // title is already handled in common properties
      break;

    case 'appleScriptTitledButton':
      if (item.source) result.source = item.source;
      if (item.refreshInterval) result.refreshInterval = item.refreshInterval;
      if (item.alternativeImages && Object.keys(item.alternativeImages).length > 0) {
        result.alternativeImages = item.alternativeImages;
      }
      break;

    case 'shellScriptTitledButton':
      if (item.source) result.source = item.source;
      if (item.refreshInterval) result.refreshInterval = item.refreshInterval;
      break;

    case 'swipe':
      if (item.fingers) result.fingers = item.fingers;
      if (item.direction) result.direction = item.direction;
      if (item.minOffset) result.minOffset = item.minOffset;
      if (item.sourceApple) result.sourceApple = item.sourceApple;
      if (item.sourceBash) result.sourceBash = item.sourceBash;
      break;

    default:
      break;
  }
};

/**
 * Generate JSON for an action
 */
const generateActionJSON = (action) => {
  const result = {
    trigger: action.trigger,
    action: action.action,
  };

  switch (action.action) {
    case 'hidKey':
    case 'keyPress':
      if (action.keycode !== undefined) result.keycode = action.keycode;
      break;

    case 'appleScript':
      if (action.actionAppleScript) result.actionAppleScript = action.actionAppleScript;
      break;

    case 'shellScript':
      if (action.executablePath) result.executablePath = action.executablePath;
      if (action.shellArguments) result.shellArguments = action.shellArguments;
      break;

    case 'openUrl':
      if (action.url) result.url = action.url;
      break;

    default:
      break;
  }

  return result;
};

/**
 * Strip JavaScript-style comments from JSON string
 * Handles both single-line (//) and multi-line (/* *\/) comments
 * Preserves comments inside strings
 * @param {string} str - Input string with potential comments
 * @returns {string} - String with comments removed
 */
const stripComments = (str) => {
  let result = '';
  let i = 0;
  let inString = false;
  let stringChar = null;

  while (i < str.length) {
    const char = str[i];
    const nextChar = str[i + 1];

    // Handle string boundaries
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      result += char;
      i++;
      continue;
    }

    // Handle end of string
    if (inString && char === stringChar) {
      // Check for escaped quote
      let escaped = false;
      let j = i - 1;
      while (j >= 0 && str[j] === '\\') {
        escaped = !escaped;
        j--;
      }
      if (!escaped) {
        inString = false;
        stringChar = null;
      }
      result += char;
      i++;
      continue;
    }

    // If inside string, just add the character
    if (inString) {
      result += char;
      i++;
      continue;
    }

    // Handle single-line comment
    if (char === '/' && nextChar === '/') {
      // Skip until end of line
      i += 2;
      while (i < str.length && str[i] !== '\n') {
        i++;
      }
      continue;
    }

    // Handle multi-line comment
    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < str.length - 1) {
        if (str[i] === '*' && str[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
      if (i >= str.length - 1) i = str.length;
      continue;
    }

    result += char;
    i++;
  }

  return result;
};

/**
 * Remove trailing commas from JSON string (another common non-standard feature)
 * @param {string} str - Input JSON string
 * @returns {string} - String with trailing commas removed
 */
const removeTrailingCommas = (str) => {
  // Remove trailing commas before ] or }
  return str.replace(/,\s*([\]}])/g, '$1');
};

/**
 * Parse MTMR JSON string to internal state format
 * Handles JavaScript-style comments and trailing commas
 * @param {string} jsonString - MTMR JSON configuration
 * @returns {Object} - { items: [], error: null } or { items: [], error: 'message' }
 */
export const parseJSON = (jsonString) => {
  try {
    // Strip comments and trailing commas before parsing
    const cleanedJson = removeTrailingCommas(stripComments(jsonString));
    const parsed = JSON.parse(cleanedJson);

    if (!Array.isArray(parsed)) {
      return { items: [], error: 'Invalid format: expected an array of items' };
    }

    const items = parsed.map((item, index) => parseItem(item, index)).filter(Boolean);
    return { items, error: null };
  } catch (e) {
    return { items: [], error: `JSON parse error: ${e.message}` };
  }
};

/**
 * Parse a single item from JSON
 */
const parseItem = (item, index) => {
  if (!item || !item.type) {
    console.warn(`Item at index ${index} missing type property`);
    return null;
  }

  const result = {
    id: `item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    type: item.type,
  };

  // Copy common properties
  if (item.width !== undefined) result.width = item.width;
  if (item.align) result.align = item.align;
  if (item.bordered !== undefined) result.bordered = item.bordered;
  if (item.background) result.background = item.background;
  if (item.title) result.title = item.title;
  if (item.image) result.image = item.image;
  if (item.matchAppId) result.matchAppId = item.matchAppId;

  // Copy type-specific properties
  const typeSpecificProps = [
    'formatTemplate', 'locale', 'timeZone',
    'refreshInterval', 'from', 'to', 'full',
    'units', 'icon_type', 'api_key',
    'disableMarquee', 'filter', 'autoResize',
    'workTime', 'restTime', 'flip',
    'source', 'alternativeImages',
    'fingers', 'direction', 'minOffset', 'sourceApple', 'sourceBash',
  ];

  typeSpecificProps.forEach((prop) => {
    if (item[prop] !== undefined) {
      result[prop] = item[prop];
    }
  });

  // Handle upnext specific properties
  if (item.type === 'upnext') {
    if (item.from !== undefined) result.from = item.from;
    if (item.to !== undefined) result.to = item.to;
    if (item.maxToShow !== undefined) result.maxToShow = item.maxToShow;
  }

  // Parse actions
  if (item.actions && Array.isArray(item.actions)) {
    result.actions = item.actions.map((action, actionIndex) => ({
      id: `action-${Date.now()}-${actionIndex}`,
      ...action,
    }));
  }

  // Parse group items recursively
  if (item.type === 'group' && item.items && Array.isArray(item.items)) {
    result.items = item.items.map((subItem, subIndex) => parseItem(subItem, subIndex)).filter(Boolean);
  }

  return result;
};

/**
 * Validate MTMR JSON
 * Handles JavaScript-style comments and trailing commas
 * @param {string} jsonString - JSON string to validate
 * @returns {Object} - { valid: boolean, errors: [] }
 */
export const validateJSON = (jsonString) => {
  const errors = [];

  try {
    // Strip comments and trailing commas before validating
    const cleanedJson = removeTrailingCommas(stripComments(jsonString));
    const parsed = JSON.parse(cleanedJson);

    if (!Array.isArray(parsed)) {
      errors.push('Root element must be an array');
      return { valid: false, errors };
    }

    parsed.forEach((item, index) => {
      if (!item.type) {
        errors.push(`Item at index ${index} is missing required "type" property`);
      }
    });

    return { valid: errors.length === 0, errors };
  } catch (e) {
    errors.push(`JSON syntax error: ${e.message}`);
    return { valid: false, errors };
  }
};
