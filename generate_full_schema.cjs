const fs = require('fs');
let schema = fs.readFileSync('schema.sql', 'utf8');

const workoutLogsTable = `

-- 11. Workout Logs (Tracking daily sets/reps)
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES public.members(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    weight DECIMAL NOT NULL,
    reps INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
`;

schema = schema + workoutLogsTable;
fs.writeFileSync('full_schema.sql', schema);
