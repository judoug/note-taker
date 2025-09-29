import { useMutation } from '@tanstack/react-query';
import { suggestTags } from '@/lib/api';
import type { SuggestTagsRequest, SuggestTagsResponse } from '@/types';
import { ApiError } from '@/lib/api';

export function useTagSuggestionMutation() {
  return useMutation<SuggestTagsResponse, ApiError, SuggestTagsRequest>({
    mutationFn: async (requestData) => {
      return await suggestTags(requestData);
    },
  });
}
