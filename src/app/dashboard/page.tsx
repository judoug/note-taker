import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithSync } from '@/lib/auth-helpers';

// Mark this page as dynamic (not statically generated)
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userWithSync = await getCurrentUserWithSync();

  if (!userWithSync) {
    redirect('/sign-in');
  }

  const { clerkUser, dbUser } = userWithSync;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary"></div>
            <span className="text-xl font-bold">AI Note Taker</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              Welcome, {dbUser.name || clerkUser.firstName || dbUser.email}!
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Notes Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Your Notes</h2>
            <p className="text-muted-foreground mb-4">
              Create, organize, and manage your notes with AI-powered features.
            </p>
            <div className="space-y-3">
              <Link
                href="/notes"
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                View All Notes
              </Link>
              <button className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Create New Note
              </button>
            </div>
          </div>

          {/* AI Features */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">AI Features</h2>
            <p className="text-muted-foreground mb-4">
              Enhance your notes with intelligent suggestions and automation.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Smart tagging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Note generation (coming soon)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Summarization (coming soon)</span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <p className="text-muted-foreground mb-4">
              You&apos;re successfully authenticated and synced with the database.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{dbUser.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{dbUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {dbUser.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
