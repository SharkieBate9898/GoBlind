-- Initial Schema for Blind
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Types
CREATE TYPE access_status_type AS ENUM ('waitlisted', 'approved', 'rejected');
CREATE TYPE admin_role_type AS ENUM ('super_admin', 'admin');

-- 1. Users & Admin
CREATE TABLE public.admin_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL, -- Will reference auth.users in Supabase
    email TEXT NOT NULL,
    role admin_role_type DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY, -- References auth.users
    email TEXT,
    phone TEXT,
    date_of_birth DATE NOT NULL,
    access_status access_status_type DEFAULT 'waitlisted',
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.admin_roles(id),
    waitlist_position SERIAL,
    launch_city TEXT,
    invite_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles & Preferences
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    first_name TEXT,
    gender_identity TEXT,
    bio TEXT,
    interests TEXT[],
    hobbies TEXT[],
    top_values TEXT[], -- max 3
    relationship_intentions TEXT,
    non_negotiables TEXT,
    completed_profile BOOLEAN DEFAULT false,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 99,
    distance_max_miles INTEGER DEFAULT 50,
    gender_preference TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Prompts & Values Questionnaires
CREATE TABLE public.prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    category TEXT,
    options TEXT[] -- if it's multiple choice
);

CREATE TABLE public.prompt_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    answer_text TEXT,
    importance_level TEXT, -- 'Not important', 'Somewhat important', 'Important', 'Very important'
    acceptable_partner_answers TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

-- 4. Interactions (Likes, Passes, Matches)
CREATE TABLE public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    like_comment TEXT NOT NULL, -- Mandatory >= 5 chars
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE public.passes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_one_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_two_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    alignment_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_one_id, user_two_id)
);

CREATE TABLE public.daily_like_usage (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE,
    likes_used INTEGER DEFAULT 0,
    PRIMARY KEY(user_id, usage_date)
);

-- 5. Chat & Messaging
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.first_voice_recordings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, sender_id)
);

-- 6. Safety & Monetization
CREATE TABLE public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reported_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.blocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    blocker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'premium',
    status TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.boosts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_status ON public.users(access_status);
CREATE INDEX idx_users_city ON public.users(launch_city);
CREATE INDEX idx_profiles_location ON public.profiles(latitude, longitude);
CREATE INDEX idx_matches_users ON public.matches(user_one_id, user_two_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
