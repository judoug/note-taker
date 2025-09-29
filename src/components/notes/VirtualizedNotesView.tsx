'use client';

import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { NoteCard } from './NoteCard';
import { NoteListItem } from './NoteListItem';
import type { ViewMode, NoteWithTags } from '@/types';
import { Inbox } from 'lucide-react';

interface VirtualizedNotesViewProps {
  mode: ViewMode;
  notes: NoteWithTags[];
  onNoteClick: (note: NoteWithTags) => void;
  onNoteEdit: (note: NoteWithTags) => void;
  onNoteDelete: (note: NoteWithTags) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function VirtualizedNotesView({
  mode,
  notes,
  onNoteClick,
  onNoteEdit,
  onNoteDelete,
  isLoading,
  error,
}: VirtualizedNotesViewProps) {
  // Performance: Create a parent ref for the scrollable container
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Performance: Calculate item size based on view mode
  const estimateSize = useMemo(() => {
    return mode === 'grid' ? 280 : 120; // Grid cards are taller, list items are shorter
  }, [mode]);

  // Performance: Create virtualizer instance
  const virtualizer = useVirtualizer({
    count: notes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    // Performance: Add some margin for better UX
    overscan: mode === 'grid' ? 2 : 5,
  });

  // Performance: Calculate grid columns for responsive design
  const gridCols = useMemo(() => {
    if (mode !== 'grid') return 1;
    
    // Responsive grid: 1 col on mobile, 2 on tablet, 3+ on desktop
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 1; // Mobile
      if (width < 1024) return 2; // Tablet
      if (width < 1536) return 3; // Desktop
      return 4; // Large desktop
    }
    return 3; // Default
  }, [mode]);

  // Performance: Memoize virtual items calculation
  const virtualItems = virtualizer.getVirtualItems();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading notes</p>
          <p className="text-sm text-gray-500 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
        <p className="text-gray-500 max-w-md">
          {mode === 'grid' 
            ? "Create your first note or adjust your filters to see notes here."
            : "No notes match your current filters. Try adjusting your search criteria."
          }
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto" // Fixed height for virtualization
      style={{
        contain: 'strict', // Performance: Enable CSS containment
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Performance: Only render visible items */}
        {virtualItems.map((virtualItem) => {
          const note = notes[virtualItem.index];
          
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {mode === 'grid' ? (
                <div 
                  className={`grid gap-4 p-2`}
                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                  }}
                >
                  <NoteCard
                    note={note}
                    onClick={() => onNoteClick(note)}
                    onEdit={() => onNoteEdit(note)}
                    onDelete={() => onNoteDelete(note)}
                  />
                </div>
              ) : (
                <div className="p-2">
                  <NoteListItem
                    note={note}
                    onClick={() => onNoteClick(note)}
                    onEdit={() => onNoteEdit(note)}
                    onDelete={() => onNoteDelete(note)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
