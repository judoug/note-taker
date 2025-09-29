'use client';

import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  Calendar, 
  Tag, 
  SortAsc, 
  SortDesc, 
  X, 
  ChevronDown,
  Brain,
  User,
  Sparkles,
  Clock,
  FileText
} from 'lucide-react';
import type { NotesFilterState, FilterOption } from '@/types';

interface AdvancedFiltersProps {
  filters: NotesFilterState;
  onFiltersChange: (filters: NotesFilterState) => void;
  availableTags: FilterOption[];
  isLoading?: boolean;
  totalCount?: number;
  className?: string;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableTags,
  isLoading = false,
  totalCount,
  className = ""
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.selectedTags.length > 0 || 
    filters.tagSource !== 'ALL' || 
    filters.dateRange.from || 
    filters.dateRange.to;

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      selectedTags: [],
      tagSource: 'ALL',
      dateRange: {},
      sortBy: 'updated',
      sortOrder: 'desc'
    });
  };

  const toggleTag = (tagName: string) => {
    const newTags = filters.selectedTags.includes(tagName)
      ? filters.selectedTags.filter(t => t !== tagName)
      : [...filters.selectedTags, tagName];
    
    onFiltersChange({
      ...filters,
      selectedTags: newTags
    });
  };

  const updateDateRange = (type: 'from' | 'to', date: string) => {
    const newDateRange = { ...filters.dateRange };
    if (date) {
      newDateRange[type] = new Date(date);
    } else {
      delete newDateRange[type];
    }
    
    onFiltersChange({
      ...filters,
      dateRange: newDateRange
    });
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const getSortIcon = () => {
    return filters.sortOrder === 'asc' ? (
      <SortAsc className="w-4 h-4" />
    ) : (
      <SortDesc className="w-4 h-4" />
    );
  };

  const tagSourceOptions = [
    { value: 'ALL', label: 'All Tags', icon: <Tag className="w-4 h-4" /> },
    { value: 'AI', label: 'AI Generated', icon: <Brain className="w-4 h-4 text-purple-600" /> },
    { value: 'MANUAL', label: 'Manual Tags', icon: <User className="w-4 h-4 text-blue-600" /> }
  ];

  const sortOptions = [
    { value: 'updated', label: 'Last Updated', icon: <Clock className="w-4 h-4" /> },
    { value: 'created', label: 'Date Created', icon: <Calendar className="w-4 h-4" /> },
    { value: 'title', label: 'Title', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header with search and toggle */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              hasActiveFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {[
                  filters.selectedTags.length > 0 && `${filters.selectedTags.length} tags`,
                  filters.tagSource !== 'ALL' && 'source',
                  filters.dateRange.from && 'date'
                ].filter(Boolean).length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Results Count */}
          {totalCount !== undefined && (
            <div className="text-sm text-gray-500">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <span>{totalCount} {totalCount === 1 ? 'note' : 'notes'}</span>
              )}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-600">Active filters applied</span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Tag Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Source
            </label>
            <div className="flex gap-2">
              {tagSourceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFiltersChange({ 
                    ...filters, 
                    tagSource: option.value as 'AI' | 'MANUAL' | 'ALL' 
                  })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                    filters.tagSource === option.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Available Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                      filters.selectedTags.includes(tag.value)
                        ? 'bg-blue-100 border-blue-200 text-blue-800'
                        : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                    } border`}
                  >
                    <Tag className="w-3 h-3" />
                    {tag.label}
                    {tag.count && (
                      <span className="text-xs opacity-75">({tag.count})</span>
                    )}
                    {filters.selectedTags.includes(tag.value) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={formatDateForInput(filters.dateRange.from)}
                  onChange={(e) => updateDateRange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={formatDateForInput(filters.dateRange.to)}
                  onChange={(e) => updateDateRange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFiltersChange({ 
                    ...filters, 
                    sortBy: option.value as 'updated' | 'created' | 'title' 
                  })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                    filters.sortBy === option.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
              
              {/* Sort Direction */}
              <button
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-all"
                title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {getSortIcon()}
                {filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
