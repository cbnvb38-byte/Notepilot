# Deployment Checklist

Before deploying NotePilot to production, ensure that the following requirements are met to guarantee security and functionality.

## 1. Required Environment Variables
The following environment variables must be securely set in your deployment environment (e.g., Vercel dashboard). 

**Never expose private keys with a `NEXT_PUBLIC_` prefix.**

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
- `CLERK_SECRET_KEY`: Clerk secret key (**KEEP SECRET**, server-side only).

### Database (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (safe for public).
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (**KEEP SECRET**, server-side only).

### AI Study Copilot (Gemini)
- `GEMINI_API_KEY`: Google Gemini API key (**KEEP SECRET**, server-side only).
- `GEMINI_MODEL`: Model name (e.g., `gemini-2.5-flash`).
- `GEMINI_FALLBACK_MODEL`: Fallback model name if needed.

## 2. Security Rules
- **Never expose service role key as NEXT_PUBLIC**.
- **Never expose Gemini key as NEXT_PUBLIC**.
- **Never commit `.env.local`** to Git. Keep local secrets local.
- **Add env variables in Vercel dashboard** before the first deployment.

## 3. Build Command
Before deploying, always ensure the app builds successfully locally to catch type errors and broken pages:
```bash
npm run build
```

## 4. Post-Deploy Check
Ensure the Vercel (or preferred hosting) project is set up with the Next.js framework preset, using Node.js 18.x or 20.x. Verify the live site performs basic auth and database connections properly.
