import { Grid3X3, List } from 'lucide-react';
import type { ViewMode } from '@/types';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ mode, onChange, className = "" }: ViewToggleProps) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-300 bg-white ${className}`}>
      <button
        onClick={() => onChange('grid')}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
          mode === 'grid'
            ? 'bg-blue-100 text-blue-700 border-blue-200'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
        title="Grid view"
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => onChange('list')}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-r-lg border-l transition-colors ${
          mode === 'list'
            ? 'bg-blue-100 text-blue-700 border-blue-200'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
        title="List view"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
