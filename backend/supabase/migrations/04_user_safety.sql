-- Add last_active_at for 30-day inactivity filter
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add is_paused for Profile Pausing (Ghost Mode)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false;

-- Create index for faster querying during discovery feed loads
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_paused ON public.profiles(is_paused);
