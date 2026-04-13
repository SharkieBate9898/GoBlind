-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_like_usage ENABLE ROW LEVEL SECURITY;

-- 1. Users can read their own user record, admins can read all
CREATE POLICY "Users can read own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
    FOR SELECT USING (public.is_super_admin(auth.uid()) OR EXISTS(SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own record partially" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Profiles and Preferences: Users can edit their own, anyone approved can view profiles
CREATE POLICY "Users can manage own preferences" ON public.preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can edit own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Approved users can read profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND access_status = 'approved')
    );

-- 3. Prompts: Anyone can read prompts. Answers can be read if match or own
CREATE POLICY "Anyone can read prompts" ON public.prompts FOR SELECT USING (true);

CREATE POLICY "Users can manage own answers" ON public.prompt_answers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Approved users can read answers" ON public.prompt_answers
    FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND access_status = 'approved')
    );

-- 4. Interactions: Users can insert their own likes/passes.
CREATE POLICY "Users insert own likes" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can see likes received" ON public.likes
    FOR SELECT USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "System matches" ON public.matches
    FOR SELECT USING (auth.uid() = user_one_id OR auth.uid() = user_two_id);

-- 5. Messaging: Users can read/write to conversations they are part of
CREATE POLICY "Users read own conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.matches 
               WHERE matches.id = conversations.match_id 
               AND (matches.user_one_id = auth.uid() OR matches.user_two_id = auth.uid()))
    );

CREATE POLICY "Users read/write messages in their conversations" ON public.messages
    FOR ALL USING (
        EXISTS(SELECT 1 FROM public.conversations c JOIN public.matches m ON c.match_id = m.id 
               WHERE c.id = messages.conversation_id 
               AND (m.user_one_id = auth.uid() OR m.user_two_id = auth.uid()))
    );

-- 6. Admin Roles (Only super admins can view/manage)
CREATE POLICY "Super admin manage roles" ON public.admin_roles
    FOR ALL USING (public.is_super_admin(auth.uid()));
