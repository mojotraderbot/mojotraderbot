-- Create table for deployed tokens
CREATE TABLE public.deployed_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  mint_address TEXT NOT NULL UNIQUE,
  pump_url TEXT NOT NULL,
  creator_wallet TEXT NOT NULL,
  dev_buy_amount_sol DECIMAL(18, 9),
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deployed_tokens ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read deployed tokens (public showcase)
CREATE POLICY "Anyone can view deployed tokens"
  ON public.deployed_tokens
  FOR SELECT
  USING (true);

-- Allow anyone to insert (since we don't have auth, wallet address is stored)
CREATE POLICY "Anyone can insert deployed tokens"
  ON public.deployed_tokens
  FOR INSERT
  WITH CHECK (true);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.deployed_tokens;