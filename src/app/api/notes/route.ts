import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, createNote, getUserNotes } from '@/lib/db';
import { performance as perfMonitor } from '@/lib/performance';
import type { CreateNoteData } from '@/types';

// GET /api/notes - List user's notes
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const user = await currentUser();
    
    if (!user) {
      perfMonitor.trackAPI('/api/notes', performance.now() - startTime, false);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search params for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const tagSource = searchParams.get('tagSource') as 'AI' | 'MANUAL' | 'ALL' || 'ALL';
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
    const sortBy = searchParams.get('sortBy') as 'updated' | 'created' | 'title' || 'updated';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user from database
    const dbUser = await getUserByClerkId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get notes with optional filtering
    const dbStartTime = performance.now();
    const notes = await getUserNotes(dbUser.id, {
      search,
      tags,
      tagSource,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      limit,
      offset,
    });
    
    // Track database and API performance
    perfMonitor.trackDB('getUserNotes', performance.now() - dbStartTime, notes.length);
    perfMonitor.trackAPI('/api/notes GET', performance.now() - startTime, true);

    return NextResponse.json({
      success: true,
      data: notes,
      count: notes.length,
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const user = await currentUser();
    
    if (!user) {
      perfMonitor.trackAPI('/api/notes POST', performance.now() - startTime, false);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, tags = [] }: CreateNoteData = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await getUserByClerkId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create note
    const dbStartTime = performance.now();
    const note = await createNote(dbUser.id, {
      title: title.trim(),
      content: content.trim(),
      tags,
    });
    
    // Track database and API performance
    perfMonitor.trackDB('createNote', performance.now() - dbStartTime, 1);
    perfMonitor.trackAPI('/api/notes POST', performance.now() - startTime, true);

    return NextResponse.json({
      success: true,
      data: note,
      message: 'Note created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating note:', error);
    perfMonitor.trackAPI('/api/notes POST', performance.now() - startTime, false);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
