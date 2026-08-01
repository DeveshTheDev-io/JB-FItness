-- Drop existing tables to avoid type conflicts
DROP TABLE IF EXISTS public.plan_features CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.coaches CASCADE;
DROP TABLE IF EXISTS public.ai_features CASCADE;
DROP TABLE IF EXISTS public.plan_requests CASCADE;
DROP TABLE IF EXISTS public.user_plans CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.trial_requests CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;

-- 1. Create Plans table
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    months TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT NOT NULL,
    is_ai_powered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Plan Features table (for list of features inside each plan)
CREATE TABLE IF NOT EXISTS public.plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
    feature_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create AI Features table
CREATE TABLE IF NOT EXISTS public.ai_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_emoji TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Members table
CREATE TABLE IF NOT EXISTS public.members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    plan TEXT,
    status TEXT DEFAULT 'Active',
    visit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id SERIAL PRIMARY KEY,
    member_id INT,
    user_email TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Trial requests table
CREATE TABLE IF NOT EXISTS public.trial_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Plan Requests (Buying)
CREATE TABLE IF NOT EXISTS public.plan_requests (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    months TEXT NOT NULL,
    price TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. User Plans (Active plans for a user)
CREATE TABLE IF NOT EXISTS public.user_plans (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    months TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Messages (Push notifications for a user)
CREATE TABLE IF NOT EXISTS public.messages (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- DUMMY DATA INSERTS
-- ==========================================

-- Insert Plans
DO $$
DECLARE
    plan1_id UUID := gen_random_uuid();
    plan2_id UUID := gen_random_uuid();
    plan3_id UUID := gen_random_uuid();
    plan4_id UUID := gen_random_uuid();
    plan5_id UUID := gen_random_uuid();
    plan6_id UUID := gen_random_uuid();
    plan7_id UUID := gen_random_uuid();
    plan8_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.plans (id, months, price, description, is_ai_powered) VALUES
    (plan1_id, '1 Month', '₹2,000', 'Kickstart your fitness journey.', false),
    (plan2_id, '3 Months', '₹5,000', 'Perfect for short-term goals.', false),
    (plan3_id, '6 Months', '₹8,000', 'Best value for serious commitment.', false),
    (plan4_id, '12 Months', '₹13,000', 'Ultimate transformation package.', false),
    (plan5_id, '3 Months Pro', '₹6,000', 'Perfect for short-term goals.', true),
    (plan6_id, '6 Months Elite', '₹11,000', 'Best value for serious commitment.', true),
    (plan7_id, '9 Months Premium', '₹15,000', 'Advanced tracking and coaching.', true),
    (plan8_id, '1 Year Ultimate', '₹20,000', 'Ultimate transformation package.', true);

    -- Insert Plan Features
    INSERT INTO public.plan_features (plan_id, feature_text) VALUES
    (plan5_id, 'AI Gym Buddy Matcher'),
    (plan5_id, 'Basic AI Form Check'),
    (plan6_id, 'Full AI Suite'),
    (plan6_id, 'Snap & Count Diet'),
    (plan6_id, 'Smart AI Programming'),
    (plan7_id, 'Predictive Maintenance'),
    (plan7_id, 'AI Form Check Pro'),
    (plan7_id, 'Nutrition'),
    (plan8_id, 'All AI Features + Priority'),
    (plan8_id, 'Gamified Badges'),
    (plan8_id, '1-on-1 PT');
END $$;

-- Insert Coaches
INSERT INTO public.coaches (name, specialty, image_url) VALUES
('Sushant Agrawal', 'Powerlifting Specialist', 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Sushant.jpeg_202608011758.jpeg'),
('Nidhi Singh', 'Functional Training', 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Nidhi.jpeg_202608011801.jpeg'),
('Bhavendra', 'Bodybuilding Pro', 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/WhatsApp_Image_2026-08-01_at_5.15.01_202608011759.jpeg');

-- Insert AI Features
INSERT INTO public.ai_features (title, description, icon_emoji) VALUES
('Snap & Count AI Diet', 'Take a picture of your food. Gemini AI instantly estimates calories, protein, carbs, and fats directly to your log.', '📸'),
('AI Smart Programming', 'Hyper-personalized workout and diet generator based on your goals, injuries, and biometric feedback.', '🧠'),
('AI Gym Buddy Matcher', 'Find your perfect training partner. Our AI matches you based on goals and attendance times.', '🤝'),
('AI Form Check', 'Real-time biomechanics feedback using advanced computer vision to correct posture and prevent injuries.', '👁️'),
('AI Gym Receptionist', 'A 24/7 digital personal trainer that handles your class bookings, queries, and workout history instantly.', '🤖'),
('Gamified AI Achievements', 'Earn stunning, shareable badges for hitting milestones, calculated dynamically based on your progress logs.', '🏆'),
('Predictive Maintenance', 'Smart facility management predicting equipment faults before they happen based on member reports and usage.', '🔧'),
('AI Recovery Tracker', 'Connect your wearables. Our AI analyzes your sleep and strain to recommend optimal rest days and active recovery.', '⌚'),
('Smart Music Sync', 'The AI seamlessly syncs your workout tempo with curated playlists, dynamically changing BPM during intense sets.', '🎵');
