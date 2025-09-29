import { Plus, SortDesc, Filter, Sparkles } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { TagFilter } from './TagFilter';
import { ViewToggle } from './ViewToggle';
import type { ViewMode } from '@/types';
import type { Tag } from '@prisma/client';

interface NotesToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Tag[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateNote: () => void;
  onAIGenerate?: () => void;
  notesCount: number;
  className?: string;
}

export function NotesToolbar({
  searchValue,
  onSearchChange,
  selectedTags,
  onTagsChange,
  availableTags,
  viewMode,
  onViewModeChange,
  onCreateNote,
  onAIGenerate,
  notesCount,
  className = ""
}: NotesToolbarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Row - Search and Create */}
      <div className="flex items-center gap-3">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search notes by title, content, or tags..."
          className="flex-1"
        />
        
        <div className="flex items-center gap-2">
          {onAIGenerate && (
            <button
              onClick={onAIGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Generate</span>
            </button>
          )}
          
          <button
            onClick={onCreateNote}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>
      </div>

      {/* Bottom Row - Filters and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Tag Filter */}
          <TagFilter
            availableTags={availableTags}
            selectedTags={selectedTags}
            onChange={onTagsChange}
          />

          {/* Additional Filters (Future) */}
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white text-gray-700">
            <Filter className="w-4 h-4" />
            <span className="text-sm hidden md:inline">More Filters</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white text-gray-700">
            <SortDesc className="w-4 h-4" />
            <span className="text-sm hidden md:inline">Sort</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Notes Count */}
          <span className="text-sm text-gray-500">
            {notesCount === 0 ? 'No notes' : `${notesCount} ${notesCount === 1 ? 'note' : 'notes'}`}
          </span>

          {/* View Toggle */}
          <ViewToggle
            mode={viewMode}
            onChange={onViewModeChange}
          />
        </div>
      </div>
    </div>
  );
}
