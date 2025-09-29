import Link from "next/link";
import { currentUser } from '@clerk/nextjs/server';

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary"></div>
            <span className="text-xl font-bold">AI Note Taker</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            AI-Powered
            <span className="block text-primary">Note Taking</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Create, organize, and manage your notes efficiently with AI-powered features. 
            Generate notes from prompts, get smart tag suggestions, and find your information instantly.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Get Started
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-md bg-primary/10 p-3">
              <div className="h-6 w-6 rounded bg-primary"></div>
            </div>
            <h3 className="mt-4 text-lg font-semibold">AI Note Generation</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate comprehensive notes from simple prompts using advanced AI
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-md bg-primary/10 p-3">
              <div className="h-6 w-6 rounded bg-primary"></div>
            </div>
            <h3 className="mt-4 text-lg font-semibold">Smart Tagging</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Automatically categorize and tag your notes for easy organization
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-md bg-primary/10 p-3">
              <div className="h-6 w-6 rounded bg-primary"></div>
            </div>
            <h3 className="mt-4 text-lg font-semibold">Advanced Search</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Find your notes instantly with powerful search and filtering
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
