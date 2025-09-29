// Re-export Prisma types for consistency
export type { User, Note, Tag, TagSource } from '@prisma/client';
import type { User, Note, Tag } from '@prisma/client';

// Extended types with relations
export interface UserWithNotes {
  id: string
  clerkId: string
  email: string
  name?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  notes: Note[]
}

export interface NoteWithTags {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  userId: string
  tags: Tag[]
}

export interface NoteWithUserAndTags extends NoteWithTags {
  user: User
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

// Form types for notes
export interface CreateNoteData {
  title: string
  content: string
  tags?: string[] // Tag names to create/associate
}

export interface UpdateNoteData {
  title?: string
  content?: string
  tags?: string[] // Tag names to create/associate
}

// UI component types
export type ViewMode = 'list' | 'grid'

export interface NotesViewProps {
  mode: ViewMode
  notes: NoteWithTags[]
  onNoteClick: (note: NoteWithTags) => void
  onNoteEdit: (note: NoteWithTags) => void
  onNoteDelete: (noteId: string) => void
}

export interface NoteFilterState {
  search: string
  tags: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  source?: 'all' | 'manual' | 'ai'
}

// Component prop types
export interface NoteCardProps {
  note: NoteWithTags
  onClick: (note: NoteWithTags) => void
  onEdit: (note: NoteWithTags) => void
  onDelete: (noteId: string) => void
}

export interface NoteListItemProps {
  note: NoteWithTags
  onClick: (note: NoteWithTags) => void
  onEdit: (note: NoteWithTags) => void
  onDelete: (noteId: string) => void
}

// AI Generation types
export interface GenerateNoteRequest {
  prompt: string
  tone?: 'professional' | 'casual' | 'creative' | 'academic'
  length?: 'short' | 'medium' | 'long'
}

export interface GeneratedNoteData {
  title: string
  content: string
  generatedBy: 'ai'
  prompt: string
  settings: {
    tone: string
    length: string
  }
}

export interface GenerateNoteResponse {
  success: boolean
  data: GeneratedNoteData
  usage: {
    tokens: number
    model: string
  }
}
