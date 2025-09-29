'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { NotesView } from '@/components/notes/NotesView';
import { CreateNoteForm } from '@/components/notes/CreateNoteForm';
import { EditNoteForm } from '@/components/notes/EditNoteForm';
import { DeleteNoteDialog } from '@/components/notes/DeleteNoteDialog';
import { AIGenerateNoteForm } from '@/components/notes/AIGenerateNoteForm';
import { AdvancedFilters } from '@/components/notes/AdvancedFilters';
import { NoteDetailModal } from '@/components/notes/NoteDetailModal';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useAINoteMutation } from '@/hooks/useAIGeneration';
import type { ViewMode, NoteWithTags, CreateNoteData, UpdateNoteData, GenerateNoteRequest, GeneratedNoteData, NotesFilterState, FilterOption } from '@/types';
import type { Tag } from '@prisma/client';

export default function NotesPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  // Advanced Filter State
  const [filters, setFilters] = useState<NotesFilterState>({
    search: '',
    selectedTags: [],
    tagSource: 'ALL',
    dateRange: {},
    sortBy: 'updated',
    sortOrder: 'desc'
  });
  
  // Modal States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAIForm, setShowAIForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithTags | null>(null);
  const [deletingNote, setDeletingNote] = useState<NoteWithTags | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteWithTags | null>(null);
  
  // Available tags state
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // React Query hooks
  const { 
    data: notes = [], 
    isLoading: notesLoading, 
    error: notesError,
    refetch: refetchNotes 
  } = useNotes({
    search: filters.search || undefined,
    tags: filters.selectedTags.length > 0 ? filters.selectedTags : undefined,
    tagSource: filters.tagSource,
    dateFrom: filters.dateRange.from,
    dateTo: filters.dateRange.to,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const aiNoteMutation = useAINoteMutation();

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

  // Prepare available tags for filter component
  const availableTagsForFilter: FilterOption[] = allTags.map(tag => ({
    value: tag.name,
    label: tag.name,
    count: notes.filter(note => note.tags.some(noteTag => noteTag.name === tag.name)).length
  }));

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
    // Open note detail modal for viewing and summarization
    setViewingNote(note);
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

  const handleAIGenerateClick = () => {
    setShowAIForm(true);
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

  // AI Generation Handlers
  const handleGenerateNote = async (request: GenerateNoteRequest) => {
    return await aiNoteMutation.generateNote(request);
  };

  const handleUseGeneratedNote = async (generatedNote: GeneratedNoteData) => {
    // Create a new note with the generated content
    const noteData: CreateNoteData = {
      title: generatedNote.title,
      content: generatedNote.content,
      tags: ['ai-generated'], // Add a tag to indicate this was AI-generated
    };

    await createNoteMutation.mutateAsync(noteData);
    setShowAIForm(false);
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
          {/* Advanced Filters */}
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={availableTagsForFilter}
            isLoading={notesLoading}
            totalCount={notes.length}
            className="mb-6"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleNewNoteClick}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Note
              </button>
              
              <button
                onClick={handleAIGenerateClick}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                AI Generate
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                List
              </button>
            </div>
          </div>

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

      {showAIForm && (
        <AIGenerateNoteForm
          onGenerate={handleGenerateNote}
          onCancel={() => setShowAIForm(false)}
          onUseGenerated={handleUseGeneratedNote}
          isLoading={aiNoteMutation.isLoading}
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

      {viewingNote && (
        <NoteDetailModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onEdit={(note) => {
            setViewingNote(null);
            setEditingNote(note);
          }}
          onDelete={(note) => {
            setViewingNote(null);
            setDeletingNote(note);
          }}
        />
      )}
    </>
  );
}