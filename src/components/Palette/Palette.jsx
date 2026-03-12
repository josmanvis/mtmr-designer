import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useApp } from '../../context/AppContext';
import { elementCategories, getElementsByCategory } from '../../data/elementDefinitions';
import './Palette.css';

export default function Palette() {
  const { addItem, selectItem } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(elementCategories).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {})
  );

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleItemClick = (type) => {
    const newItem = addItem(type);
    if (newItem) {
      selectItem(newItem.id);
    }
  };

  // Filter elements based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return Object.entries(elementCategories).map(([categoryKey, category]) => ({
        categoryKey,
        category,
        elements: getElementsByCategory(categoryKey),
      }));
    }

    const query = searchQuery.toLowerCase().trim();
    return Object.entries(elementCategories)
      .map(([categoryKey, category]) => {
        const allElements = getElementsByCategory(categoryKey);
        const filteredElements = allElements.filter(
          (el) =>
            el.label.toLowerCase().includes(query) ||
            el.type.toLowerCase().includes(query) ||
            (el.key && el.key.toLowerCase().includes(query))
        );
        return { categoryKey, category, elements: filteredElements };
      })
      .filter((cat) => cat.elements.length > 0);
  }, [searchQuery]);

  // Expand all categories when searching
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="palette">
      <div className="palette-header">
        <div className="palette-search">
          <span className="palette-search-icon">🔍</span>
          <input
            type="text"
            className="palette-search-input"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="palette-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="palette-content">
        {filteredCategories.map(({ categoryKey, category, elements }) => (
          <PaletteCategory
            key={categoryKey}
            categoryKey={categoryKey}
            category={category}
            elements={elements}
            isExpanded={isSearching ? true : expandedCategories[categoryKey]}
            onToggle={() => toggleCategory(categoryKey)}
            onItemClick={handleItemClick}
          />
        ))}
        {filteredCategories.length === 0 && (
          <div className="palette-no-results">
            No elements found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

function PaletteCategory({ categoryKey, category, elements, isExpanded, onToggle, onItemClick }) {

  return (
    <div className={`palette-category ${isExpanded ? 'expanded' : ''}`}>
      <button className="palette-category-header" onClick={onToggle}>
        <span className="category-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="category-label">{category.label}</span>
        <span className="category-count">{elements.length}</span>
      </button>
      {isExpanded && (
        <div className="palette-items">
          {elements.map((element) => {
            const elementKey = element.key || element.type;
            return (
              <PaletteItem
                key={elementKey}
                element={element}
                onClick={() => onItemClick(elementKey)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaletteItem({ element, onClick }) {
  const elementKey = element.key || element.type;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${elementKey}`,
    data: {
      type: 'palette-item',
      elementType: element.type,
      elementKey: elementKey,
      defaultProps: element.defaultProps,
    },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="palette-item"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <span className="palette-item-icon">{element.icon}</span>
      <span className="palette-item-label">{element.label}</span>
    </div>
  );
}