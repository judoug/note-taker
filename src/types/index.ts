// User types based on Clerk integration
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  clerkId: string
  createdAt: Date
  updatedAt: Date
}

// Note types for the core functionality
export interface Note {
  id: string
  userId: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: Tag[]
}

// Tag types for organization
export interface Tag {
  id: string
  noteId: string
  name: string
  source: 'AI' | 'manual'
  createdAt: Date
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
