import type { 
  CreateNoteData, 
  UpdateNoteData, 
  NoteWithTags, 
  ApiResponse, 
  GenerateNoteRequest, 
  GenerateNoteResponse,
  SuggestTagsRequest,
  SuggestTagsResponse
} from '@/types';

// Base API configuration
const API_BASE = '/api';

// Generic API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Parse response JSON
    const data = await response.json();
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw new ApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }
    
    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors, etc.
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}

// Notes API functions
export const notesApi = {
  // Get all notes for the current user
  async getAll(params?: {
    search?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<NoteWithTags[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const query = searchParams.toString();
    const endpoint = query ? `/notes?${query}` : '/notes';
    
    return apiRequest<ApiResponse<NoteWithTags[]>>(endpoint, {
      method: 'GET',
    });
  },

  // Get a specific note by ID
  async getById(id: string): Promise<ApiResponse<NoteWithTags>> {
    return apiRequest<ApiResponse<NoteWithTags>>(`/notes/${id}`, {
      method: 'GET',
    });
  },

  // Create a new note
  async create(data: CreateNoteData): Promise<ApiResponse<NoteWithTags>> {
    return apiRequest<ApiResponse<NoteWithTags>>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update an existing note
  async update(id: string, data: UpdateNoteData): Promise<ApiResponse<NoteWithTags>> {
    return apiRequest<ApiResponse<NoteWithTags>>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a note
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

// AI Generation API
export const aiApi = {
  // Generate a note using AI
  async generateNote(data: GenerateNoteRequest): Promise<GenerateNoteResponse> {
    return apiRequest<GenerateNoteResponse>('/generate-note', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Suggest tags for a note using AI
  async suggestTags(data: SuggestTagsRequest): Promise<SuggestTagsResponse> {
    return apiRequest<SuggestTagsResponse>('/tags/suggest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Export individual functions for convenience
export const {
  getAll: getAllNotes,
  getById: getNoteById,
  create: createNote,
  update: updateNote,
  delete: deleteNote,
} = notesApi;

export const { generateNote, suggestTags } = aiApi;
