import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getElementDefinition } from '../../data/elementDefinitions';
import './TouchBar.css';

// Icon mappings for different element types
const typeIcons = {
  escape: 'esc',
  exitTouchbar: '←',
  brightnessUp: '☀️',
  brightnessDown: '🔅',
  brightness: '☀️',
  illuminationUp: '💡',
  illuminationDown: '🔅',
  volumeUp: '🔊',
  volumeDown: '🔉',
  volume: '🔊',
  mute: '🔇',
  previous: '⏮',
  play: '▶️',
  next: '⏭',
  battery: '🔋',
  timeButton: '🕐',
  dateButton: '📅',
  weather: '🌤',
  yandexWeather: '🌡',
  cpu: '💻',
  currency: '💱',
  music: '🎵',
  dock: '📱',
  nightShift: '🌙',
  dnd: '🔕',
  darkMode: '🌓',
  pomodoro: '🍅',
  network: '📶',
  inputsource: '⌨',
  upnext: '📅',
  group: '📦',
  close: '✕',
  staticButton: null,
  appleScriptTitledButton: null,
  shellScriptTitledButton: null,
  swipe: '👆',
};

// Get display content for an item based on its type
function getItemDisplay(item, definition) {
  const type = item.type;

  // Handle items with custom images
  if (item.image?.base64) {
    return { type: 'image', content: `data:image/png;base64,${item.image.base64}` };
  }

  // Handle items with custom titles
  if (item.title && item.title.trim()) {
    return { type: 'text', content: item.title };
  }

  // Type-specific displays
  switch (type) {
    case 'escape':
      return { type: 'text', content: 'esc' };
    case 'exitTouchbar':
      return { type: 'icon', content: '←' };
    case 'brightnessUp':
      return { type: 'icon', content: '☀️' };
    case 'brightnessDown':
      return { type: 'icon', content: '🔅' };
    case 'brightness':
      return { type: 'slider', icon: '☀️' };
    case 'illuminationUp':
      return { type: 'icon', content: '💡' };
    case 'illuminationDown':
      return { type: 'icon', content: '🔅' };
    case 'volumeUp':
      return { type: 'icon', content: '🔊' };
    case 'volumeDown':
      return { type: 'icon', content: '🔉' };
    case 'volume':
      return { type: 'slider', icon: '🔊' };
    case 'mute':
      return { type: 'icon', content: '🔇' };
    case 'previous':
      return { type: 'icon', content: '⏮' };
    case 'play':
      return { type: 'icon', content: '▶️' };
    case 'next':
      return { type: 'icon', content: '⏭' };
    case 'battery':
      return { type: 'battery', icon: '🔋', percentage: '100%' };
    case 'timeButton':
      return { type: 'time', content: getCurrentTime(item.formatTemplate, item.timeZone, item.locale) };
    case 'weather':
    case 'yandexWeather':
      return { type: 'weather', icon: '🌤', temp: '72°' };
    case 'cpu':
      return { type: 'text', content: 'CPU 15%' };
    case 'currency':
      return { type: 'text', content: `${item.from || 'BTC'}→${item.to || 'USD'}` };
    case 'music':
      return { type: 'music', content: '♪ Now Playing' };
    case 'dock':
      return { type: 'icon', content: '📱' };
    case 'nightShift':
      return { type: 'icon', content: '🌙' };
    case 'dnd':
      return { type: 'icon', content: '🔕' };
    case 'darkMode':
      return { type: 'icon', content: '🌓' };
    case 'pomodoro':
      return { type: 'text', content: '🍅 25:00' };
    case 'network':
      return { type: 'text', content: '↑↓ 0 KB/s' };
    case 'inputsource':
      return { type: 'text', content: 'EN' };
    case 'upnext':
      return { type: 'text', content: '📅 Next Event' };
    case 'close':
      return { type: 'icon', content: '✕' };
    case 'group':
      return { type: 'group', content: item.title || 'Group', count: item.items?.length || 0 };
    case 'swipe':
      return { type: 'icon', content: '👆' };
    case 'staticButton':
    case 'appleScriptTitledButton':
    case 'shellScriptTitledButton':
      return { type: 'text', content: item.title || definition?.defaultTitle || 'Button' };
    default:
      return { type: 'text', content: definition?.defaultTitle || type };
  }
}

// Get current time formatted
function getCurrentTime(format, timeZone, locale) {
  if (!format) {
    format = 'HH:mm';
  }

  // Parse custom prefix from format (e.g., "'🌉' h:mm a" -> prefix='🌉', format='h:mm a')
  let prefix = '';
  let actualFormat = format;

  const quotedMatch = format.match(/^'([^']*)'[\s]+(.*)/);
  if (quotedMatch) {
    prefix = quotedMatch[1];
    actualFormat = quotedMatch[2];
  }

  // Get current time in the target timezone
  let now;
  if (timeZone && timeZone.trim()) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const obj = {};
    parts.forEach(p => {
      if (p.type !== 'literal') obj[p.type] = p.value;
    });

    now = new Date(`${obj.year}-${obj.month}-${obj.day}T${obj.hour}:${obj.minute}:${obj.second}`);
  } else {
    now = new Date();
  }

  // Time components
  const h24 = now.getHours();
  const h12 = h24 % 12 || 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  const H = h24.toString();
  const HH = h24.toString().padStart(2, '0');
  const h = h12.toString();
  const hh = h12.toString().padStart(2, '0');
  const a = h24 >= 12 ? 'pm' : 'am';
  const A = h24 >= 12 ? 'PM' : 'AM';
  const aa = h24 >= 12 ? 'pm' : 'am';

  // Date components
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  const dayOfWeek = now.getDay();

  const d = day.toString();
  const dd = day.toString().padStart(2, '0');
  const M = (month + 1).toString();
  const MM = (month + 1).toString().padStart(2, '0');
  const yy = year.toString().slice(-2);
  const yyyy = year.toString();

  // Month names
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MMM = monthNamesShort[month];
  const MMMM = monthNamesFull[month];

  // Day names
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const EEE = dayNamesShort[dayOfWeek];
  const EEEE = dayNamesFull[dayOfWeek];

  // Build time string from format
  // Order matters: longer patterns must be replaced first
  let timeStr = actualFormat
    // Date tokens (longer patterns first)
    .replace(/EEEE/g, EEEE)
    .replace(/EEE/g, EEE)
    .replace(/MMMM/g, MMMM)
    .replace(/MMM/g, MMM)
    .replace(/yyyy/g, yyyy)
    .replace(/yy/g, yy)
    .replace(/MM/g, MM)
    .replace(/M(?!M)/g, M)
    .replace(/dd/g, dd)
    .replace(/d(?!d)/g, d)
    // Time tokens
    .replace(/HH/g, HH)
    .replace(/H(?!H)/g, H)
    .replace(/hh/g, hh)
    .replace(/h(?!h)/g, h)
    .replace(/mm/g, mm)
    .replace(/ss/g, ss)
    .replace(/aa/g, aa)
    .replace(/a/g, a)
    .replace(/A/g, A);

  return prefix ? `${prefix} ${timeStr}` : timeStr;
}

export default function TouchBarItem({ item, isSelected, onSelect, onContextMenu }) {
  const definition = getElementDefinition(item.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!definition) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`touchbar-item unknown ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
        onContextMenu={onContextMenu}
      >
        <span className="touchbar-item-title">Unknown: {item.type}</span>
      </div>
    );
  }

  // Get display info
  const display = getItemDisplay(item, definition);

  // Determine if this is a slider type
  const isSlider = display.type === 'slider';

  // Determine if this is a group
  const isGroup = item.type === 'group';

  // Build class names
  const classNames = [
    'touchbar-item',
    `type-${item.type}`,
    isSelected ? 'selected' : '',
    isDragging ? 'dragging' : '',
    item.bordered === false ? 'no-border' : '',
    item.align ? `align-${item.align}` : '',
    isSlider ? 'slider' : '',
    isGroup ? 'group' : '',
  ].filter(Boolean).join(' ');

  // Inline styles for custom properties
  const itemStyle = {
    ...style,
    width: item.width ? `${item.width}px` : undefined,
    background: item.background || undefined,
  };

  // Render content based on display type
  const renderContent = () => {
    // Image display
    if (display.type === 'image') {
      return (
        <div className="touchbar-item-image">
          <img src={display.content} alt="" />
        </div>
      );
    }

    // Slider display
    if (display.type === 'slider') {
      return (
        <>
          <span className="slider-icon">{display.icon}</span>
          <div className="slider-indicator">
            <div className="slider-track"></div>
          </div>
        </>
      );
    }

    // Battery display
    if (display.type === 'battery') {
      return (
        <>
          <span className="battery-icon">{display.icon}</span>
          <span className="battery-percentage">{display.percentage}</span>
        </>
      );
    }

    // Time display
    if (display.type === 'time') {
      return <span className="time-display">{display.content}</span>;
    }

    // Weather display
    if (display.type === 'weather') {
      return (
        <>
          <span className="weather-icon">{display.icon}</span>
          <span className="weather-temp">{display.temp}</span>
        </>
      );
    }

    // Music display
    if (display.type === 'music') {
      return <span className="music-display">{display.content}</span>;
    }

    // Group display
    if (display.type === 'group') {
      return (
        <>
          <span className="touchbar-item-title">{display.content}</span>
          {display.count > 0 && (
            <span className="group-count">{display.count}</span>
          )}
        </>
      );
    }

    // Icon display
    if (display.type === 'icon') {
      return <span className="touchbar-icon">{display.content}</span>;
    }

    // Default text display
    return <span className="touchbar-item-title">{display.content}</span>;
  };

  return (
    <div
      ref={setNodeRef}
      style={itemStyle}
      className={classNames}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >
      {renderContent()}
      {isSelected && <div className="selection-indicator" />}
    </div>
  );
}
