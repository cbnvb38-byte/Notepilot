# Architecture

NotePilot follows a modern Next.js App Router architecture.

- **Frontend:** React server and client components styled with Tailwind.
- **Auth:** Clerk handles user sessions and JWT issuance.
- **Database:** Supabase PostgreSQL with RLS. Supabase service role is strictly used in backend API routes.
- **AI Integration:** Next.js API routes securely call the Gemini API.
- **Payments:** Razorpay handles transactions; webhooks sync status to Supabase via service role.
