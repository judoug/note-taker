'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  List, 
  AlignLeft, 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useSummarizeNoteMutation } from '@/hooks/useSummarization';
import { getWordCount } from '@/lib/note-utils';
import type { NoteWithTags, SummarizeNoteResponse } from '@/types';

interface NoteSummaryProps {
  note: NoteWithTags;
  className?: string;
}

export function NoteSummary({ note, className = "" }: NoteSummaryProps) {
  const [summaryType, setSummaryType] = useState<'brief' | 'detailed' | 'bullets'>('brief');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [currentSummary, setCurrentSummary] = useState<SummarizeNoteResponse | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const summarizeMutation = useSummarizeNoteMutation();

  const wordCount = getWordCount(note.content);
  const isEligibleForSummary = wordCount >= 50;
  const isLoading = summarizeMutation.isPending;
  const error = summarizeMutation.error;

  const handleSummarize = async () => {
    if (!isEligibleForSummary) return;

    try {
      const result = await summarizeMutation.mutateAsync({
        noteId: note.id,
        options: { summaryType, length }
      });
      setCurrentSummary(result);
    } catch (error) {
      console.error('Summarization failed:', error);
    }
  };

  const getSummaryTypeIcon = (type: 'brief' | 'detailed' | 'bullets') => {
    switch (type) {
      case 'brief':
        return <Zap className="w-4 h-4" />;
      case 'detailed':
        return <AlignLeft className="w-4 h-4" />;
      case 'bullets':
        return <List className="w-4 h-4" />;
    }
  };

  const getSummaryTypeLabel = (type: 'brief' | 'detailed' | 'bullets') => {
    switch (type) {
      case 'brief':
        return 'Brief';
      case 'detailed':
        return 'Detailed';
      case 'bullets':
        return 'Bullet Points';
    }
  };

  const getLengthLabel = (length: 'short' | 'medium' | 'long') => {
    switch (length) {
      case 'short':
        return 'Short';
      case 'medium':
        return 'Medium';
      case 'long':
        return 'Long';
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return <Clock className="w-4 h-4" />;
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <TrendingUp className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  if (!isEligibleForSummary) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <FileText className="w-5 h-5" />
          <span className="text-sm">
            Note is too short for AI summarization (minimum 50 words, current: {wordCount})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">AI Summary</h3>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              {wordCount} words
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-purple-600 hover:text-purple-700 p-1 rounded transition-colors"
              title="Summary settings"
            >
              <FileText className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleSummarize}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isLoading ? 'Generating...' : 'Summarize'}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-3 bg-white border border-purple-200 rounded-lg space-y-3">
            {/* Summary Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Type
              </label>
              <div className="flex gap-2">
                {(['brief', 'detailed', 'bullets'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSummaryType(type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      summaryType === type
                        ? 'bg-purple-100 border-purple-200 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    } border`}
                  >
                    {getSummaryTypeIcon(type)}
                    {getSummaryTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Length
              </label>
              <div className="flex gap-2">
                {(['short', 'medium', 'long'] as const).map((len) => (
                  <button
                    key={len}
                    onClick={() => setLength(len)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      length === len
                        ? 'bg-purple-100 border-purple-200 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    } border`}
                  >
                    {getLengthLabel(len)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Summarization Failed</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {error.message || 'Unable to generate summary. Please try again.'}
            </p>
          </div>
        )}

        {currentSummary ? (
          <div className="space-y-4">
            {/* Summary Content */}
            <div className="prose prose-sm max-w-none">
              <div className="bg-white p-4 rounded-lg border border-purple-100">
                {currentSummary.summaryType === 'bullets' ? (
                  <div 
                    className="space-y-1"
                    dangerouslySetInnerHTML={{ 
                      __html: currentSummary.summary
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line)
                        .map(line => {
                          if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                            return `<div class="flex items-start gap-2"><span class="text-purple-600 mt-1">•</span><span>${line.substring(1).trim()}</span></div>`;
                          }
                          return `<div class="flex items-start gap-2"><span class="text-purple-600 mt-1">•</span><span>${line}</span></div>`;
                        })
                        .join('')
                    }}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {currentSummary.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Summary Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-purple-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {getSummaryTypeIcon(currentSummary.summaryType)}
                  <span>{getSummaryTypeLabel(currentSummary.summaryType)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {currentSummary.wordCount} words 
                    ({Math.round((currentSummary.originalWordCount / currentSummary.wordCount) * 10) / 10}x compression)
                  </span>
                </div>

                {currentSummary.confidence && (
                  <div className={`flex items-center gap-1 ${getConfidenceColor(currentSummary.confidence)}`}>
                    {getConfidenceIcon(currentSummary.confidence)}
                    <span>
                      {Math.round(currentSummary.confidence * 100)}% confidence
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(currentSummary.generatedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">Ready to summarize</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click &ldquo;Summarize&rdquo; to generate an AI-powered summary of this note
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
