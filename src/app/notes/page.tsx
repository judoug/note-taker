'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { NotesToolbar } from '@/components/notes/NotesToolbar';
import { NotesView } from '@/components/notes/NotesView';
import type { ViewMode, NoteWithTags } from '@/types';
import type { Tag } from '@prisma/client';
import { filterNotes } from '@/lib/note-utils';

// Mock data for development (will be replaced with real data)
const mockNotes: NoteWithTags[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    content: 'React is a JavaScript library for building user interfaces. It was created by Facebook and is now maintained by Meta and the community. React makes it painless to create interactive UIs.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    userId: 'user1',
    tags: [
      { id: 't1', name: 'React', source: 'MANUAL', createdAt: new Date() },
      { id: 't2', name: 'JavaScript', source: 'MANUAL', createdAt: new Date() },
      { id: 't3', name: 'Frontend', source: 'AI', createdAt: new Date() }
    ]
  },
  {
    id: '2',
    title: 'Database Design Principles',
    content: 'Good database design is crucial for application performance. Consider normalization, indexing strategies, and query optimization. PostgreSQL offers excellent features for modern applications.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    userId: 'user1',
    tags: [
      { id: 't4', name: 'Database', source: 'MANUAL', createdAt: new Date() },
      { id: 't5', name: 'PostgreSQL', source: 'MANUAL', createdAt: new Date() },
      { id: 't6', name: 'Backend', source: 'AI', createdAt: new Date() }
    ]
  },
  {
    id: '3',
    title: 'AI-Powered Note Taking',
    content: 'This note was enhanced with AI-generated tags and summaries. Machine learning can help organize and categorize notes automatically.',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-16'),
    userId: 'user1',
    tags: [
      { id: 't7', name: 'AI', source: 'AI', createdAt: new Date() },
      { id: 't8', name: 'Machine Learning', source: 'AI', createdAt: new Date() },
      { id: 't9', name: 'Productivity', source: 'MANUAL', createdAt: new Date() }
    ]
  }
];

const mockTags: Tag[] = [
  { id: 't1', name: 'React', source: 'MANUAL', createdAt: new Date() },
  { id: 't2', name: 'JavaScript', source: 'MANUAL', createdAt: new Date() },
  { id: 't3', name: 'Frontend', source: 'AI', createdAt: new Date() },
  { id: 't4', name: 'Database', source: 'MANUAL', createdAt: new Date() },
  { id: 't5', name: 'PostgreSQL', source: 'MANUAL', createdAt: new Date() },
  { id: 't6', name: 'Backend', source: 'AI', createdAt: new Date() },
  { id: 't7', name: 'AI', source: 'AI', createdAt: new Date() },
  { id: 't8', name: 'Machine Learning', source: 'AI', createdAt: new Date() },
  { id: 't9', name: 'Productivity', source: 'MANUAL', createdAt: new Date() }
];

export default function NotesPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState<NoteWithTags[]>(mockNotes);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    } else if (isLoaded && isSignedIn) {
      setIsLoading(false);
      // TODO: Load user's actual notes from database
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking authentication
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }
  
  // Filter notes based on search and tags
  const filteredNotes = filterNotes(notes, {
    search: searchValue,
    tags: selectedTags
  });

  // Event handlers
  const handleNoteClick = (note: NoteWithTags) => {
    console.log('Open note:', note.id);
    // TODO: Navigate to note editor
  };

  const handleNoteEdit = (note: NoteWithTags) => {
    console.log('Edit note:', note.id);
    // TODO: Open note in edit mode
  };

  const handleNoteDelete = (noteId: string) => {
    console.log('Delete note:', noteId);
    // TODO: Implement delete confirmation and API call
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleCreateNote = () => {
    console.log('Create new note');
    // TODO: Navigate to new note editor
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there'}! Organize your thoughts with AI-powered features.
              </p>
            </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <NotesToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          availableTags={mockTags}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateNote={handleCreateNote}
          notesCount={filteredNotes.length}
          className="mb-6"
        />

        {/* Notes Display */}
        <NotesView
          mode={viewMode}
          notes={filteredNotes}
          onNoteClick={handleNoteClick}
          onNoteEdit={handleNoteEdit}
          onNoteDelete={handleNoteDelete}
        />
      </main>
    </div>
  );
}
