-- 03_extended_profiles.sql
-- Add basic compatibility fields to profiles
ALTER TABLE public.profiles
ADD COLUMN job_title TEXT,
ADD COLUMN education_level TEXT,
ADD COLUMN religion TEXT,
ADD COLUMN wants_family TEXT,
ADD COLUMN wants_children TEXT,
ADD COLUMN drinks_alcohol TEXT,
ADD COLUMN uses_drugs TEXT,
ADD COLUMN smokes_weed TEXT,
ADD COLUMN smokes_vapes TEXT,
ADD COLUMN lifestyle_habits TEXT;

-- Insert Deeper Questions into prompts table
INSERT INTO public.prompts (question, category) VALUES
('How do you handle conflict in a relationship?', 'Deeper Connection'),
('What does emotional maturity mean to you?', 'Deeper Connection'),
('What is your relationship mindset?', 'Intentions'),
('How would you describe your communication style?', 'Deeper Connection'),
('What are your biggest life goals right now?', 'Future Plans'),
('How do you define a successful partnership?', 'Values'),
('What role does family play in your future?', 'Future Plans'),
('What is a boundary you will not compromise on?', 'Values'),
('How do you show up for your partner during hard times?', 'Deeper Connection'),
('What is your definition of ambition?', 'Lifestyle');
