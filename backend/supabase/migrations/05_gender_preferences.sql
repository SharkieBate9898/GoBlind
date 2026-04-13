-- Migration to add Gender and Looking For fields

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for TEXT;

-- We could enforce constraints or enums, but keeping flexbile for now or adding comment:
-- gender: 'Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'
-- looking_for: 'Man', 'Woman', 'Both'
