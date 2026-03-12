import { useState, useRef, useEffect } from 'react';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useApp } from '../../context/AppContext';
import TouchBarItem from './TouchBarItem';
import './TouchBar.css';

export default function TouchBar() {
  const { items, selectItem, selectedItemId, removeItem, addItem } = useApp();
  const [contextMenu, setContextMenu] = useState(null);
  const containerRef = useRef(null);

  // Make the touchbar a droppable area
  const { setNodeRef, isOver } = useDroppable({
    id: 'touchbar-drop-zone',
  });

  // Handle context menu
  const handleContextMenu = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      itemId,
    });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemId && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          removeItem(selectedItemId);
        }
      }
      if (e.key === 'Escape') {
        selectItem(null);
        setContextMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, removeItem, selectItem]);

  // Group items by alignment to match MTMR's actual layout
  const leftItems = items.filter(item => item.align === 'left');
  const centerItems = items.filter(item => !item.align || item.align === 'center');
  const rightItems = items.filter(item => item.align === 'right');

  return (
    <div className="touchbar-container" ref={containerRef}>
      <div className={`touchbar-frame ${isOver ? 'drag-over' : ''}`}>
        <div className="touchbar-screen" ref={setNodeRef}>
          <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
            <div className="touchbar-items">
              {items.length === 0 ? (
                <div className="touchbar-empty">
                  <span>Drag elements here or click from the palette</span>
                </div>
              ) : (
                <>
                  {/* Left-aligned items */}
                  <div className="touchbar-section touchbar-section-left">
                    {leftItems.map((item) => (
                      <TouchBarItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItemId === item.id}
                        onSelect={() => selectItem(item.id)}
                        onContextMenu={(e) => handleContextMenu(e, item.id)}
                      />
                    ))}
                  </div>

                  {/* Center-aligned items */}
                  <div className="touchbar-section touchbar-section-center">
                    {centerItems.map((item) => (
                      <TouchBarItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItemId === item.id}
                        onSelect={() => selectItem(item.id)}
                        onContextMenu={(e) => handleContextMenu(e, item.id)}
                      />
                    ))}
                  </div>

                  {/* Right-aligned items */}
                  <div className="touchbar-section touchbar-section-right">
                    {rightItems.map((item) => (
                      <TouchBarItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItemId === item.id}
                        onSelect={() => selectItem(item.id)}
                        onContextMenu={(e) => handleContextMenu(e, item.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </SortableContext>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={() => {
              selectItem(contextMenu.itemId);
              setContextMenu(null);
            }}
          >
            Edit
          </button>
          <button
            className="context-menu-item"
            onClick={() => {
              duplicateItem(contextMenu.itemId);
              setContextMenu(null);
            }}
          >
            Duplicate
          </button>
          <div className="context-menu-divider" />
          <button
            className="context-menu-item danger"
            onClick={() => {
              removeItem(contextMenu.itemId);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );

  function duplicateItem(itemId) {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const { id, ...itemWithoutId } = item;
      addItem(item.type, itemWithoutId);
    }
  }
}