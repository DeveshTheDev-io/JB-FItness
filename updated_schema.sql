-- Drop existing tables to avoid type conflicts (WARNING: This deletes data)
-- If you want to keep data, just run the ALTER TABLE statements below.
-- DROP TABLE IF EXISTS public.members CASCADE;

-- 1. Create Plans table
CREATE TABLE IF NOT EXISTS public.plans (
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

-- 5. Members table (UPDATED)
CREATE TABLE IF NOT EXISTS public.members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    plan TEXT,
    status TEXT DEFAULT 'Active',
    visit TEXT,
    gender TEXT,
    photo_url TEXT,
    dob TEXT,
    phone TEXT,
    address TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
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
-- UPDATE EXISTING MEMBERS TABLE (Run these if you don't want to drop the table)
-- ==========================================
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
