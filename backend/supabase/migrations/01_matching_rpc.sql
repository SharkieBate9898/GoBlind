-- RPCs for Matching and Calculations

-- Function to check if a user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    role_type admin_role_type;
BEGIN
    SELECT role INTO role_type FROM public.admin_roles WHERE admin_roles.user_id = $1 LIMIT 1;
    RETURN role_type = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate age from DOB
CREATE OR REPLACE FUNCTION calculate_age(dob DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN date_part('year', age(dob));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON public.preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stub for Alignment Score Calculation (to be expanded based on MAR logic)
CREATE OR REPLACE FUNCTION calculate_alignment_score(user_a UUID, user_b UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    shared_values INTEGER := 0;
    values_a TEXT[];
    values_b TEXT[];
BEGIN
    -- 1. Get custom values and basic compatibility traits
    DECLARE
        a_wants_kids TEXT; b_wants_kids TEXT;
        a_religion TEXT; b_religion TEXT;
        a_prompts_answered INTEGER; b_prompts_answered INTEGER;
    BEGIN
        SELECT top_values, wants_children, religion INTO values_a, a_wants_kids, a_religion FROM public.profiles WHERE user_id = user_a;
        SELECT top_values, wants_children, religion INTO values_b, b_wants_kids, b_religion FROM public.profiles WHERE user_id = user_b;
        
        -- 2. Calculate Top Values overlap (Array intersection)
        IF values_a IS NOT NULL AND values_b IS NOT NULL THEN
            SELECT count(*) INTO shared_values 
            FROM (SELECT unnest(values_a) INTERSECT SELECT unnest(values_b)) as overlap;
            
            score := score + (shared_values * 10);
        END IF;

        -- 3. Basic Compatibility Boosts
        IF a_wants_kids = b_wants_kids AND a_wants_kids IS NOT NULL THEN score := score + 10; END IF;
        IF a_religion = b_religion AND a_religion IS NOT NULL THEN score := score + 10; END IF;
        
        -- 4. Deeper Questions Engagement Score
        SELECT count(*) INTO a_prompts_answered FROM public.prompt_answers WHERE user_id = user_a;
        SELECT count(*) INTO b_prompts_answered FROM public.prompt_answers WHERE user_id = user_b;
        
        -- Give bonus points if both users have answered deeper questions (shows intentionality)
        score := score + (LEAST(a_prompts_answered, 5) * 2) + (LEAST(b_prompts_answered, 5) * 2);

        RETURN LEAST(GREATEST(score + 40, 0), 100); -- Normalize
    END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
