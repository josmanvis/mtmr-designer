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
      return { type: 'time', content: getCurrentTime(item.formatTemplate) };
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
function getCurrentTime(format) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  if (format?.includes('HH:mm')) {
    return `${hours}:${minutes}`;
  }
  
  // Default 12-hour format
  const h12 = now.getHours() % 12 || 12;
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  return `${h12}:${minutes} ${ampm}`;
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