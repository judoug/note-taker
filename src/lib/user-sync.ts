import { prisma } from './prisma';
import type { User } from '@prisma/client';

// Types for Clerk user data
export interface ClerkUserData {
  id: string;  // Clerk user ID
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  username?: string;
}

// Simplified user data for internal operations
export interface UserSyncData {
  clerkId: string;
  email: string;
  name?: string;
  avatar?: string;
}

// Transform Clerk user data to our format
export function transformClerkUser(clerkUser: ClerkUserData): UserSyncData {
  const primaryEmail = clerkUser.email_addresses[0]?.email_address;
  
  if (!primaryEmail) {
    throw new Error('User must have a primary email address');
  }

  // Combine first and last name, fallback to username
  let name: string | undefined;
  if (clerkUser.first_name || clerkUser.last_name) {
    name = [clerkUser.first_name, clerkUser.last_name]
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
    avatar: clerkUser.image_url,
  };
}

// Core user sync function - upserts user data
export async function syncUserWithDatabase(userData: UserSyncData): Promise<User> {
  try {
    const user = await prisma.user.upsert({
      where: { clerkId: userData.clerkId },
      update: {
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
      },
      create: {
        clerkId: userData.clerkId,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
      },
    });

    console.log(`User synced successfully: ${userData.email} (${userData.clerkId})`);
    return user;
  } catch (error) {
    console.error('Failed to sync user with database:', error);
    throw new Error(`User sync failed for ${userData.email}: ${error}`);
  }
}

// Convenience function for syncing Clerk user directly
export async function syncClerkUser(clerkUser: ClerkUserData): Promise<User> {
  const userData = transformClerkUser(clerkUser);
  return syncUserWithDatabase(userData);
}

// Get user by Clerk ID with error handling
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { clerkId },
    });
  } catch (error) {
    console.error(`Failed to get user by Clerk ID ${clerkId}:`, error);
    return null;
  }
}

// Ensure user exists in database (for middleware/auth checks)
export async function ensureUserInDatabase(clerkUser: ClerkUserData): Promise<User> {
  // First try to get existing user
  const existingUser = await getUserByClerkId(clerkUser.id);
  
  if (existingUser) {
    // User exists, optionally update if data has changed
    const userData = transformClerkUser(clerkUser);
    
    // Check if update is needed
    const needsUpdate = 
      existingUser.email !== userData.email ||
      existingUser.name !== userData.name ||
      existingUser.avatar !== userData.avatar;
    
    if (needsUpdate) {
      console.log(`Updating user data for ${userData.email}`);
      return syncUserWithDatabase(userData);
    }
    
    return existingUser;
  }
  
  // User doesn't exist, create them
  return syncClerkUser(clerkUser);
}
