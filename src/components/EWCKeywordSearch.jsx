import React, { useState, useRef, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, X } from 'lucide-react';

/**
 * EWCKeywordSearch
 * Props:
 *   searchEWCCodes  - fn(query) => results[]
 *   selectFromSearch - fn(result, setFacilities)
 *   setFacilities   - setter to clear results on new selection
 *   isHazardous     - fn(description) => bool
 */
export default function EWCKeywordSearch({ searchEWCCodes, selectFromSearch, setFacilities, isHazardous }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setHighlighted(-1);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const found = searchEWCCodes(val);
      setResults(found);
      setIsOpen(found.length > 0);
    }, 180);
  };

  const handleSelect = (result) => {
    selectFromSearch(result, setFacilities);
    setQuery(`${result.code} – ${result.description}`);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelect(results[highlighted]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Highlight matching terms in text
  const highlight = (text, query) => {
    if (!query || !text) return text;
    const terms = query.trim().split(/\s+/).filter(t => t.length > 1);
    if (!terms.length) return text;
    const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(pattern);
    return parts.map((part, i) =>
      pattern.test(part)
        ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="mb-6" ref={containerRef}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <label className="text-sm font-semibold text-blue-800">
            Quick Search — find your EWC code by keyword
          </label>
        </div>
        <p className="text-xs text-blue-600 mb-3">
          Type a description (e.g. "asbestos", "used oil", "paint") to jump straight to the right code — or use the dropdowns below.
        </p>

        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              placeholder="e.g. asbestos, used oil, fluorescent tubes, concrete…"
              className="w-full pl-9 pr-9 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
              {results.map((result, idx) => {
                const hazardous = isHazardous(result.description);
                return (
                  <button
                    key={result.code}
                    onClick={() => handleSelect(result)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors ${highlighted === idx ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-sm font-bold text-gray-800">{result.code}</span>
                          {hazardous ? (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full font-semibold">
                              <AlertTriangle className="w-3 h-3" />Hazardous
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full font-semibold">
                              <CheckCircle className="w-3 h-3" />Non-hazardous
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 leading-snug">
                          {highlight(result.description, query)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {result.chapterKey} · {result.subName}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                {results.length} result{results.length !== 1 ? 's' : ''} — select one to populate the dropdowns below
              </div>
            </div>
          )}

          {query.trim().length >= 2 && results.length === 0 && !isOpen && (
            <p className="text-xs text-gray-500 mt-2 pl-1">No matches found — try a different keyword or use the dropdowns below.</p>
          )}
        </div>
      </div>
    </div>
  );
}
