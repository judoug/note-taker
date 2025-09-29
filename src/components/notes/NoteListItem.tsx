import { NoteListItemProps } from '@/types';
import { generatePreview, formatDate, getTagColor, getReadingTime } from '@/lib/note-utils';
import { MoreVertical, Edit3, Trash2, Clock, FileText } from 'lucide-react';
import { useState } from 'react';

export function NoteListItem({ note, onClick, onEdit, onDelete }: NoteListItemProps) {
  const [showActions, setShowActions] = useState(false);
  const preview = generatePreview(note.content, 200);
  const readingTime = getReadingTime(note.content);

  return (
    <div 
      className="group flex items-center p-4 bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
      onClick={() => onClick(note)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Note Icon */}
      <div className="flex-shrink-0 mr-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Title and Preview */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
            {note.title || 'Untitled Note'}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-5">
            {preview}
          </p>
        </div>

        {/* Tags and Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {note.tags.slice(0, 4).map((tag) => (
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
              {note.tags.length > 4 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{note.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Reading Time */}
          <span className="flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" />
            {readingTime}
          </span>
        </div>
      </div>

      {/* Right Side - Date and Actions */}
      <div className="flex-shrink-0 flex items-center gap-3 ml-4">
        {/* Last Updated */}
        <div className="text-right">
          <div className="text-xs text-gray-500">
            {formatDate(note.updatedAt)}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button
            className="p-2 rounded-md hover:bg-gray-200 text-gray-400 hover:text-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            title="Edit note"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-md hover:bg-gray-200 text-gray-400 hover:text-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Show more options menu
            }}
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
