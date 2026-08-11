-- Run this in your Supabase SQL Editor if you don't already have the workout_logs table

CREATE TABLE IF NOT EXISTS public.workout_logs (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES public.members(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    weight DECIMAL NOT NULL,
    reps INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In order to use these tables directly with the anonymous key in the browser,
-- you can either define proper Row Level Security (RLS) policies or disable RLS for testing.
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;
