import { currentUser } from '@clerk/nextjs/server';
import { syncUserWithDatabase, type UserSyncData } from '@/lib/user-sync';
import type { User } from '@prisma/client';

// Transform Clerk currentUser to our sync format
function transformCurrentUser(clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>): UserSyncData {
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
  
  if (!primaryEmail) {
    throw new Error('User must have a primary email address');
  }

  let name: string | undefined;
  if (clerkUser.firstName || clerkUser.lastName) {
    name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined;
  } else if (clerkUser.username) {
    name = clerkUser.username;
  }

  return {
    clerkId: clerkUser.id,
    email: primaryEmail,
    name,
    avatar: clerkUser.imageUrl,
  };
}

// Get current user and ensure they exist in database
export async function getCurrentUserWithSync(): Promise<{
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
  dbUser: User;
} | null> {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    // Transform and sync user data
    const userData = transformCurrentUser(clerkUser);
    const dbUser = await syncUserWithDatabase(userData);
    
    return {
      clerkUser,
      dbUser,
    };
  } catch (error) {
    console.error('Failed to get current user with sync:', error);
    throw new Error('Authentication and database sync failed');
  }
}

// Check if user is authenticated and synced (for API routes)
export async function requireAuth(): Promise<{
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
  dbUser: User;
}> {
  const userWithSync = await getCurrentUserWithSync();
  
  if (!userWithSync) {
    throw new Error('User not authenticated');
  }
  
  return userWithSync;
}

// Get user ID for database operations
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const userWithSync = await getCurrentUserWithSync();
    return userWithSync?.dbUser.id || null;
  } catch (error) {
    console.error('Failed to get current user ID:', error);
    return null;
  }
}
