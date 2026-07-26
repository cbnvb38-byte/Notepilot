# Deployment Checklist

Before deploying the College Notes application to production, ensure that the following requirements are met.

## 1. Required Environment Variables
The following environment variables must be securely set in your deployment environment (e.g., Vercel, Netlify):

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (safe for public).
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (**KEEP SECRET**, server-side only).

### Clerk (Authentication)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
- `CLERK_SECRET_KEY`: Clerk secret key (**KEEP SECRET**, server-side only).
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`=/sign-in
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`=/sign-up
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`=/dashboard
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`=/dashboard
- `CLERK_WEBHOOK_SECRET`: Secret for Clerk webhook verification (syncing users to Supabase).

### Gemini (AI Study Copilot)
- `GEMINI_API_KEY`: Google Gemini API key (**KEEP SECRET**, server-side only).

### Payment / Admin (Optional/If configured)
- Any Razorpay/Stripe keys if applicable.

## 2. Supabase Setup Reminders
- Ensure the Supabase database schema is up-to-date with all migrations (including `multi_pdf_types.sql` etc).
- Verify Row Level Security (RLS) policies are active on the `notes`, `profiles`, and `ai_generations` tables.
- Ensure the storage bucket (`notes`) is configured to allow authenticated uploads.

## 3. Clerk Setup Reminders
- Verify the Clerk webhook URL is correctly pointing to your production domain (e.g., `https://yourdomain.com/api/webhooks/clerk`).
- Ensure the webhook is listening for `user.created` and `user.updated` events to sync profiles into Supabase.

## 4. Build Command
The application uses Next.js. The standard build command is:
```bash
npm run build
```
And the install command is:
```bash
npm install
```

## 5. Vercel Deployment Notes
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x or 20.x
- **Environment Variables**: Add all the variables from Section 1 into the Vercel project settings *before* the first deployment.

## 6. Post-Deploy Checks
Once deployed, perform the following smoke tests on the live URL:
1. Try signing up a new test user (verifies Clerk).
2. Check if the test user appears in the Supabase `profiles` table (verifies Webhook + Supabase Service Key).
3. Upload a test PDF note (verifies Supabase Storage).
4. Run a Study Copilot generation on the note (verifies Gemini API).
