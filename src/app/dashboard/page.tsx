import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to AI Note Taker
          </h1>
          <p className="text-muted-foreground mt-2">
            Hello, {user.firstName || user.emailAddresses[0]?.emailAddress}!
          </p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <main>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Your Notes Dashboard</h2>
          <p className="text-muted-foreground">
            This is a protected route. You can only see this because you&apos;re authenticated!
          </p>
          <p className="text-muted-foreground mt-2">
            <strong>Next steps:</strong> We&apos;ll build the notes library, AI features, and more in upcoming tasks.
          </p>
        </div>
      </main>
    </div>
  );
}
