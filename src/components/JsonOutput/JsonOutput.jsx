import { useState, useEffect, useRef, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useApp } from '../../context/AppContext';
import { validateJSON } from '../../utils/jsonGenerator';
import './JsonOutput.css';

export default function JsonOutput() {
  const { items, exportJSON, importJSON, selectItem } = useApp();
  const [jsonText, setJsonText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const highlighterRef = useRef(null);

  // Update JSON text when items change
  useEffect(() => {
    if (!isEditing) {
      setJsonText(exportJSON());
    }
  }, [items, isEditing, exportJSON]);

  // Sync scroll between textarea and highlighter
  const handleScroll = useCallback((e) => {
    if (highlighterRef.current) {
      highlighterRef.current.scrollTop = e.target.scrollTop;
      highlighterRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  // Find which element the cursor is inside
  const findElementAtCursor = useCallback((text, cursorPos) => {
    // Parse the JSON to find element boundaries
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    let elementStarts = [];
    let currentElementStart = -1;
    let elementDepth = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\' && inString) {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '{') {
        if (depth === 1 && currentElementStart === -1) {
          // Start of a top-level object in the array
          currentElementStart = i;
          elementDepth = depth;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 1 && currentElementStart !== -1) {
          // End of a top-level object
          elementStarts.push({
            start: currentElementStart,
            end: i + 1,
          });
          currentElementStart = -1;
        }
      } else if (char === '[') {
        depth++;
      } else if (char === ']') {
        depth--;
      }
    }

    // Find which element contains the cursor
    for (let i = 0; i < elementStarts.length; i++) {
      const element = elementStarts[i];
      if (cursorPos >= element.start && cursorPos <= element.end) {
        return i;
      }
    }

    return -1;
  }, []);

  // Handle cursor position changes
  const handleCursorChange = useCallback(() => {
    if (!textareaRef.current || isEditing) return;

    const cursorPos = textareaRef.current.selectionStart;
    const elementIndex = findElementAtCursor(jsonText, cursorPos);

    if (elementIndex >= 0 && elementIndex < items.length) {
      const item = items[elementIndex];
      if (item && item.id) {
        selectItem(item.id);
      }
    }
  }, [jsonText, items, selectItem, isEditing, findElementAtCursor]);

  const handleTextChange = (e) => {
    setJsonText(e.target.value);
    setIsEditing(true);
    setError(null);
  };

  const handleApply = () => {
    const validation = validateJSON(jsonText);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    const result = importJSON(jsonText);
    if (result.success) {
      setIsEditing(false);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  const handleCancel = () => {
    setJsonText(exportJSON());
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="json-output">
      {isEditing && (
        <div className="json-header">
          <div className="json-actions">
            <button onClick={handleApply} className="json-button primary">
              Apply
            </button>
            <button onClick={handleCancel} className="json-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="json-error">
          <span className="error-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="json-editor">
        <div className="json-highlight-container">
          <div
            ref={highlighterRef}
            className="json-highlighter"
          >
            <SyntaxHighlighter
              language="json"
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: '12px',
                background: '#252525',
                fontSize: '12px',
                lineHeight: '1.5',
                fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace",
                minHeight: '100%',
              }}
              codeTagProps={{
                style: {
                  fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace",
                }
              }}
            >
              {jsonText || ' '}
            </SyntaxHighlighter>
          </div>
          <textarea
            ref={textareaRef}
            value={jsonText}
            onChange={handleTextChange}
            onScroll={handleScroll}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            className={`json-textarea ${error ? 'has-error' : ''} ${isEditing ? 'editing' : ''}`}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="json-footer">
        <span className="item-count">{items.length} items</span>
        <span className="json-hint">
          {isEditing
            ? 'Edit the JSON and click Apply to update'
            : 'Click to select an element'}
        </span>
      </div>
    </div>
  );
}