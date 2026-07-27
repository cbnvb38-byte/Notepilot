# Vercel Deployment Guide

Follow this guide to deploy NotePilot to Vercel and set up all third-party integrations (Clerk, Supabase, Gemini).

## 1. Connect GitHub to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import the `college-notes` GitHub repository.

## 2. Vercel Build Settings
Ensure the following settings are automatically detected. If not, configure them:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `Next.js default`
- **Node.js Version**: 18.x or 20.x

## 3. Environment Variables
You **must** add the following environment variables in the Vercel dashboard *before* deploying. Do not upload your `.env.local` file.

| Variable | Required | Public? | Notes |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | **Public** | From Clerk Dashboard. |
| `CLERK_SECRET_KEY` | Yes | **Private** | From Clerk Dashboard. Never use `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | **Public** | From Supabase Project Settings. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | **Public** | From Supabase Project Settings (anon/public). |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Private** | From Supabase Project Settings (service_role). Never use `NEXT_PUBLIC_`. |
| `GEMINI_API_KEY` | Yes | **Private** | Google Gemini API Key. Never use `NEXT_PUBLIC_`. |
| `GEMINI_MODEL` | Yes | **Private** | e.g. `gemini-2.5-flash` |
| `GEMINI_FALLBACK_MODEL` | Yes | **Private** | e.g. `gemini-2.5-pro` (Optional, for document reading) |

*After adding these variables, trigger a redeployment in Vercel if the initial build failed.*

## 4. Clerk Production Setup Checklist
- [ ] In the Clerk Dashboard, navigate to **Domains** and add your production Vercel domain.
- [ ] Configure the allowed Redirect URLs to include your production domain (e.g., `https://your-app.vercel.app/dashboard`).
- [ ] Verify you are using Production API keys (`pk_live_...` and `sk_live_...`).
- [ ] Configure your Clerk Webhook URL to point to `https://your-app.vercel.app/api/webhooks/clerk`.
- [ ] Test the login/signup flow on the deployed site.

## 5. Supabase Production Setup Checklist
- [ ] Confirm your Supabase `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is safely isolated in Vercel.
- [ ] Ensure the storage bucket `notes` is created and set to public if required (or private if handling downloads server-side).
- [ ] Confirm all database migrations have been run (tables: `notes`, `profiles`, `ai_generations`, `ai_usage`).
- [ ] Ensure Row Level Security (RLS) is active.
- [ ] Ensure `profiles.id` uses `text` (matching Clerk's user ID).
- [ ] Ensure users cannot edit `plan`, `premium_status`, or `is_admin` from the client. Set these manually in the Supabase Table Editor if needed.

## 6. Gemini API Setup Checklist
- [ ] Confirm `GEMINI_API_KEY` is securely set in Vercel.
- [ ] Verify no `NEXT_PUBLIC_GEMINI` key exists anywhere.
- [ ] If prioritizing speed and cost:
  - `GEMINI_MODEL=gemini-2.5-flash`
- [ ] Check billing and quota limits on your Google Cloud project. (The app will gracefully show a quota warning to users if limits are hit).

## 7. Rollback Strategy
If a production deployment breaks the live site:
1. Navigate to the **Deployments** tab in the Vercel dashboard.
2. Find the previous stable deployment.
3. Click the dots menu and select **Promote to Production** (or **Rollback**).
4. Do not panic-edit code in Vercel or production.
5. Reproduce the bug locally, fix it, verify with `npm run build`, and push the fix to GitHub to deploy again.
