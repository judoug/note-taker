import { Tag as TagIcon, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getTagColor } from '@/lib/note-utils';
import type { Tag } from '@prisma/client';

interface TagFilterProps {
  availableTags: Tag[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export function TagFilter({ availableTags, selectedTags, onChange, className = "" }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter(t => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.name));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTagObjects.map((tag) => (
            <span
              key={tag.id}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag.name, tag.source)}`}
            >
              {tag.source === 'AI' && <span className="text-xs">✨</span>}
              {tag.name}
              <button
                onClick={() => toggleTag(tag.name)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
      >
        <TagIcon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">
          {selectedTags.length > 0 ? `${selectedTags.length} tags selected` : 'Filter by tags'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Available Tags
            </div>
            
            {availableTags.length === 0 ? (
              <div className="text-sm text-gray-500 px-2 py-3 text-center">
                No tags available
              </div>
            ) : (
              <div className="space-y-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.name)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-gray-300'}`} />
                      <span className="flex items-center gap-1 flex-1">
                        {tag.source === 'AI' && <span className="text-xs">✨</span>}
                        {tag.name}
                      </span>
                      {tag.source === 'AI' && (
                        <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
