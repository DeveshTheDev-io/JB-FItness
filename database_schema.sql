-- Drop tables if they exist to allow clean re-runs
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS ai_plans CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS user_plans CASCADE;
DROP TABLE IF EXISTS plan_requests CASCADE;
DROP TABLE IF EXISTS trial_requests CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Create Members Table
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'member',
    plan TEXT DEFAULT 'Basic',
    status TEXT DEFAULT 'Active',
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create User Plans Table
CREATE TABLE user_plans (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    plan_name TEXT,
    months TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Plan Requests Table
CREATE TABLE plan_requests (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    plan_name TEXT,
    months TEXT,
    price TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Trial Requests Table
CREATE TABLE trial_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT,
    status TEXT,
    rating INTEGER DEFAULT 5,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Messages Table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI Plans Table
CREATE TABLE ai_plans (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    workout_plan TEXT,
    diet_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Dummy Data for Members
INSERT INTO members (name, email, phone, role, plan, status, join_date) VALUES 
('Admin', 'admin@jaibalaji.com', '1234567890', 'admin', 'Elite', 'Active', NOW() - INTERVAL '1 year'),
('John Doe', 'john@example.com', '9876543210', 'member', 'Pro', 'Active', NOW() - INTERVAL '3 months'),
('Jane Smith', 'jane@example.com', '9876543211', 'member', 'Basic', 'Active', NOW() - INTERVAL '1 month'),
('Michael Johnson', 'michael@example.com', '9876543212', 'member', 'Elite', 'Expired', NOW() - INTERVAL '1 year');

-- Insert Dummy Data for Attendance
INSERT INTO attendance (member_id, check_in_time) VALUES 
(2, NOW() - INTERVAL '1 hour'),
(3, NOW() - INTERVAL '3 hours'),
(2, NOW() - INTERVAL '1 day'),
(3, NOW() - INTERVAL '2 days'),
(4, NOW() - INTERVAL '6 months');

-- Insert Dummy Data for User Plans
INSERT INTO user_plans (user_email, plan_name, months, start_date, end_date, active) VALUES 
('john@example.com', '3 Months Pro', '3 Months', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '2 months', true),
('jane@example.com', '1 Month Basic', '1 Month', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', true),
('michael@example.com', '1 Year Elite', '1 Year', CURRENT_DATE - INTERVAL '13 months', CURRENT_DATE - INTERVAL '1 month', false);

-- Insert Dummy Data for Plan Requests
INSERT INTO plan_requests (user_email, plan_name, months, price, status) VALUES 
('jane@example.com', '6 Months Pro', '6 Months', '₹9,000', 'pending');

-- Insert Dummy Data for Trial Requests
INSERT INTO trial_requests (name, phone, email, status) VALUES 
('Alex Walker', '5551234567', 'alex@example.com', 'pending'),
('Sarah Connor', '5559876543', 'sarah@example.com', 'approved');

-- Insert Dummy Data for Reviews
INSERT INTO reviews (name, gender, status, rating, text) VALUES 
('Arjun Verma', 'Male', 'Member', 5, 'The equipment at Jai Balaji is unmatched. The environment pushes you to your absolute limits.'),
('Priya Sharma', 'Female', 'Member', 5, 'Love the AI features! The smart planner completely changed my workout routine.'),
('Vikas Patel', 'Male', 'Past Member', 4, 'The community here is incredible. Professional coaches and state-of-the-art facilities.');

-- Insert Dummy Data for Messages
INSERT INTO messages (user_email, title, message, is_read) VALUES 
('john@example.com', 'Welcome!', 'Welcome to Jai Balaji Fitness. We are glad to have you here.', true),
('jane@example.com', 'Plan Expiring Soon', 'Your Basic plan is expiring in 20 days. Consider renewing it to maintain access.', false);

-- Insert Dummy Data for AI Plans
INSERT INTO ai_plans (member_id, workout_plan, diet_plan) VALUES 
(2, '{"day1": "Chest and Triceps", "day2": "Back and Biceps"}', '{"breakfast": "Oats and Protein", "lunch": "Chicken Breast and Rice"}');
