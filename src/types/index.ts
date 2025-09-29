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
