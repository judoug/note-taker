# AI Note Taker Setup Instructions

## Environment Variables Setup

To complete the Clerk authentication setup, you need to create a `.env.local` file in the project root with the following variables:

### 1. Create `.env.local` file:

```bash
# In the project root directory, create .env.local with these contents:

# Clerk Authentication Keys
# Get these from https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here

# Clerk URL Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Clerk Webhook Secret (for user synchronization)
CLERK_WEBHOOK_SECRET=your_webhook_secret_here

# OpenAI API Key (for later tasks)
OPENAI_API_KEY=your_openai_api_key_here

# Database URL (NeonDB PostgreSQL)
# Get this from https://console.neon.tech/
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### 2. Get Clerk Keys:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select existing one
3. Go to "API Keys" section
4. Copy the "Publishable key" and "Secret key"
5. Replace the placeholder values in your `.env.local` file

### 3. Configure OAuth Providers (Optional):

In the Clerk Dashboard:
1. Go to "User & Authentication" → "Social Connections"
2. Enable Google and/or GitHub OAuth
3. Configure with your OAuth app credentials

## Testing Authentication:

Once `.env.local` is created with proper Clerk keys:

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Authentication Flow:**
   - Visit `http://localhost:3000` - Should show landing page with Sign Up/Sign In buttons
   - Click "Sign Up" - Should redirect to `/sign-up` with Clerk registration form
   - Create account with email/Google/GitHub
   - After sign-up, should redirect to `/dashboard` (protected route)
   - Verify user info displays and UserButton works for sign-out
   - Test sign-in flow at `/sign-in`
   - Verify middleware protection: try accessing `/dashboard` without authentication

3. **Build Test:**
   ```bash
   npm run build
   ```
   Will fail during static generation until environment variables are set, but this confirms the authentication integration is complete.

## Database Setup (Task 3):

### 1. Create NeonDB Instance:

1. Go to [NeonDB Console](https://console.neon.tech/)
2. Sign up/Sign in and create a new project
3. Name your project (e.g., "AI Note Taker")
4. Copy the PostgreSQL connection string
5. Add it to your `.env.local` file as `DATABASE_URL`

### 2. Run Database Migrations:

Once `DATABASE_URL` is configured:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Optional: View your database
npx prisma studio
```

## User Synchronization Setup (Task 4):

### 1. Set Up Clerk Webhooks:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) → Your Application
2. Navigate to "Webhooks" in the sidebar
3. Click "Add Endpoint"
4. Set Endpoint URL to: `https://your-domain.com/api/clerk-webhook`
   - For local development: `https://your-ngrok-url.ngrok.io/api/clerk-webhook`
5. Select these events:
   - `user.created` - When users sign up
   - `user.updated` - When user profiles change
   - `user.deleted` - When users are deleted
6. Copy the "Webhook Secret" and add it to your `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### 2. Local Development with ngrok:

For testing webhooks locally:

```bash
# Install ngrok (if not already installed)
npm install -g ngrok

# In a separate terminal, expose your local server
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Use this URL + /api/clerk-webhook in Clerk dashboard
```

### 3. Test User Synchronization:

1. Start your development server: `npm run dev`
2. Sign up with a new account
3. Check your database (Prisma Studio: `npx prisma studio`)
4. Verify the user appears in the `users` table
5. Update your profile in Clerk and verify changes sync to database

## Next Steps:

User synchronization complete! The next tasks will be:
- Task 5: Implement Landing Page
- Task 6: Design Notes Library UI
- Task 7: Implement Note CRUD Operations
