-- Description: Creates the payment_events table for Razorpay integration

CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    provider TEXT DEFAULT 'razorpay',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT UNIQUE,
    amount INTEGER,
    currency TEXT DEFAULT 'INR',
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own payment records (optional, but usually backend service role does this)
-- We will only allow the service_role to insert/update, and users to read their own
CREATE POLICY "Users can view their own payment events" 
ON public.payment_events 
FOR SELECT 
USING (auth.uid()::text = user_id);

-- Service role bypasses RLS, so it can insert/update safely.
