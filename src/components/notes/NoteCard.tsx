import { NoteCardProps } from '@/types';
import { generatePreview, formatDate, getTagColor, getReadingTime } from '@/lib/note-utils';
import { MoreVertical, Edit3, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';

export function NoteCard({ note, onClick, onEdit, onDelete }: NoteCardProps) {
  const [showActions, setShowActions] = useState(false);
  const preview = generatePreview(note.content, 120);
  const readingTime = getReadingTime(note.content);

  return (
    <div 
      className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => onClick(note)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Main Content */}
      <div className="p-4 pb-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-5 pr-2">
            {note.title || 'Untitled Note'}
          </h3>
          
          {/* Action Menu */}
          <div className={`transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle dropdown menu
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <p className="text-gray-600 text-xs leading-5 line-clamp-3 mb-3">
          {preview}
        </p>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag.name, tag.source)}`}
              >
                {tag.source === 'AI' && (
                  <span className="mr-1 text-xs">✨</span>
                )}
                {tag.name}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readingTime}
            </span>
            <span>{formatDate(note.updatedAt)}</span>
          </div>
          
          {/* Quick Actions */}
          <div className={`flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <button
              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              title="Edit note"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              title="Delete note"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
