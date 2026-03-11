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
    activePreset, setActivePreset, clearActivePreset, myPresets, saveMyPreset, overwriteMyPreset, deleteMyPreset,
    loadFromMTMR, saveToMTMR, isDirty
  } = useApp();
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showCommunitySubmenu, setShowCommunitySubmenu] = useState(false);
  const [showMyPresetsSubmenu, setShowMyPresetsSubmenu] = useState(false);
  const [loadingCommunityPreset, setLoadingCommunityPreset] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [errorToast, setErrorToast] = useState(null);
  const presetList = getPresetList();

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
    if (menu !== 'presets') {
      setShowCommunitySubmenu(false);
      setShowMyPresetsSubmenu(false);
    }
  };

  const handleMenuHover = (menu) => {
    if (openMenu !== null) {
      setOpenMenu(menu);
      if (menu !== 'presets') {
        setShowCommunitySubmenu(false);
        setShowMyPresetsSubmenu(false);
      }
    }
  };

  const closeMenus = () => {
    setOpenMenu(null);
    setShowCommunitySubmenu(false);
    setShowMyPresetsSubmenu(false);
  };

  const handlePresetSelect = (presetKey, presetType = 'built-in') => {
    const preset = getPreset(presetKey);
    if (!preset) return;
    const newItems = preset.items
      .map((item) => createElement(item.type, item))
      .filter(Boolean);
    loadItems(newItems);
    setActivePreset({ key: presetKey, type: presetType, name: preset.name });
    closeMenus();
  };

  const handleMyPresetSelect = (preset) => {
    const newItems = preset.items
      .map((item) => createElement(item.type, item))
      .filter(Boolean);
    loadItems(newItems);
    setActivePreset({ key: preset.key, type: 'my-preset', name: preset.name });
    closeMenus();
  };

  const handleCommunityPresetSelect = async (communityName) => {
    setLoadingCommunityPreset(communityName);
    try {
      const preset = await fetchCommunityPreset(communityName);
      if (preset && preset.items && preset.items.length > 0) {
        const newItems = preset.items
          .map((item) => createElement(item.type, item))
          .filter(Boolean);
        loadItems(newItems);
        setActivePreset({ key: communityName, type: 'community', name: communityName });
      } else {
        setErrorToast(`Preset "${communityName}" not found or is empty`);
        setTimeout(() => setErrorToast(null), 3000);
      }
    } catch (error) {
      console.error('Failed to load community preset:', error);
      setErrorToast(`Failed to load preset "${communityName}"`);
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setLoadingCommunityPreset(null);
      closeMenus();
    }
  };

  const handleSave = () => {
    closeMenus();
    if (activePreset?.type === 'my-preset') {
      overwriteMyPreset(activePreset.key);
    } else {
      setShowSaveModal(true);
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

  const handleLoadFromMTMR = async () => {
    closeMenus();
    try {
      const result = await loadFromMTMR();
      if (result.success) {
        setErrorToast('✅ Successfully loaded configuration from MTMR');
        setTimeout(() => setErrorToast(null), 3000);
      } else {
        setErrorToast(`❌ Failed to load from MTMR: ${result.error}`);
        setTimeout(() => setErrorToast(null), 5000);
      }
    } catch (error) {
      setErrorToast(`❌ Error loading from MTMR: ${error.message}`);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleUpdateMTMR = async () => {
    closeMenus();
    try {
      const result = await saveToMTMR();
      if (result.success) {
        setErrorToast('✅ Successfully updated MTMR configuration');
        setTimeout(() => setErrorToast(null), 3000);
      } else {
        setErrorToast(`❌ Failed to update MTMR: ${result.error}`);
        setTimeout(() => setErrorToast(null), 5000);
      }
    } catch (error) {
      setErrorToast(`❌ Error updating MTMR: ${error.message}`);
      setTimeout(() => setErrorToast(null), 5000);
    }
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
    if (active.data.current?.type === 'palette-item') {
      if (over) {
        const elementType = active.data.current.elementType;
        const newItem = addItem(elementType);
        if (newItem) {
          selectItem(newItem.id);
        }
      }
    } else if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderItems(arrayMove(items, oldIndex, newIndex));
      }
    }
    setActiveId(null);
    setActiveType(null);
  };

  const activeItem = activeType === 'touchbar' ? items.find((item) => item.id === activeId) : null;
  const activeItemDef = activeItem ? getElementDefinition(activeItem.type) : null;
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
        <header className="app-menubar">
          {openMenu && <div className="menu-backdrop" onClick={closeMenus} />}
          <div className="menubar-menus">
            {/* File Menu */}
            <div className="menu-wrapper">
              <button
                className={`menu-trigger ${openMenu === 'file' ? 'open' : ''}`}
                onClick={() => toggleMenu('file')}
                onMouseEnter={() => handleMenuHover('file')}
              >
                File
              </button>
              {openMenu === 'file' && (
                <div className="menu-dropdown">
                  <button className="menu-dropdown-item" onClick={() => { clearAll(); closeMenus(); }}>
                    New
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-dropdown-item" onClick={handleLoadFromMTMR}>
                    Load from MTMR
                  </button>
                  <button className="menu-dropdown-item" onClick={handleUpdateMTMR} disabled={!isDirty}>
                    Save to MTMR
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-dropdown-item" onClick={handleSave} disabled={!isDirty}>
                    Save
                  </button>
                  <button
                    className="menu-dropdown-item"
                    onClick={() => { setShowSaveModal(true); closeMenus(); }}
                  >
                    Save as Preset...
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="menu-wrapper">
              <button
                className={`menu-trigger ${openMenu === 'edit' ? 'open' : ''}`}
                onClick={() => toggleMenu('edit')}
                onMouseEnter={() => handleMenuHover('edit')}
              >
                Edit
              </button>
              {openMenu === 'edit' && (
                <div className="menu-dropdown">
                  <button
                    className="menu-dropdown-item"
                    onClick={() => { if (selectedItemId) removeItem(selectedItemId); closeMenus(); }}
                    disabled={!selectedItemId}
                  >
                    Delete
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-dropdown-item" onClick={() => { clearAll(); closeMenus(); }}>
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Presets Menu */}
            <div className="menu-wrapper">
              <button
                className={`menu-trigger ${openMenu === 'presets' ? 'open' : ''}`}
                onClick={() => toggleMenu('presets')}
                onMouseEnter={() => handleMenuHover('presets')}
              >
                Presets
              </button>
              {openMenu === 'presets' && (
                <div className="menu-dropdown">
                  {myPresets.length > 0 && (
                    <>
                      <div
                        className="menu-submenu-wrapper"
                        onMouseEnter={() => setShowMyPresetsSubmenu(true)}
                        onMouseLeave={() => setShowMyPresetsSubmenu(false)}
                      >
                        <button className="menu-dropdown-item menu-has-submenu">
                          My Presets
                          <span className="menu-submenu-arrow">&#9654;</span>
                        </button>
                        {showMyPresetsSubmenu && (
                          <div className="menu-submenu">
                            {myPresets.map((preset) => (
                              <div
                                key={preset.key}
                                className={`menu-dropdown-item menu-submenu-entry ${activePreset?.key === preset.key ? 'active' : ''}`}
                                onClick={() => handleMyPresetSelect(preset)}
                              >
                                <span className="menu-item-label">
                                  {activePreset?.key === preset.key && <span className="menu-check">&#10003;</span>}
                                  {preset.name}
                                </span>
                                <button
                                  className="menu-delete-btn"
                                  onClick={(e) => handleDeleteMyPreset(e, preset.key)}
                                  title="Delete preset"
                                >
                                  &#10005;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="menu-separator" />
                    </>
                  )}

                  {presetList.map((preset) => (
                    <button
                      key={preset.key}
                      className={`menu-dropdown-item ${activePreset?.key === preset.key && activePreset?.type === 'built-in' ? 'active' : ''}`}
                      onClick={() => handlePresetSelect(preset.key)}
                    >
                      {activePreset?.key === preset.key && activePreset?.type === 'built-in' && <span className="menu-check">&#10003;</span>}
                      {preset.name}
                    </button>
                  ))}

                  <div className="menu-separator" />

                  <div
                    className="menu-submenu-wrapper"
                    onMouseEnter={() => setShowCommunitySubmenu(true)}
                    onMouseLeave={() => setShowCommunitySubmenu(false)}
                  >
                    <button className="menu-dropdown-item menu-has-submenu">
                      Community Presets
                      <span className="menu-submenu-arrow">&#9654;</span>
                    </button>
                    {showCommunitySubmenu && (
                      <div className="menu-submenu">
                        {communityPresets.map((name) => (
                          <button
                            key={name}
                            className={`menu-dropdown-item ${activePreset?.key === name && activePreset?.type === 'community' ? 'active' : ''}`}
                            onClick={() => handleCommunityPresetSelect(name)}
                            disabled={loadingCommunityPreset === name}
                          >
                            {loadingCommunityPreset === name ? (
                              'Loading...'
                            ) : (
                              <>
                                {activePreset?.key === name && activePreset?.type === 'community' && <span className="menu-check">&#10003;</span>}
                                {name}
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <div className="menu-wrapper">
              <button
                className={`menu-trigger ${openMenu === 'help' ? 'open' : ''}`}
                onClick={() => toggleMenu('help')}
                onMouseEnter={() => handleMenuHover('help')}
              >
                Help
              </button>
              {openMenu === 'help' && (
                <div className="menu-dropdown">
                  <a
                    className="menu-dropdown-item"
                    href="https://github.com/Toxblh/MTMR"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenus}
                  >
                    MTMR Documentation
                  </a>
                </div>
              )}
            </div>
          </div>
          {activePreset && (
            <span className="menubar-status">{activePreset.name}</span>
          )}
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

          {selectedItemId && (
            <aside className="sidebar-right">
              <PropertiesPanel />
            </aside>
          )}
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

      {errorToast && (
        <div className="error-toast">
          <span className="error-toast-message">{errorToast}</span>
        </div>
      )}

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
