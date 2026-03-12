import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { createElement, getElementDefinition } from '../data/elementDefinitions';
import { generateJSON, parseJSON } from '../utils/jsonGenerator';
import { loadFromMTMR as loadFromMTMRFile, saveToMTMR as saveToMTMRFile, isServerRunning } from '../utils/mtmrFileSystem';

// Initial state
const initialState = {
  items: [],
  selectedItemId: null,
  activePreset: null, // Track which preset is currently loaded
  myPresets: [], // User's saved presets
  isDirty: false, // Track unsaved changes since last load/save
  mtmrItems: null, // Track what's currently in MTMR
  history: {
    past: [],
    future: [],
  },
  settings: {
    autoSave: true,
  },
};

// Action types
const ActionTypes = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REORDER_ITEMS: 'REORDER_ITEMS',
  SELECT_ITEM: 'SELECT_ITEM',
  DESELECT_ITEM: 'DESELECT_ITEM',
  LOAD_ITEMS: 'LOAD_ITEMS',
  UNDO: 'UNDO',
  REDO: 'REDO',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  ADD_ITEM_TO_GROUP: 'ADD_ITEM_TO_GROUP',
  REMOVE_ITEM_FROM_GROUP: 'REMOVE_ITEM_FROM_GROUP',
  REORDER_GROUP_ITEMS: 'REORDER_GROUP_ITEMS',
  UPDATE_GROUP_ITEM: 'UPDATE_GROUP_ITEM',
  SET_ACTIVE_PRESET: 'SET_ACTIVE_PRESET',
  CLEAR_ACTIVE_PRESET: 'CLEAR_ACTIVE_PRESET',
  SAVE_MY_PRESET: 'SAVE_MY_PRESET',
  DELETE_MY_PRESET: 'DELETE_MY_PRESET',
  LOAD_MY_PRESETS: 'LOAD_MY_PRESETS',
  LOAD_FROM_MTM: 'LOAD_FROM_MTM',
  SAVE_TO_MTM: 'SAVE_TO_MTM',
  MARK_CLEAN: 'MARK_CLEAN',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_ITEM: {
      const newItems = [...state.items, action.payload];
      return {
        ...state,
        items: newItems,
        selectedItemId: action.payload.id,
        isDirty: true,
        history: {
          past: [...state.history.past, state.items],
          future: [],
        },
      };
    }

    case ActionTypes.REMOVE_ITEM: {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        selectedItemId: state.selectedItemId === action.payload ? null : state.selectedItemId,
        isDirty: true,
        history: {
          past: [...state.history.past, state.items],
          future: [],
        },
      };
    }

    case ActionTypes.UPDATE_ITEM: {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
      );
      return {
        ...state,
        items: newItems,
        isDirty: true,
        history: {
          past: [...state.history.past, state.items],
          future: [],
        },
      };
    }

    case ActionTypes.REORDER_ITEMS: {
      return {
        ...state,
        items: action.payload,
        isDirty: true,
        history: {
          past: [...state.history.past, state.items],
          future: [],
        },
      };
    }

    case ActionTypes.SELECT_ITEM:
      return {
        ...state,
        selectedItemId: action.payload,
      };

    case ActionTypes.DESELECT_ITEM:
      return {
        ...state,
        selectedItemId: null,
      };

    case ActionTypes.LOAD_ITEMS:
      return {
        ...state,
        items: action.payload,
        selectedItemId: null,
        isDirty: false,
        history: {
          past: [],
          future: [],
        },
      };

    case ActionTypes.UNDO: {
      const { past, future } = state.history;
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        ...state,
        items: previous,
        history: {
          past: newPast,
          future: [...future, state.items],
        },
      };
    }

    case ActionTypes.REDO: {
      const { past, future } = state.history;
      if (future.length === 0) return state;
      const next = future[future.length - 1];
      const newFuture = future.slice(0, future.length - 1);
      return {
        ...state,
        items: next,
        history: {
          past: [...past, state.items],
          future: newFuture,
        },
      };
    }

    case ActionTypes.CLEAR_HISTORY:
      return {
        ...state,
        history: {
          past: [],
          future: [],
        },
      };

    case ActionTypes.ADD_ITEM_TO_GROUP: {
      const { groupId, item } = action.payload;
      const newItems = state.items.map((groupItem) => {
        if (groupItem.id === groupId && groupItem.type === 'group') {
          return {
            ...groupItem,
            items: [...(groupItem.items || []), item],
          };
        }
        return groupItem;
      });
      return {
        ...state,
        items: newItems,
        isDirty: true,
        history: {
          past: [...state.history.past, state.items],
          future: [],
        },
      };
    }

    case ActionTypes.REMOVE_ITEM_FROM_GROUP: {
      const { groupId, itemId } = action.payload;
      const newItems = state.items.map((groupItem) => {
        if (groupItem.id === groupId && groupItem.type === 'group') {
          return {
            ...groupItem,
            items: (groupItem.items || []).filter((item) => item.id !== itemId),
          };
        }
        return groupItem;
      });
      return {
        ...state,
        items: newItems,
        isDirty: true,
        history: {
          past: [...state.history.past, state.items],
          future: [],
        },
      };
    }

    case ActionTypes.REORDER_GROUP_ITEMS: {
      const { groupId, items: newGroupItems } = action.payload;
      const newItems = state.items.map((groupItem) => {
        if (groupItem.id === groupId && groupItem.type === 'group') {
          return {
            ...groupItem,
            items: newGroupItems,
          };
        }
        return groupItem;
      });
      return {
        ...state,
        items: newItems,
        isDirty: true,
        history: {
          past: [...state.history.past, state.items],
          future: [],
        },
      };
    }

    case ActionTypes.UPDATE_GROUP_ITEM: {
      const { groupId, itemId, updates } = action.payload;
      const newItems = state.items.map((groupItem) => {
        if (groupItem.id === groupId && groupItem.type === 'group') {
          return {
            ...groupItem,
            items: (groupItem.items || []).map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          };
        }
        return groupItem;
      });
      return {
        ...state,
        items: newItems,
        isDirty: true,
        history: {
          past: [...state.history.past, state.items],
          future: [],
        },
      };
    }

    case ActionTypes.SET_ACTIVE_PRESET:
      return {
        ...state,
        activePreset: action.payload,
      };

    case ActionTypes.CLEAR_ACTIVE_PRESET:
      return {
        ...state,
        activePreset: null,
      };

    case ActionTypes.SAVE_MY_PRESET: {
      const { key, name, items } = action.payload;
      const existingIndex = state.myPresets.findIndex((p) => p.key === key);
      let newMyPresets;
      if (existingIndex >= 0) {
        // Update existing preset
        newMyPresets = state.myPresets.map((p, i) =>
          i === existingIndex ? { key, name, items } : p
        );
      } else {
        // Add new preset
        newMyPresets = [...state.myPresets, { key, name, items }];
      }
      // Save to localStorage
      localStorage.setItem('mtmr-my-presets', JSON.stringify(newMyPresets));
      return {
        ...state,
        myPresets: newMyPresets,
        activePreset: { key, type: 'my-preset', name },
        isDirty: false,
      };
    }

    case ActionTypes.DELETE_MY_PRESET: {
      const newMyPresets = state.myPresets.filter((p) => p.key !== action.payload);
      localStorage.setItem('mtmr-my-presets', JSON.stringify(newMyPresets));
      return {
        ...state,
        myPresets: newMyPresets,
        activePreset: state.activePreset?.key === action.payload ? null : state.activePreset,
      };
    }

    case ActionTypes.LOAD_MY_PRESETS:
      return {
        ...state,
        myPresets: action.payload,
      };

    case ActionTypes.LOAD_FROM_MTM:
      return {
        ...state,
        items: action.payload,
        mtmrItems: JSON.parse(JSON.stringify(action.payload)), // Deep copy for comparison
        selectedItemId: null,
        activePreset: null,
        isDirty: false,
        history: {
          past: [],
          future: [],
        },
      };

    case ActionTypes.MARK_CLEAN:
      return {
        ...state,
        isDirty: false,
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    // Load saved items
    const saved = localStorage.getItem('mtmr-designer-items');
    if (saved) {
      try {
        const { items } = parseJSON(saved);
        if (items.length > 0) {
          dispatch({ type: ActionTypes.LOAD_ITEMS, payload: items });
        }
      } catch (e) {
        console.error('Failed to load saved items:', e);
      }
    }

    // Load my presets
    const savedPresets = localStorage.getItem('mtmr-my-presets');
    if (savedPresets) {
      try {
        const presets = JSON.parse(savedPresets);
        if (Array.isArray(presets) && presets.length > 0) {
          dispatch({ type: ActionTypes.LOAD_MY_PRESETS, payload: presets });
        }
      } catch (e) {
        console.error('Failed to load saved presets:', e);
      }
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (state.settings.autoSave && state.items.length > 0) {
      const json = generateJSON(state.items);
      localStorage.setItem('mtmr-designer-items', json);
    }
  }, [state.items, state.settings.autoSave]);

  // Actions
  const addItem = useCallback((type, overrides = {}) => {
    const item = createElement(type, overrides);
    if (item) {
      dispatch({ type: ActionTypes.ADD_ITEM, payload: item });
    }
    return item;
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: ActionTypes.REMOVE_ITEM, payload: id });
  }, []);

  const updateItem = useCallback((id, updates) => {
    dispatch({ type: ActionTypes.UPDATE_ITEM, payload: { id, updates } });
  }, []);

  const reorderItems = useCallback((items) => {
    dispatch({ type: ActionTypes.REORDER_ITEMS, payload: items });
  }, []);

  const selectItem = useCallback((id) => {
    dispatch({ type: ActionTypes.SELECT_ITEM, payload: id });
  }, []);

  const deselectItem = useCallback(() => {
    dispatch({ type: ActionTypes.DESELECT_ITEM });
  }, []);

  const loadItems = useCallback((items) => {
    dispatch({ type: ActionTypes.LOAD_ITEMS, payload: items });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: ActionTypes.UNDO });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: ActionTypes.REDO });
  }, []);

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  const getSelectedItem = useCallback(() => {
    if (!state.selectedItemId) return null;
    // Check main items
    let item = state.items.find((i) => i.id === state.selectedItemId);
    if (item) return item;
    // Check group items
    for (const groupItem of state.items) {
      if (groupItem.type === 'group' && groupItem.items) {
        item = groupItem.items.find((i) => i.id === state.selectedItemId);
        if (item) return item;
      }
    }
    return null;
  }, [state.items, state.selectedItemId]);

  const importJSON = useCallback((jsonString) => {
    const { items, error } = parseJSON(jsonString);
    if (error) {
      return { success: false, error };
    }
    dispatch({ type: ActionTypes.LOAD_ITEMS, payload: items });
    return { success: true };
  }, []);

  const exportJSON = useCallback(() => {
    return generateJSON(state.items);
  }, [state.items]);

  const clearAll = useCallback(() => {
    dispatch({ type: ActionTypes.LOAD_ITEMS, payload: [] });
    dispatch({ type: ActionTypes.CLEAR_ACTIVE_PRESET });
  }, []);

  // Preset actions
  const setActivePreset = useCallback((preset) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_PRESET, payload: preset });
  }, []);

  const clearActivePreset = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ACTIVE_PRESET });
  }, []);

  const saveMyPreset = useCallback((name) => {
    const key = `my-preset-${Date.now()}`;
    const items = state.items.map((item) => {
      // Strip IDs to create clean preset data
      const { id, ...rest } = item;
      return rest;
    });
    dispatch({ type: ActionTypes.SAVE_MY_PRESET, payload: { key, name, items } });
    return key;
  }, [state.items]);

  const overwriteMyPreset = useCallback((key) => {
    const existing = state.myPresets.find((p) => p.key === key);
    if (!existing) return;
    const items = state.items.map((item) => {
      const { id, ...rest } = item;
      return rest;
    });
    dispatch({ type: ActionTypes.SAVE_MY_PRESET, payload: { key, name: existing.name, items } });
  }, [state.items, state.myPresets]);

  const deleteMyPreset = useCallback((key) => {
    dispatch({ type: ActionTypes.DELETE_MY_PRESET, payload: key });
  }, []);

  const loadFromMTMR = useCallback(async () => {
    try {
      // Check if server is running
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        return {
          success: false,
          error: 'MTMR Designer Server is not running. Please start the server and try again.'
        };
      }

      const result = await loadFromMTMRFile();
      if (result.success) {
        // Convert items to full items with IDs, handling nested structures safely
        const items = processMTMRItems(result.data);
        dispatch({ type: ActionTypes.LOAD_FROM_MTM, payload: items });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Helper function to safely process MTMR items without recursion
  const processMTMRItems = useCallback((items, processedIds = new Set()) => {
    return items.map((item) => {
      // Generate unique ID if not present
      const id = item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prevent infinite recursion by tracking processed items
      if (processedIds.has(id)) {
        console.warn('Duplicate item detected, skipping:', id);
        return null;
      }
      processedIds.add(id);

      // Get element definition
      const definition = getElementDefinition(item.type);
      
      // For unknown types, create a generic element preserving all properties
      if (!definition) {
        return {
          id,
          type: item.type,
          ...item,
        };
      }

      // Create element with default properties and overrides
      const element = {
        id,
        type: item.type,
        ...definition.defaultProps,
        ...item,
      };

      // Handle nested items (groups) separately to avoid recursion
      if (item.items && Array.isArray(item.items)) {
        element.items = processMTMRItems(item.items, processedIds);
      }

      return element;
    }).filter(Boolean);
  }, []);

  const saveToMTMR = useCallback(async () => {
    try {
      const jsonContent = generateJSON(state.items);
      const result = await saveToMTMRFile(jsonContent);
      if (result.success) {
        dispatch({ type: ActionTypes.MARK_CLEAN });
        // Update mtmrItems after successful save
        dispatch({
          type: ActionTypes.LOAD_FROM_MTM,
          payload: JSON.parse(JSON.stringify(state.items))
        });
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [state.items]);

  // Helper function to compare items for deep equality
  const itemsEqual = useCallback((a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  }, []);

  // Determine if save button should be enabled
  const shouldEnableSave = state.isDirty ||
    (state.mtmrItems !== null && !itemsEqual(state.items, state.mtmrItems));

  const value = {
    // State
    items: state.items,
    selectedItemId: state.selectedItemId,
    canUndo,
    canRedo,
    activePreset: state.activePreset,
    myPresets: state.myPresets,
    isDirty: state.isDirty,
    shouldEnableSave,

    // Actions
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    selectItem,
    deselectItem,
    loadItems,
    undo,
    redo,
    getSelectedItem,
    importJSON,
    exportJSON,
    clearAll,
    setActivePreset,
    clearActivePreset,
    saveMyPreset,
    overwriteMyPreset,
    deleteMyPreset,
    loadFromMTMR,
    saveToMTMR,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { ActionTypes };