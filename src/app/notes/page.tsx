'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { NotesToolbar } from '@/components/notes/NotesToolbar';
import { NotesView } from '@/components/notes/NotesView';
import { CreateNoteForm } from '@/components/notes/CreateNoteForm';
import { EditNoteForm } from '@/components/notes/EditNoteForm';
import { DeleteNoteDialog } from '@/components/notes/DeleteNoteDialog';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import type { ViewMode, NoteWithTags, CreateNoteData, UpdateNoteData } from '@/types';
import type { Tag } from '@prisma/client';

export default function NotesPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithTags | null>(null);
  const [deletingNote, setDeletingNote] = useState<NoteWithTags | null>(null);
  
  // Available tags state
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // React Query hooks
  const { 
    data: notes = [], 
    isLoading: notesLoading, 
    error: notesError,
    refetch: refetchNotes 
  } = useNotes({
    search: searchValue || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    } else if (isLoaded && isSignedIn) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  // Extract unique tags from notes
  useEffect(() => {
    if (notes.length > 0) {
      const uniqueTags = new Map<string, Tag>();
      
      notes.forEach(note => {
        note.tags.forEach(tag => {
          if (!uniqueTags.has(tag.name)) {
            uniqueTags.set(tag.name, tag);
          }
        });
      });
      
      setAllTags(Array.from(uniqueTags.values()));
    }
  }, [notes]);

  // Show loading state while checking authentication
  if (!isLoaded || isLoading || notesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  // Don't render if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }

  // Show error state
  if (notesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Failed to load your notes. Please try again.</p>
          <button
            onClick={() => refetchNotes()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Event Handlers
  const handleNoteClick = (note: NoteWithTags) => {
    console.log('Note clicked:', note.title);
    // TODO: Implement navigation to note detail page
  };

  const handleNoteEdit = (note: NoteWithTags) => {
    setEditingNote(note);
  };

  const handleNoteDelete = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setDeletingNote(note);
    }
  };

  const handleNewNoteClick = () => {
    setShowCreateForm(true);
  };

  // Form Handlers
  const handleCreateNote = async (data: CreateNoteData) => {
    await createNoteMutation.mutateAsync(data);
    setShowCreateForm(false);
  };

  const handleUpdateNote = async (data: UpdateNoteData) => {
    if (editingNote) {
      await updateNoteMutation.mutateAsync({ id: editingNote.id, data });
      setEditingNote(null);
    }
  };

  const handleDeleteNote = async () => {
    if (deletingNote) {
      await deleteNoteMutation.mutateAsync(deletingNote.id);
      setDeletingNote(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Notes</h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there'}! 
                  Organize your thoughts with AI-powered features.
                </p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <NotesToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={allTags}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateNote={handleNewNoteClick}
            notesCount={notes.length}
          />

          <NotesView
            mode={viewMode}
            notes={notes}
            onNoteClick={handleNoteClick}
            onNoteEdit={handleNoteEdit}
            onNoteDelete={handleNoteDelete}
          />
        </main>
      </div>

      {/* Modals */}
      {showCreateForm && (
        <CreateNoteForm
          onSubmit={handleCreateNote}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createNoteMutation.isPending}
        />
      )}

      {editingNote && (
        <EditNoteForm
          note={editingNote}
          onSubmit={handleUpdateNote}
          onCancel={() => setEditingNote(null)}
          isLoading={updateNoteMutation.isPending}
        />
      )}

      {deletingNote && (
        <DeleteNoteDialog
          note={deletingNote}
          onConfirm={handleDeleteNote}
          onCancel={() => setDeletingNote(null)}
          isLoading={deleteNoteMutation.isPending}
        />
      )}
    </>
  );
}