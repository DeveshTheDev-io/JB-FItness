-- Run this SQL in your Supabase SQL Editor

-- IMPORTANT FIX FOR SCHEMA CACHE ERROR:
-- If you are encountering "Could not find the 'email' column of 'members' in the schema cache"
-- Please run this exact command to add the email column to your existing members table:
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
-- Then reload the schema cache:
NOTIFY pgrst, reload_schema;

-- ==========================================
-- 1. Core Users & Admin Tables
-- ==========================================

-- Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- In a real app, never store plain text passwords. We are simulating basic auth.
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Official Admin Profile
INSERT INTO public.admins (username, password_hash, role)
VALUES ('admin', 'admin123', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Members Table (Users)
CREATE TABLE IF NOT EXISTS public.members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    plan TEXT NOT NULL DEFAULT 'Basic', -- e.g., 'Basic', 'Pro', 'Elite'
    status TEXT NOT NULL DEFAULT 'Active', -- e.g., 'Active', 'Expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. Gym Operations (Admin Panel Data)
-- ==========================================

-- Trial Requests Table
CREATE TABLE IF NOT EXISTS public.trial_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'converted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Attendance (Check-ins) Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES public.members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. Member Features (Smart Tracker, Preferences)
-- ==========================================

-- Member Preferences & Goals
CREATE TABLE IF NOT EXISTS public.member_preferences (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
    fitness_goal TEXT,
    current_weight DECIMAL,
    dietary_preference TEXT DEFAULT 'Any',
    experience_level TEXT DEFAULT 'Beginner',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI Generated Plans (Saved Smart Plans)
CREATE TABLE IF NOT EXISTS public.ai_plans (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES public.members(id) ON DELETE CASCADE,
    workout_plan JSONB NOT NULL, -- Stores the JSON array of weekly workouts
    diet_plan JSONB NOT NULL,    -- Stores the JSON object for daily diet
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Workout Logs (Tracking daily sets/reps)
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES public.members(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    weight DECIMAL NOT NULL,
    reps INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Policies & Security
-- ==========================================
-- Note: In order to use these tables directly with the anonymous key in the browser, 
-- you can either define proper Row Level Security (RLS) policies or disable RLS for testing.
-- Disabling RLS is NOT recommended for production, but allows rapid prototyping:

ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;

-- Dues & Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES public.members(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- e.g., 'Paid', 'Pending', 'Overdue'
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Disable RLS for payments as well for testing
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
