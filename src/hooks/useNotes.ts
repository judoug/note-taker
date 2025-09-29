import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/lib/api';
import type { CreateNoteData, UpdateNoteData, NoteWithTags, NotesFilterParams } from '@/types';

// Query keys
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: NotesFilterParams) => [...noteKeys.lists(), filters] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
};

// Get all notes with advanced filters
export function useNotes(filters?: NotesFilterParams) {
  return useQuery({
    queryKey: noteKeys.list(filters || {}),
    queryFn: () => notesApi.getAll(filters),
    select: (data) => data.data || [], // Extract notes array from API response
  });
}

// Get a single note by ID
export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => notesApi.getById(id),
    select: (data) => data.data, // Extract note from API response
    enabled: !!id, // Only run if ID exists
  });
}

// Create note mutation
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteData) => notesApi.create(data),
    onMutate: async (newNote) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueriesData({ queryKey: noteKeys.lists() });

      // Optimistically update to the new value
      queryClient.setQueriesData(
        { queryKey: noteKeys.lists() },
        (old: NoteWithTags[] | undefined) => {
          if (!old) return [];
          
          // Create optimistic note with temporary ID
          const optimisticNote: NoteWithTags = {
            id: `temp-${Date.now()}`,
            title: newNote.title,
            content: newNote.content,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: '', // Will be filled by server
            tags: newNote.tags?.map(tagName => ({
              id: `temp-tag-${tagName}`,
              name: tagName,
              source: 'MANUAL' as const,
              createdAt: new Date(),
            })) || [],
          };

          return [optimisticNote, ...old];
        }
      );

      // Return a context object with the snapshotted value
      return { previousNotes };
    },
    onError: (err, newNote, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have correct data
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

// Update note mutation
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteData }) =>
      notesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });
      await queryClient.cancelQueries({ queryKey: noteKeys.detail(id) });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueriesData({ queryKey: noteKeys.lists() });
      const previousNote = queryClient.getQueryData(noteKeys.detail(id));

      // Optimistically update lists
      queryClient.setQueriesData(
        { queryKey: noteKeys.lists() },
        (old: NoteWithTags[] | undefined) => {
          if (!old) return [];
          
          return old.map(note => {
            if (note.id === id) {
              return {
                ...note,
                ...data,
                updatedAt: new Date(),
                tags: data.tags?.map(tagName => ({
                  id: `temp-tag-${tagName}`,
                  name: tagName,
                  source: 'MANUAL' as const,
                  createdAt: new Date(),
                })) || note.tags,
              };
            }
            return note;
          });
        }
      );

      // Optimistically update detail
      queryClient.setQueryData(
        noteKeys.detail(id),
        (old: NoteWithTags | undefined) => {
          if (!old) return old;
          
          return {
            ...old,
            ...data,
            updatedAt: new Date(),
            tags: data.tags?.map(tagName => ({
              id: `temp-tag-${tagName}`,
              name: tagName,
              source: 'MANUAL' as const,
              createdAt: new Date(),
            })) || old.tags,
          };
        }
      );

      return { previousNotes, previousNote };
    },
    onError: (err, { id }, context) => {
      // Roll back optimistic updates
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousNote) {
        queryClient.setQueryData(noteKeys.detail(id), context.previousNote);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(id) });
    },
  });
}

// Delete note mutation
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueriesData({ queryKey: noteKeys.lists() });

      // Optimistically remove from all lists
      queryClient.setQueriesData(
        { queryKey: noteKeys.lists() },
        (old: NoteWithTags[] | undefined) => {
          if (!old) return [];
          return old.filter(note => note.id !== id);
        }
      );

      return { previousNotes };
    },
    onError: (err, id, context) => {
      // Roll back optimistic updates
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}
