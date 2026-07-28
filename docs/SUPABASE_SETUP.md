# Supabase Setup

1. Create a new Supabase project.
2. Execute the migrations located in `supabase/migrations/` sequentially.
3. The migrations will create necessary tables (e.g., `profiles`, `payment_events`) and apply Row Level Security (RLS).
4. Get your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard and add them to your environment variables.
