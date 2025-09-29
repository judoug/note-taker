'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import type { NoteWithTags } from '@/types';

interface DeleteNoteDialogProps {
  note: NoteWithTags;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteNoteDialog({ note, onConfirm, onCancel, isLoading = false }: DeleteNoteDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Note</h3>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900">&ldquo;{note.title}&rdquo;</span>?
          </p>
          
          {/* Note Preview */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{note.title}</h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {note.content.length > 100 
                ? `${note.content.substring(0, 100)}...` 
                : note.content
              }
            </p>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                    +{note.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isLoading ? 'Deleting...' : 'Delete Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
