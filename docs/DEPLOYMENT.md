# Deployment Guide

1. Push code to GitHub.
2. Connect repository to Vercel.
3. Configure all environment variables in the Vercel project settings matching `.env.example`.
4. Deploy.

**Important:** Make sure `SUPABASE_SERVICE_ROLE_KEY` is set correctly on Vercel to ensure background tasks (like payment webhooks) work properly.
