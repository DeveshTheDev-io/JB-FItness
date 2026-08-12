const fs = require('fs');
let code = fs.readFileSync('schema.sql', 'utf8');
code = code.replace(
  "visit TEXT,",
  "visit TEXT,\n    gender TEXT,\n    photo_url TEXT,\n    dob TEXT,\n    phone TEXT,\n    address TEXT,\n    streak_count INTEGER DEFAULT 0,\n    last_workout_date DATE,\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),"
);
fs.writeFileSync('schema.sql', code);

let updatedCode = fs.readFileSync('updated_schema.sql', 'utf8');
updatedCode = updatedCode.replace(
  "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address TEXT;",
  "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address TEXT;\nALTER TABLE public.members ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;\nALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_workout_date DATE;"
);
fs.writeFileSync('updated_schema.sql', updatedCode);

let fullCode = fs.readFileSync('full_schema.sql', 'utf8');
fullCode = fullCode.replace(
  "visit TEXT,",
  "visit TEXT,\n    gender TEXT,\n    photo_url TEXT,\n    dob TEXT,\n    phone TEXT,\n    address TEXT,\n    streak_count INTEGER DEFAULT 0,\n    last_workout_date DATE,\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),"
);
fs.writeFileSync('full_schema.sql', fullCode);
