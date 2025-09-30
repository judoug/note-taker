import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function TestAuthPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Authentication Test</h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">User ID:</span>
            <span className="text-sm text-gray-900">{user.id}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Email:</span>
            <span className="text-sm text-gray-900">{user.emailAddresses[0]?.emailAddress}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Name:</span>
            <span className="text-sm text-gray-900">
              {user.firstName} {user.lastName}
            </span>
          </div>
          
          <div className="flex items-center justify-center pt-4">
            <UserButton afterSignOutUrl="/" />
          </div>
          
          <div className="text-center pt-4">
            <a 
              href="/notes" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Go to Notes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
