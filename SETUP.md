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
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/notes
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/notes

# Clerk Webhook Secret (for user synchronization)
CLERK_WEBHOOK_SECRET=your_webhook_secret_here

# OpenAI API Key (for AI note generation - Task 8)
# Get this from https://platform.openai.com/api-keys
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

## AI-Powered Note Generation Setup (Task 8):

### 1. Get OpenAI API Key:

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up/Sign in to your OpenAI account
3. Click "Create new secret key"
4. Name it (e.g., "AI Note Taker")
5. Copy the API key (starts with `sk-`)
6. Add it to your `.env.local` file:
   ```
   OPENAI_API_KEY=sk-your_actual_key_here
   ```

### 2. Understanding OpenAI API Costs:

- **GPT-4 Turbo**: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- **Example**: Generating a 200-word note costs ~$0.005-0.01
- **Rate Limits**: 5,000 requests/minute for new accounts
- **Recommendations**: Start with a modest usage limit in OpenAI dashboard

### 3. Test AI Integration:

Once the API key is configured:

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test AI Note Generation:**
   - Sign in to your app at `http://localhost:3000`
   - Navigate to `/notes`
   - Click "New Note" and look for AI generation options
   - Test prompts like "Write a note about daily productivity tips"
   - Verify generated content appears in the note form

3. **Verify API Route:**
   ```bash
   # Test the API endpoint directly (optional)
   curl -X POST http://localhost:3000/api/generate-note \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Write a note about TypeScript benefits"}'
   ```

### 4. Security Notes:

- **Never commit** your `.env.local` file to Git
- **API key is server-side only** - never exposed to the client
- **Consider rate limiting** for production deployment
- **Monitor usage** in OpenAI dashboard to avoid unexpected charges

## Next Steps:

All core functionality complete! Additional enhancements available:
- Task 9: Implement AI Tag Suggestion  
- Task 13: Enforce Security Best Practices
- Task 14: Optimize Performance and Scalability
