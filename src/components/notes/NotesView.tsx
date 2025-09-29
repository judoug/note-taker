import { NotesViewProps } from '@/types';
import { NoteCard } from './NoteCard';
import { NoteListItem } from './NoteListItem';
import { Inbox } from 'lucide-react';

export function NotesView({ mode, notes, onNoteClick, onNoteEdit, onNoteDelete }: NotesViewProps) {
  // Empty state
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          Create your first note to get started organizing your thoughts and ideas.
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create Your First Note
        </button>
      </div>
    );
  }

  // Grid view
  if (mode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onClick={onNoteClick}
            onEdit={onNoteEdit}
            onDelete={onNoteDelete}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {notes.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
          onClick={onNoteClick}
          onEdit={onNoteEdit}
          onDelete={onNoteDelete}
        />
      ))}
    </div>
  );
}
