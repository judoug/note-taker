'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Sparkles, 
  Wand2, 
  FileText, 
  Brain, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react';
import type { GenerateNoteRequest, GeneratedNoteData } from '@/types';

// Form validation schema
const generateNoteSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
  tone: z.enum(['professional', 'casual', 'creative', 'academic']),
  length: z.enum(['short', 'medium', 'long']),
});

type GenerateNoteFormData = z.infer<typeof generateNoteSchema>;

interface AIGenerateNoteFormProps {
  onGenerate: (data: GenerateNoteRequest) => Promise<GeneratedNoteData>;
  onCancel: () => void;
  onUseGenerated: (note: GeneratedNoteData) => void;
  isLoading?: boolean;
}

// Tone configuration
const toneOptions = [
  {
    value: 'casual' as const,
    label: 'Casual',
    description: 'Friendly and conversational',
    icon: Sparkles,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    value: 'professional' as const,
    label: 'Professional',
    description: 'Business-appropriate and formal',
    icon: Briefcase,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  {
    value: 'creative' as const,
    label: 'Creative',
    description: 'Engaging and imaginative',
    icon: Wand2,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    value: 'academic' as const,
    label: 'Academic',
    description: 'Scholarly and precise',
    icon: GraduationCap,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
];

// Length configuration
const lengthOptions = [
  {
    value: 'short' as const,
    label: 'Short',
    description: '~100-120 words',
    icon: FileText,
  },
  {
    value: 'medium' as const,
    label: 'Medium',
    description: '~200-250 words',
    icon: FileText,
  },
  {
    value: 'long' as const,
    label: 'Long',
    description: '~350-400 words',
    icon: FileText,
  },
];

// Sample prompts for inspiration
const samplePrompts = [
  'Write a note about daily productivity tips',
  'Create a summary of TypeScript benefits for developers',
  'Explain the basics of sustainable living practices',
  'Write about effective time management strategies',
  'Describe the principles of good UI/UX design',
  'Create a note about healthy work-life balance',
];

export function AIGenerateNoteForm({ 
  onGenerate, 
  onCancel, 
  onUseGenerated,
  isLoading = false 
}: AIGenerateNoteFormProps) {
  const [generatedNote, setGeneratedNote] = useState<GeneratedNoteData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GenerateNoteFormData>({
    resolver: zodResolver(generateNoteSchema),
    defaultValues: {
      prompt: '',
      tone: 'casual',
      length: 'medium',
    },
  });

  const watchedTone = watch('tone');
  const watchedLength = watch('length');

  // Handle form submission
  const handleFormSubmit = async (data: GenerateNoteFormData) => {
    try {
      setIsGenerating(true);
      setGeneratedNote(null);
      
      const generated = await onGenerate(data);
      setGeneratedNote(generated);
    } catch (error) {
      console.error('Error generating note:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Use a sample prompt (not a hook, just a regular function)
  const handleUseSamplePrompt = (prompt: string) => {
    setValue('prompt', prompt);
  };

  // Use the generated note
  const handleUseGenerated = () => {
    if (generatedNote) {
      onUseGenerated(generatedNote);
    }
  };

  const isFormDisabled = isLoading || isGenerating;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Note Generator</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isFormDisabled}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Left Panel - Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to write about?
                </label>
                <textarea
                  {...register('prompt')}
                  id="prompt"
                  rows={4}
                  placeholder="Enter your prompt here... (e.g., 'Write about the benefits of meditation')"
                  disabled={isFormDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 resize-vertical"
                />
                {errors.prompt && (
                  <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
                )}
              </div>

              {/* Sample Prompts */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Need inspiration? Try these:</p>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleUseSamplePrompt(prompt)}
                      disabled={isFormDisabled}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose tone:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {toneOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = watchedTone === option.value;
                    
                    return (
                      <label
                        key={option.value}
                        className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                          isSelected
                            ? option.color
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          {...register('tone')}
                          type="radio"
                          value={option.value}
                          disabled={isFormDisabled}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-xs opacity-75">{option.description}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Length Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose length:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {lengthOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = watchedLength === option.value;
                    
                    return (
                      <label
                        key={option.value}
                        className={`relative cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                          isSelected
                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          {...register('length')}
                          type="radio"
                          value={option.value}
                          disabled={isFormDisabled}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center space-y-1">
                          <Icon className="w-5 h-5" />
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="text-xs opacity-75">{option.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isFormDisabled}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Note
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel - Generated Content */}
          <div className="flex-1 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Generated Note</h3>
              <p className="text-sm text-gray-500">Your AI-generated content will appear here</p>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Creating your note...</p>
                  </div>
                </div>
              ) : generatedNote ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {generatedNote.title}
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {generatedNote.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleUseGenerated}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Use This Note
                    </button>
                    <button
                      onClick={() => setGeneratedNote(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Fill out the form and click &ldquo;Generate Note&rdquo; to see AI-powered content</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
