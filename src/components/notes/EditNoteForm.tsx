'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Hash, Save } from 'lucide-react';
import { AITagSuggestions } from './AITagSuggestions';
import type { UpdateNoteData, NoteWithTags } from '@/types';

// Form validation schema
const editNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional(),
});

type EditNoteFormData = z.infer<typeof editNoteSchema>;

interface EditNoteFormProps {
  note: NoteWithTags;
  onSubmit: (data: UpdateNoteData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditNoteForm({ note, onSubmit, onCancel, isLoading = false }: EditNoteFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note.tags.map(tag => tag.name));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    reset,
    watch,
  } = useForm<EditNoteFormData>({
    resolver: zodResolver(editNoteSchema),
    defaultValues: {
      title: note.title,
      content: note.content,
      tags: note.tags.map(tag => tag.name),
    },
  });

  // Watch form values for AI suggestions
  const watchedTitle = watch('title') || '';
  const watchedContent = watch('content') || '';

  // Update form when note changes
  useEffect(() => {
    reset({
      title: note.title,
      content: note.content,
      tags: note.tags.map(tag => tag.name),
    });
    setTags(note.tags.map(tag => tag.name));
  }, [note, reset]);

  // Add tag to the list
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setValue('tags', newTags, { shouldDirty: true });
      setTagInput('');
    }
  };

  // Remove tag from the list
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags, { shouldDirty: true });
  };

  // Add AI suggested tag
  const handleAITagAdd = (suggestedTag: string) => {
    if (!tags.includes(suggestedTag)) {
      const newTags = [...tags, suggestedTag];
      setTags(newTags);
      setValue('tags', newTags, { shouldDirty: true });
    }
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Form submission
  const handleFormSubmit = async (data: EditNoteFormData) => {
    try {
      // Only send changed fields
      const updateData: UpdateNoteData = {};
      
      if (data.title !== note.title) {
        updateData.title = data.title;
      }
      
      if (data.content !== note.content) {
        updateData.content = data.content;
      }
      
      // Check if tags have changed
      const originalTags = note.tags.map(tag => tag.name).sort();
      const newTags = tags.sort();
      if (JSON.stringify(originalTags) !== JSON.stringify(newTags)) {
        updateData.tags = tags;
      }
      
      // Only submit if there are actual changes
      if (Object.keys(updateData).length > 0) {
        await onSubmit(updateData);
      } else {
        onCancel(); // No changes, just close
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;
  const hasChanges = isDirty || JSON.stringify(note.tags.map(tag => tag.name).sort()) !== JSON.stringify(tags.sort());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Edit Note</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isFormDisabled}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <form id="edit-note-form" onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              placeholder="Enter note title..."
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Content Textarea */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              {...register('content')}
              id="content"
              rows={8}
              placeholder="Write your note content here..."
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 resize-vertical"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {/* Existing Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={isFormDisabled}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag..."
                disabled={isFormDisabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={isFormDisabled || !tagInput.trim()}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Press Enter or click + to add tags
            </p>

            {/* AI Tag Suggestions */}
            <div className="mt-4">
              <AITagSuggestions
                title={watchedTitle}
                content={watchedContent}
                existingTags={tags}
                onTagAdd={handleAITagAdd}
                disabled={isFormDisabled}
              />
            </div>
          </div>
          </form>
        </div>

        {/* Fixed Form Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="text-sm text-gray-500">
            {hasChanges ? 'You have unsaved changes' : 'No changes made'}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isFormDisabled}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-note-form"
              disabled={isFormDisabled || !hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
