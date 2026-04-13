-- 07_waitlist.sql
-- Separate table for the standalone web Waitlist Landing Page

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  email text NOT NULL,
  location text,
  interest text,
  source text DEFAULT 'landing_page',
  status text NOT NULL DEFAULT 'waitlist',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure lowercase emails are unique to prevent duplicate signups
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_unique_idx
  ON public.waitlist (lower(email));

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public (anon and authenticated) to insert into the waitlist
DROP POLICY IF EXISTS "Allow public insert to waitlist" ON public.waitlist;
CREATE POLICY "Allow public insert to waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No SELECT policy is provided, meaning the public CANNOT read the list!
