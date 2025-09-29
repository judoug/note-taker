import { prisma } from './prisma';
import type { User, Tag, TagSource } from '@prisma/client';
import type { CreateNoteData, UpdateNoteData, NoteWithTags } from '@/types';

// User operations
export async function createOrUpdateUser(userData: {
  clerkId: string;
  email: string;
  name?: string;
  avatar?: string;
}): Promise<User> {
  return prisma.user.upsert({
    where: { clerkId: userData.clerkId },
    update: {
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
    },
    create: userData,
  });
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { clerkId },
  });
}

export async function getUserWithNotes(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      notes: {
        include: {
          tags: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  });
}

// Note operations
export async function createNote(
  userId: string, 
  noteData: CreateNoteData
): Promise<NoteWithTags> {
  const { title, content, tags = [] } = noteData;

  return prisma.note.create({
    data: {
      title,
      content,
      userId,
      tags: {
        connectOrCreate: tags.map(tagName => ({
          where: { name: tagName },
          create: { name: tagName, source: 'MANUAL' as TagSource },
        })),
      },
    },
    include: {
      tags: true,
    },
  });
}

export async function updateNote(
  noteId: string,
  userId: string,
  noteData: UpdateNoteData
): Promise<NoteWithTags | null> {
  try {
    const { title, content, tags } = noteData;

    // If tags are provided, we need to update the tag relations
    const updateData: {
      title?: string;
      content?: string;
      tags?: {
        set: never[];
        connectOrCreate: Array<{
          where: { name: string };
          create: { name: string; source: TagSource };
        }>;
      };
    } = {};
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    
    if (tags !== undefined) {
      updateData.tags = {
        set: [], // Clear existing tags
        connectOrCreate: tags.map(tagName => ({
          where: { name: tagName },
          create: { name: tagName, source: 'MANUAL' as TagSource },
        })),
      };
    }

    return await prisma.note.update({
      where: { 
        id: noteId,
        userId, // Ensure user owns the note
      },
      data: updateData,
      include: {
        tags: true,
      },
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return null;
  }
}

export async function deleteNote(noteId: string, userId: string): Promise<boolean> {
  try {
    await prisma.note.delete({
      where: { 
        id: noteId,
        userId, // Ensure user owns the note
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
}

export async function getUserNotes(
  userId: string,
  options: {
    search?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}
): Promise<NoteWithTags[]> {
  const { search, tags, limit = 50, offset = 0 } = options;

  // Build where clause
  const where: {
    userId: string;
    OR?: Array<{
      title?: { contains: string; mode: 'insensitive' };
      content?: { contains: string; mode: 'insensitive' };
      tags?: { some: { name: { contains: string; mode: 'insensitive' } } };
    }>;
    tags?: { some: { name: { in: string[] } } };
  } = { userId };

  // Add search filter
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      {
        tags: {
          some: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      }
    ];
  }

  // Add tag filter
  if (tags && tags.length > 0) {
    where.tags = {
      some: {
        name: { in: tags }
      }
    };
  }

  return prisma.note.findMany({
    where,
    include: {
      tags: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

export async function getNote(noteId: string, userId: string) {
  return prisma.note.findFirst({
    where: {
      id: noteId,
      userId, // Ensure user owns the note
    },
    include: {
      tags: true,
    },
  });
}

// Tag operations
export async function createTag(name: string, source: TagSource = 'MANUAL'): Promise<Tag> {
  return prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name, source },
  });
}

export async function getAllTags(): Promise<Tag[]> {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getTagsForNote(noteId: string): Promise<Tag[]> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { tags: true },
  });
  
  return note?.tags || [];
}

// Create multiple AI-suggested tags
export async function createAITags(tagNames: string[]): Promise<Tag[]> {
  const tags: Tag[] = [];
  
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, source: 'AI' },
    });
    tags.push(tag);
  }
  
  return tags;
}

// Get tags by source (AI or MANUAL)
export async function getTagsBySource(source: TagSource): Promise<Tag[]> {
  return prisma.tag.findMany({
    where: { source },
    orderBy: { name: 'asc' },
  });
}

// Search operations
export async function searchNotes(userId: string, query: string) {
  return prisma.note.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    },
    include: {
      tags: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}
