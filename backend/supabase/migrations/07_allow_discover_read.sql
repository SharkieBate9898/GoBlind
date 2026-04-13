-- 07_allow_discover_read.sql

-- 1. Create a secure function to check if the current user is approved
-- We use SECURITY DEFINER so this check can bypass RLS cleanly without causing an infinite recursive loop
CREATE OR REPLACE FUNCTION public.is_approved_user(checking_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    status public.access_status_type;
BEGIN
    SELECT access_status INTO status FROM public.users WHERE id = checking_user_id;
    RETURN status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the policy if it exists (for safe re-running)
DROP POLICY IF EXISTS "Approved users can read all users" ON public.users;

-- 3. Add the secure policy to public.users
CREATE POLICY "Approved users can read all users" ON public.users
    FOR SELECT USING (public.is_approved_user(auth.uid()));
