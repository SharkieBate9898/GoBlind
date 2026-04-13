-- Migration to add automatic matching on mutual likes
-- Creates a trigger on the likes table to check for reverse likes

-- 1. Create the function that will be attached to the trigger
CREATE OR REPLACE FUNCTION public.check_for_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
    reverse_like_exists BOOLEAN;
    new_match_id UUID;
BEGIN
    -- Check if the receiver has already liked the sender
    SELECT EXISTS (
        SELECT 1
        FROM public.likes
        WHERE sender_id = NEW.receiver_id
        AND receiver_id = NEW.sender_id
    ) INTO reverse_like_exists;

    -- If a reverse like exists, create a match
    IF reverse_like_exists THEN
        -- Check if a match already exists to prevent duplicates
        IF NOT EXISTS (
            SELECT 1
            FROM public.matches
            WHERE (user_one_id = NEW.sender_id AND user_two_id = NEW.receiver_id)
               OR (user_one_id = NEW.receiver_id AND user_two_id = NEW.sender_id)
        ) THEN
            -- Create the match (using the stubbed alignment score calculation)
            INSERT INTO public.matches (user_one_id, user_two_id, alignment_score)
            VALUES (
                NEW.sender_id,
                NEW.receiver_id,
                public.calculate_alignment_score(NEW.sender_id, NEW.receiver_id)
            )
            RETURNING id INTO new_match_id;

            -- Create the conversation for the match
            INSERT INTO public.conversations (match_id)
            VALUES (new_match_id);
            
            -- Optional: Add a system message or something indicating the match
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the trigger if it already exists (for idempotency during development)
DROP TRIGGER IF EXISTS trigger_check_mutual_like ON public.likes;

-- 3. Create the trigger
CREATE TRIGGER trigger_check_mutual_like
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.check_for_mutual_like();
