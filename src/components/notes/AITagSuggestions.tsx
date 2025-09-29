'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, X, Loader2, Lightbulb, Check } from 'lucide-react';
import { useTagSuggestionMutation } from '@/hooks/useTagSuggestions';
import type { SuggestTagsRequest } from '@/types';

interface AITagSuggestionsProps {
  title: string;
  content: string;
  existingTags: string[];
  onTagAdd: (tag: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AITagSuggestions({
  title,
  content,
  existingTags,
  onTagAdd,
  disabled = false,
  className = ""
}: AITagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rejectedTags, setRejectedTags] = useState<Set<string>>(new Set());
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);
  
  const tagSuggestionMutation = useTagSuggestionMutation();

  const handleSuggestTags = useCallback(async () => {
    if (disabled || tagSuggestionMutation.isPending) return;

    const requestData: SuggestTagsRequest = {
      title: title.trim(),
      content: content.trim(),
      existingTags: existingTags,
    };

    try {
      const response = await tagSuggestionMutation.mutateAsync(requestData);
      
      // Filter out rejected tags
      const newSuggestions = response.suggestions.filter(
        tag => !rejectedTags.has(tag) && !existingTags.includes(tag)
      );
      
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to get tag suggestions:', error);
      setSuggestions([]);
    }
  }, [disabled, tagSuggestionMutation, title, content, existingTags, rejectedTags]);

  // Auto-suggest tags when content changes (debounced)
  useEffect(() => {
    if (!autoSuggestEnabled || disabled) return;
    if (!title.trim() || content.length < 20) return; // Need minimum content

    const timeoutId = setTimeout(() => {
      handleSuggestTags();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [title, content, existingTags, autoSuggestEnabled, disabled, handleSuggestTags]);

  const handleAcceptTag = (tag: string) => {
    onTagAdd(tag);
    setSuggestions(prev => prev.filter(t => t !== tag));
  };

  const handleRejectTag = (tag: string) => {
    setRejectedTags(prev => new Set([...prev, tag]));
    setSuggestions(prev => prev.filter(t => t !== tag));
  };

  const handleToggleAutoSuggest = () => {
    setAutoSuggestEnabled(!autoSuggestEnabled);
    if (!autoSuggestEnabled) {
      // Re-enable and immediately suggest if there's content
      if (title.trim() && content.length >= 20) {
        handleSuggestTags();
      }
    } else {
      // Clear suggestions when disabling
      setSuggestions([]);
    }
  };

  // Don't render if disabled or no content
  if (disabled || (!title.trim() && content.length < 10)) {
    return null;
  }

  const hasMinimumContent = title.trim() && content.length >= 20;
  const isLoading = tagSuggestionMutation.isPending;
  const hasError = tagSuggestionMutation.isError;
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">AI Tag Suggestions</span>
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-purple-600" />}
        </div>
        
        <div className="flex items-center gap-2">
          {hasMinimumContent && (
            <button
              type="button"
              onClick={handleSuggestTags}
              disabled={isLoading}
              className="text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Generating...' : 'Suggest Now'}
            </button>
          )}
          
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSuggestEnabled}
              onChange={handleToggleAutoSuggest}
              className="w-3 h-3 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-1"
            />
            <span className="text-xs text-gray-500">Auto</span>
          </label>
        </div>
      </div>

      {/* Content area */}
      <div className="min-h-[2rem]">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing note content for relevant tags...
          </div>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className="flex items-center gap-2 text-sm text-red-600 py-2">
            <X className="w-4 h-4" />
            Failed to generate tag suggestions. Please try again.
          </div>
        )}

        {/* Suggestions */}
        {hasSuggestions && !isLoading && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Lightbulb className="w-3 h-3" />
              <span>Suggested tags based on your content:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {suggestions.map((tag) => (
                <div
                  key={tag}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800 hover:bg-purple-100 transition-colors"
                >
                  <span className="text-xs font-medium">{tag}</span>
                  
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleAcceptTag(tag)}
                      className="w-4 h-4 rounded-full bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 transition-colors flex items-center justify-center"
                      title="Add this tag"
                    >
                      <Check className="w-2.5 h-2.5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleRejectTag(tag)}
                      className="w-4 h-4 rounded-full bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 transition-colors flex items-center justify-center"
                      title="Dismiss this tag"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !hasError && !hasSuggestions && hasMinimumContent && autoSuggestEnabled && (
          <div className="text-xs text-gray-500 py-2">
            AI will suggest relevant tags as you write your note...
          </div>
        )}

        {/* Minimum content message */}
        {!hasMinimumContent && autoSuggestEnabled && (
          <div className="text-xs text-gray-400 py-2">
            Add a title and at least 20 characters of content to get AI tag suggestions.
          </div>
        )}

        {/* Auto-suggest disabled message */}
        {!autoSuggestEnabled && (
          <div className="text-xs text-gray-400 py-2">
            AI tag suggestions are disabled. Enable auto-suggestions or click &ldquo;Suggest Now&rdquo; to get recommendations.
          </div>
        )}
      </div>
    </div>
  );
}
