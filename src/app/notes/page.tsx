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
import { Sparkles, X } from 'lucide-react';
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
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
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

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + N: Create new note
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        setShowCreateForm(true);
      }

      // Ctrl/Cmd + G: AI Generate
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        setShowAIForm(true);
      }

      // Escape: Close modals
      if (event.key === 'Escape') {
        if (viewingNote) setViewingNote(null);
        else if (editingNote) setEditingNote(null);
        else if (deletingNote) setDeletingNote(null);
        else if (showCreateForm) setShowCreateForm(false);
        else if (showAIForm) setShowAIForm(false);
        else if (showKeyboardHelp) setShowKeyboardHelp(false);
      }

      // V: Toggle view mode
      if (event.key === 'v' && !event.ctrlKey && !event.metaKey) {
        setViewMode(viewMode === 'grid' ? 'list' : 'grid');
      }

      // Focus search bar with /
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        const searchInput = document.querySelector('input[aria-label="Search through your notes"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // ?: Show keyboard shortcuts help
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setShowKeyboardHelp(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, viewingNote, editingNote, deletingNote, showCreateForm, showAIForm, showKeyboardHelp]);

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
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs md:text-sm">N</span>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900">Notes</h1>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
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

        <main id="main-content" className="container mx-auto px-4 py-4 md:py-8">
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleNewNoteClick}
                className="inline-flex items-center justify-center px-4 py-2.5 md:py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Create a new note"
              >
                <span className="mr-2">+</span>
                Create Note
              </button>
              
              <button
                onClick={handleAIGenerateClick}
                className="inline-flex items-center justify-center px-4 py-2.5 md:py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Generate a note using AI"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-sm text-gray-600 hidden md:block">View:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 md:p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  aria-label="Switch to grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 md:p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  aria-label="Switch to list view"
                  aria-pressed={viewMode === 'list'}
                >
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="bg-current h-1 rounded-sm"></div>
                    <div className="bg-current h-1 rounded-sm"></div>
                    <div className="bg-current h-1 rounded-sm"></div>
                  </div>
                </button>
              </div>
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

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowKeyboardHelp(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="keyboard-help-title"
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="keyboard-help-title" className="text-xl font-semibold text-gray-900">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                aria-label="Close keyboard shortcuts help"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Create new note</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">Ctrl+N</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">AI Generate note</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">Ctrl+G</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Search notes</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">/</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toggle view mode</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Close modals</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">Esc</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Show this help</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">?</kbd>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Press any shortcut key while not typing to use these commands
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}