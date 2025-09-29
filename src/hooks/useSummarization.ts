'use client';

import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import type { SummarizeNoteRequest, SummarizeNoteResponse } from '@/types';

export function useSummarizeNoteMutation() {
  return useMutation<
    SummarizeNoteResponse, 
    Error, 
    { noteId: string; options: Omit<SummarizeNoteRequest, 'noteId'> }
  >({
    mutationFn: ({ noteId, options }) => aiApi.summarizeNote(noteId, options),
    onError: (error) => {
      console.error('AI Summarization failed:', error);
      // Optionally, show a toast notification or update UI to reflect error
    },
  });
}
