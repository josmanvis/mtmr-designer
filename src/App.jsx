import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AppProvider, useApp } from './context/AppContext';
import TouchBar from './components/TouchBar/TouchBar';
import TouchBarItem from './components/TouchBar/TouchBarItem';
import Palette from './components/Palette/Palette';
import PropertiesPanel from './components/Properties/PropertiesPanel';
import JsonOutput from './components/JsonOutput/JsonOutput';
import { getElementDefinition, createElement } from './data/elementDefinitions';
import { getPreset, getPresetList, communityPresets, fetchCommunityPreset } from './data/presets';
import './App.css';

function AppContent() {
  const { 
    addItem, selectItem, items, reorderItems, selectedItemId, removeItem, loadItems, clearAll,
    activePreset, setActivePreset, clearActivePreset, myPresets, saveMyPreset, deleteMyPreset
  } = useApp();
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null); // 'palette' or 'touchbar'
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [showCommunitySubmenu, setShowCommunitySubmenu] = useState(false);
  const [showMyPresetsSubmenu, setShowMyPresetsSubmenu] = useState(false);
  const [loadingCommunityPreset, setLoadingCommunityPreset] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [errorToast, setErrorToast] = useState(null);
  const presetList = getPresetList();

  const handlePresetSelect = (presetKey, presetType = 'built-in') => {
    const preset = getPreset(presetKey);
    if (!preset) return;

    // Convert preset items to full items with IDs
    const newItems = preset.items
      .map((item) => createElement(item.type, item))
      .filter(Boolean);

    loadItems(newItems);
    setActivePreset({ key: presetKey, type: presetType, name: preset.name });
    setShowPresetDropdown(false);
  };

  const handleMyPresetSelect = (preset) => {
    // Convert preset items to full items with IDs
    const newItems = preset.items
      .map((item) => createElement(item.type, item))
      .filter(Boolean);
    loadItems(newItems);
    setActivePreset({ key: preset.key, type: 'my-preset', name: preset.name });
    setShowPresetDropdown(false);
    setShowMyPresetsSubmenu(false);
  };

  const handleCommunityPresetSelect = async (presetName) => {
    setLoadingCommunityPreset(presetName);
    try {
      const preset = await fetchCommunityPreset(presetName);
      if (preset && preset.items && preset.items.length > 0) {
        // Convert preset items to full items with IDs
        const newItems = preset.items
          .map((item) => createElement(item.type, item))
          .filter(Boolean);
        loadItems(newItems);
        setActivePreset({ key: presetName, type: 'community', name: presetName });
      } else {
        // Show error toast for empty/invalid preset
        setErrorToast(`Preset "${presetName}" not found or is empty`);
        setTimeout(() => setErrorToast(null), 3000);
      }
    } catch (error) {
      console.error('Failed to load community preset:', error);
      setErrorToast(`Failed to load preset "${presetName}"`);
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setLoadingCommunityPreset(null);
      setShowPresetDropdown(false);
      setShowCommunitySubmenu(false);
    }
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      saveMyPreset(presetName.trim());
      setPresetName('');
      setShowSaveModal(false);
    }
  };

  const handleDeleteMyPreset = (e, key) => {
    e.stopPropagation();
    deleteMyPreset(key);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    if (active.data.current?.type === 'palette-item') {
      setActiveType('palette');
    } else {
      setActiveType('touchbar');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Handle dropping from palette to touchbar
    if (active.data.current?.type === 'palette-item') {
      if (over) {
        // Add the item to the touchbar
        const elementType = active.data.current.elementType;
        const newItem = addItem(elementType);
        if (newItem) {
          selectItem(newItem.id);
        }
      }
    } 
    // Handle reordering within touchbar
    else if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderItems(arrayMove(items, oldIndex, newIndex));
      }
    }

    setActiveId(null);
    setActiveType(null);
  };

  // Get active item for drag overlay
  const activeItem = activeType === 'touchbar' ? items.find((item) => item.id === activeId) : null;
  const activeItemDef = activeItem ? getElementDefinition(activeItem.type) : null;
  
  // Get palette item for drag overlay
  const paletteItemDef = activeType === 'palette' && activeId ? 
    getElementDefinition(activeId.replace('palette-', '')) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <h1 className="app-title">
              <span className="title-icon">⌨️</span>
              MTMR Designer
            </h1>
            <div className="preset-buttons-container">
              <div className="preset-dropdown-container">
                <button 
                  className="preset-dropdown-trigger"
                  onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                >
                  <span>📋 Presets</span>
                  <span className="dropdown-arrow">{showPresetDropdown ? '▲' : '▼'}</span>
                </button>
                {showPresetDropdown && (
                  <>
                    <div 
                      className="preset-dropdown-backdrop"
                      onClick={() => {
                        setShowPresetDropdown(false);
                        setShowCommunitySubmenu(false);
                        setShowMyPresetsSubmenu(false);
                      }}
                    />
                    <div className="preset-dropdown-menu">
                      {/* My Presets submenu */}
                      {myPresets.length > 0 && (
                        <div 
                          className="preset-submenu-wrapper"
                          onMouseEnter={() => setShowMyPresetsSubmenu(true)}
                          onMouseLeave={() => setShowMyPresetsSubmenu(false)}
                        >
                          <div className="preset-dropdown-item preset-submenu-trigger">
                            <span className="preset-name">📁 My Presets</span>
                            <span className="preset-description">{myPresets.length} saved preset{myPresets.length !== 1 ? 's' : ''}</span>
                            <span className="submenu-arrow">▶</span>
                          </div>
                          {showMyPresetsSubmenu && (
                            <div className="preset-submenu">
                              {myPresets.map((preset) => (
                                <div
                                  key={preset.key}
                                  className={`preset-submenu-item ${activePreset?.key === preset.key ? 'active' : ''}`}
                                  onClick={() => handleMyPresetSelect(preset)}
                                >
                                  <span className="preset-submenu-item-name">
                                    {activePreset?.key === preset.key && <span className="preset-check">✓</span>}
                                    {preset.name}
                                  </span>
                                  <button
                                    className="preset-delete-btn"
                                    onClick={(e) => handleDeleteMyPreset(e, preset.key)}
                                    title="Delete preset"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Built-in presets */}
                      {presetList.map((preset) => (
                        <button
                          key={preset.key}
                          className={`preset-dropdown-item ${activePreset?.key === preset.key && activePreset?.type === 'built-in' ? 'active' : ''}`}
                          onClick={() => handlePresetSelect(preset.key)}
                        >
                          <span className="preset-name">
                            {activePreset?.key === preset.key && activePreset?.type === 'built-in' && <span className="preset-check">✓</span>}
                            {preset.name}
                          </span>
                          <span className="preset-description">{preset.description}</span>
                        </button>
                      ))}

                      {/* Community Presets submenu */}
                      <div 
                        className="preset-submenu-wrapper"
                        onMouseEnter={() => setShowCommunitySubmenu(true)}
                        onMouseLeave={() => setShowCommunitySubmenu(false)}
                      >
                        <div className="preset-dropdown-item preset-submenu-trigger">
                          <span className="preset-name">🌐 Community Presets</span>
                          <span className="preset-description">From MTMR-presets repository</span>
                          <span className="submenu-arrow">▶</span>
                        </div>
                        {showCommunitySubmenu && (
                          <div className="preset-submenu">
                            {communityPresets.map((presetName) => (
                              <button
                                key={presetName}
                                className={`preset-submenu-item ${activePreset?.key === presetName && activePreset?.type === 'community' ? 'active' : ''}`}
                                onClick={() => handleCommunityPresetSelect(presetName)}
                                disabled={loadingCommunityPreset === presetName}
                              >
                                {loadingCommunityPreset === presetName ? (
                                  <span className="preset-loading">⏳ Loading...</span>
                                ) : (
                                  <span>
                                    {activePreset?.key === presetName && activePreset?.type === 'community' && <span className="preset-check">✓</span>}
                                    {presetName}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button 
                className="save-preset-btn"
                onClick={() => setShowSaveModal(true)}
                disabled={items.length === 0}
                title="Save current configuration as preset"
              >
                💾 Save
              </button>
            </div>
          </div>
          <div className="header-right">
            <a
              href="https://github.com/Toxblh/MTMR"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link"
            >
              MTMR Docs
            </a>
          </div>
        </header>

        <main className="app-main">
          <aside className="sidebar-left">
            <Palette />
          </aside>

          <section className="content-center">
            <div className="touchbar-wrapper">
              <TouchBar />
            </div>
            <JsonOutput />
          </section>

          <aside className="sidebar-right">
            <PropertiesPanel />
          </aside>
        </main>

        <footer className="app-footer">
          <span>Drag elements to the touch bar • Click to select • Right-click for options</span>
        </footer>
      </div>

      <DragOverlay>
        {activeType === 'touchbar' && activeItem && activeItemDef && (
          <div className="touchbar-item-overlay">
            <span className="touchbar-item-title">
              {activeItem.title || activeItemDef.defaultTitle}
            </span>
          </div>
        )}
        {activeType === 'palette' && paletteItemDef && (
          <div className="touchbar-item-overlay">
            <span className="touchbar-item-title">
              {paletteItemDef.icon} {paletteItemDef.label}
            </span>
          </div>
        )}
      </DragOverlay>

      {/* Error Toast */}
      {errorToast && (
        <div className="error-toast">
          <span className="error-toast-icon">⚠️</span>
          <span className="error-toast-message">{errorToast}</span>
        </div>
      )}

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="modal-backdrop" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Save as Preset</h3>
            <input
              type="text"
              className="modal-input"
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-save" onClick={handleSavePreset} disabled={!presetName.trim()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}