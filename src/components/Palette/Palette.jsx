import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useApp } from '../../context/AppContext';
import { elementCategories, getElementsByCategory } from '../../data/elementDefinitions';
import './Palette.css';

export default function Palette() {
  const { addItem, selectItem } = useApp();
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

  return (
    <div className="palette">
      <div className="palette-header">
        <h2>Elements</h2>
      </div>
      <div className="palette-content">
        {Object.entries(elementCategories).map(([categoryKey, category]) => (
          <PaletteCategory
            key={categoryKey}
            categoryKey={categoryKey}
            category={category}
            isExpanded={expandedCategories[categoryKey]}
            onToggle={() => toggleCategory(categoryKey)}
            onItemClick={handleItemClick}
          />
        ))}
      </div>
    </div>
  );
}

function PaletteCategory({ categoryKey, category, isExpanded, onToggle, onItemClick }) {
  const elements = getElementsByCategory(categoryKey);

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