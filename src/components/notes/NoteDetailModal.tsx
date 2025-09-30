'use client';

import React from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Hash,
  FileText,
  TrendingUp
} from 'lucide-react';
import { NoteSummary } from './NoteSummary';
import { formatDate, getWordCount, getReadingTime, getTagColor } from '@/lib/note-utils';
import type { NoteWithTags } from '@/types';

interface NoteDetailModalProps {
  note: NoteWithTags;
  onClose: () => void;
  onEdit: (note: NoteWithTags) => void;
  onDelete: (note: NoteWithTags) => void;
  className?: string;
}

export function NoteDetailModal({
  note,
  onClose,
  onEdit,
  onDelete,
  className = ""
}: NoteDetailModalProps) {
  const wordCount = getWordCount(note.content);
  const readingTime = getReadingTime(note.content);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-detail-title"
    >
      <div className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h1 
              id="note-detail-title"
              className="text-lg md:text-2xl font-bold text-gray-900 truncate"
            >
              {note.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                <span>Created {formatDate(new Date(note.createdAt))}</span>
              </div>
              
              {note.updatedAt !== note.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                  <span>Updated {formatDate(new Date(note.updatedAt))}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                <span>{wordCount} words</span>
              </div>
              
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                <span>{readingTime}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 md:gap-2 ml-2 md:ml-4">
            <button
              onClick={() => onEdit(note)}
              className="inline-flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Edit this note"
            >
              <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            
            <button
              onClick={() => onDelete(note)}
              className="inline-flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Delete this note"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
            
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Close note details"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Tags */}
            {note.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getTagColor(tag.name, tag.source as 'AI' | 'MANUAL')}`}
                    >
                      <Hash className="w-3 h-3" />
                      {tag.name}
                      {tag.source === 'AI' && (
                        <span className="text-xs opacity-75">(AI)</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            <NoteSummary note={note} />

            {/* Note Content */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Content</h3>
              <div className="prose prose-gray max-w-none">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {note.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
