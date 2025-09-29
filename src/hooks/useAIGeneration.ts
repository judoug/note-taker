import { useMutation } from '@tanstack/react-query';
import { generateNote } from '@/lib/api';
import type { GenerateNoteRequest, GeneratedNoteData } from '@/types';

// Generate note mutation
export function useGenerateNote() {
  return useMutation({
    mutationFn: (data: GenerateNoteRequest) => generateNote(data),
    onSuccess: (response) => {
      console.log('Note generated successfully:', response.data.title);
    },
    onError: (error) => {
      console.error('Failed to generate note:', error);
    },
  });
}

// Helper hook that returns just the data, for easier use in components
export function useAINoteMutation() {
  const mutation = useGenerateNote();

  return {
    generateNote: async (request: GenerateNoteRequest): Promise<GeneratedNoteData> => {
      const response = await mutation.mutateAsync(request);
      return response.data;
    },
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
