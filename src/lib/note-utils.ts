// Utility functions for working with notes

// Generate a preview snippet from note content
export function generatePreview(content: string, maxLength: number = 150): string {
  if (!content) return '';
  
  // Remove markdown formatting for cleaner preview
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  // Truncate at word boundary
  const truncated = cleanContent.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// Format date for display
export function formatDate(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24);
    return `${days} days ago`;
  } else {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Get tag color based on source and name
export function getTagColor(tagName: string, source: 'AI' | 'MANUAL'): string {
  if (source === 'AI') {
    // AI tags use purple/indigo colors
    const colors = [
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-violet-100 text-violet-800'
    ];
    const hash = tagName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  } else {
    // Manual tags use blue/green/amber colors
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-amber-100 text-amber-800',
      'bg-cyan-100 text-cyan-800',
      'bg-emerald-100 text-emerald-800',
      'bg-orange-100 text-orange-800'
    ];
    const hash = tagName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}

// Filter notes based on search and filter criteria
export function filterNotes<T extends {
  title: string;
  content: string;
  tags: Array<{ name: string; source: string }>;
  createdAt: Date | string;
}>(
  notes: T[],
  filters: {
    search?: string;
    tags?: string[];
    source?: 'all' | 'manual' | 'ai';
    dateRange?: { start: Date; end: Date };
  }
): T[] {
  return notes.filter(note => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTitle = note.title.toLowerCase().includes(searchTerm);
      const matchesContent = note.content.toLowerCase().includes(searchTerm);
      const matchesTags = note.tags.some(tag => 
        tag.name.toLowerCase().includes(searchTerm)
      );
      
      if (!matchesTitle && !matchesContent && !matchesTags) {
        return false;
      }
    }
    
    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const noteTags = note.tags.map(tag => tag.name);
      const hasMatchingTag = filters.tags.some(filterTag => 
        noteTags.includes(filterTag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    // Source filter
    if (filters.source && filters.source !== 'all') {
      const sourceFilter = filters.source.toUpperCase();
      const hasMatchingSource = note.tags.some(tag => 
        tag.source === sourceFilter
      );
      if (!hasMatchingSource) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange) {
      const noteDate = new Date(note.createdAt);
      if (noteDate < filters.dateRange.start || noteDate > filters.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
}

// Get word count from content
export function getWordCount(content: string): number {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Estimate reading time (average 200 words per minute)
export function getReadingTime(content: string): string {
  const wordCount = getWordCount(content);
  const minutes = Math.ceil(wordCount / 200);
  
  if (minutes < 1) return 'Less than 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}
